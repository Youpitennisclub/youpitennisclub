CREATE OR REPLACE FUNCTION public.join_tournament(p jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE taken integer; price integer; r public.tournament_registrations;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('tournament-2027-01-30'));
 IF EXISTS(SELECT 1 FROM public.tournament_registrations WHERE user_id=(p->>'user_id')::uuid AND cancelled_at IS NULL) THEN RETURN jsonb_build_object('ok',false,'error','already'); END IF;
 SELECT count(*) INTO taken FROM public.tournament_registrations WHERE cancelled_at IS NULL;
 IF taken>=24 THEN RETURN jsonb_build_object('ok',false,'error','full'); END IF;
 price := CASE WHEN (p->>'partner_discount')::boolean THEN 1800 ELSE 2500 END;
 INSERT INTO public.tournament_registrations(user_id,hour,first_name,last_name,email,partner_discount,price_cents)
 VALUES((p->>'user_id')::uuid,15,p->>'first_name',p->>'last_name',p->>'email',(p->>'partner_discount')::boolean,price) RETURNING * INTO r;
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES(r.email,'TOURNAMENT SPOT RESERVED 🎾 — Youpi Tennis Club',
  'Hi ' || r.first_name || E',\n\nYour tournament spot is reserved! 🔥\n\n📅 Saturday 30 January 2027\n🕐 15:00–18:00 (Berlin time)\n📍 Youpi Tennis Club tournament\n💰 €' || (price/100) || E' per player\n\n💳 Please pay in advance before 15 January 2027 by bank transfer (IBAN DE84 1001 1001 2694 8756 79, Youcef Chaouch, reference: ' || r.first_name || ' ' || r.last_name || E' Tournament).\n\n👉 Invite a friend — first come, first booked!\n\nSee you on court,\nYoupi Tennis Club');
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','TOURNAMENT — ' || r.first_name || ' ' || r.last_name, '15:00–18:00 · €' || (price/100) || ' · ' || r.email);
 RETURN jsonb_build_object('ok',true,'price_cents',price);
END $function$;

CREATE OR REPLACE FUNCTION public.tournament_players()
 RETURNS TABLE(first_name text, last_initial text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT r.first_name, left(r.last_name,1) FROM public.tournament_registrations r WHERE r.cancelled_at IS NULL ORDER BY r.created_at LIMIT 24 $$;
REVOKE ALL ON FUNCTION public.tournament_players() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tournament_players() TO service_role;