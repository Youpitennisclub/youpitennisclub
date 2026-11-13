CREATE OR REPLACE FUNCTION public.booking_email(b bookings, kind text, n integer)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE details text; title text; intro text;
BEGIN
 title:=CASE kind WHEN 'confirmed' THEN 'SESSION CONFIRMED ✅' WHEN 'waiting' THEN 'BOOKING RECEIVED 🎾' WHEN 'unconfirmed' THEN 'SESSION NO LONGER CONFIRMED' WHEN 'expired' THEN 'SESSION CANCELLED — not enough players' WHEN 'cancelled_due' THEN 'CANCELLATION — payment remains due' WHEN 'replacement' THEN 'REPLACEMENT FOUND — no payment due' ELSE 'CANCELLATION CONFIRMED' END;
 intro:=CASE kind WHEN 'confirmed' THEN 'Great news — your session is confirmed! 🎉' WHEN 'waiting' THEN 'Your spot is reserved!' ELSE 'Here is an update about your session.' END;
 details:='Hi ' || b.first_name || ',' || E'\n\n' || intro || E'\n\n'
  || '📅 ' || to_char(b.starts_at AT TIME ZONE 'Europe/Berlin','FMDay DD FMMonth YYYY') || E'\n'
  || '🕐 ' || to_char(b.starts_at AT TIME ZONE 'Europe/Berlin','HH24:MI') || ' (Berlin time)' || E'\n'
  || '📍 ' || CASE b.venue WHEN 'alemannia' THEN 'BFC Alemannia' ELSE 'TC Longline' END || E'\n'
  || '⏱ ' || b.duration || ' min · ' || initcap(replace(b.level::text,'_',' ')) || E'\n'
  || '👥 Currently ' || n || '/4 players';
 IF kind IN ('confirmed','waiting') THEN
  details:=details || E'\n\n'
   || CASE WHEN n<2 THEN 'Your session will be confirmed as soon as 1 more player joins.' WHEN n<4 THEN 'Up to ' || (4-n) || ' more player' || CASE WHEN 4-n>1 THEN 's' ELSE '' END || ' can still join.' ELSE 'Your group is full.' END
   || E'\nThe more players join → the lower the price:\n\n'
   || '• 2 players → €' || (public.booking_unit_price(b,2)/100.0)::text || E'\n'
   || '• 3 players → €' || (public.booking_unit_price(b,3)/100.0)::text || E'\n'
   || '• 4 players → €' || (public.booking_unit_price(b,4)/100.0)::text
   || CASE WHEN n<4 THEN E'\n\n👉 Invite a friend to fill the group faster and pay less!' ELSE '' END
   || E'\n\nCancellation is free up to 48 hours before. Bookings made less than 48 hours before are binding immediately.';
 ELSIF kind='unconfirmed' THEN details:=details || E'\n\nYour group has dropped below 2 players and is no longer confirmed. You can wait for another player or cancel at no cost in My bookings. If only 1 player is booked 24 hours before the session, it will be cancelled automatically.';
 ELSIF kind='expired' THEN details:=details || E'\n\nOnly 1 player was booked at the 24-hour deadline. This session is cancelled at no cost. Any credits charged have been refunded.';
 ELSIF kind='cancelled_due' THEN details:=details || E'\n\nYour spot is released. Cancellation is within 48 hours, so the session remains due unless another player takes your place.';
 ELSE details:=details || E'\n\nNo payment is due. Any credits charged have been refunded.'; END IF;
 details:=details || E'\n\nSee you on court,\nYoupi Tennis Club';
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES(b.email,title || ' — Youpi Tennis Club',details);
END $function$;

CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hour integer NOT NULL CHECK (hour IN (15,16,17)),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  partner_discount boolean NOT NULL DEFAULT false,
  price_cents integer NOT NULL,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tournament_registrations TO service_role;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX tournament_one_per_user ON public.tournament_registrations(user_id) WHERE cancelled_at IS NULL;

CREATE OR REPLACE FUNCTION public.tournament_spots()
 RETURNS TABLE(hour integer, taken integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT h, (SELECT count(*)::int FROM public.tournament_registrations r WHERE r.hour=h AND r.cancelled_at IS NULL) FROM unnest(ARRAY[15,16,17]) h $$;
REVOKE ALL ON FUNCTION public.tournament_spots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tournament_spots() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.join_tournament(p jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE h integer := (p->>'hour')::int; taken integer; price integer; r public.tournament_registrations;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('tournament-2027-01-30'));
 IF EXISTS(SELECT 1 FROM public.tournament_registrations WHERE user_id=(p->>'user_id')::uuid AND cancelled_at IS NULL) THEN RETURN jsonb_build_object('ok',false,'error','already'); END IF;
 SELECT count(*) INTO taken FROM public.tournament_registrations WHERE hour=h AND cancelled_at IS NULL;
 IF taken>=8 THEN RETURN jsonb_build_object('ok',false,'error','full'); END IF;
 price := CASE WHEN (p->>'partner_discount')::boolean THEN 1800 ELSE 2500 END;
 INSERT INTO public.tournament_registrations(user_id,hour,first_name,last_name,email,partner_discount,price_cents)
 VALUES((p->>'user_id')::uuid,h,p->>'first_name',p->>'last_name',p->>'email',(p->>'partner_discount')::boolean,price) RETURNING * INTO r;
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES(r.email,'TOURNAMENT SPOT RESERVED 🎾 — Youpi Tennis Club',
  'Hi ' || r.first_name || E',\n\nYour tournament spot is reserved! 🔥\n\n📅 Saturday 30 January 2027\n🕐 ' || h || ':00–' || (h+1) || E':00 (Berlin time)\n📍 Youpi Tennis Club tournament\n💰 €' || (price/100) || E' per player\n\n💳 Please pay in advance before 15 January 2027 by bank transfer (IBAN DE84 1001 1001 2694 8756 79, Youcef Chaouch, reference: ' || r.first_name || ' ' || r.last_name || E' Tournament).\n\n🕒 Free cancellation up to 48 hours before the tournament.\n\n👉 Invite a friend — first come, first booked!\n\nSee you on court,\nYoupi Tennis Club');
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','TOURNAMENT — ' || r.first_name || ' ' || r.last_name, h || ':00 · €' || (price/100) || ' · ' || r.email);
 RETURN jsonb_build_object('ok',true,'price_cents',price);
END $$;
REVOKE ALL ON FUNCTION public.join_tournament(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_tournament(jsonb) TO service_role;