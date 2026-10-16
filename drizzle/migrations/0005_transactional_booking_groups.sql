-- lovable-cron-fallback-reviewed: required 24h expiry with one-minute maximum delay; wake on booking/queue insertion and unschedule when drained, no delayed workflow provider is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS free_cancel_override boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_due boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS replacement_resolved boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price_two integer;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price_three integer;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price_four integer;
CREATE TABLE public.booking_closed_slots (starts_at timestamptz NOT NULL, venue text NOT NULL, PRIMARY KEY(starts_at, venue));
GRANT ALL ON public.booking_closed_slots TO service_role;
ALTER TABLE public.booking_closed_slots ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.booking_notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), recipient text NOT NULL, subject text NOT NULL, body text NOT NULL, sent_at timestamptz, attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), locked_until timestamptz);
GRANT ALL ON public.booking_notifications TO service_role;
ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.booking_delivery_config (id boolean PRIMARY KEY DEFAULT true CHECK(id), callback_url text NOT NULL, secret text NOT NULL);
GRANT ALL ON public.booking_delivery_config TO service_role;
ALTER TABLE public.booking_delivery_config ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.booking_group_key(l public.tennis_level) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE WHEN l::text IN ('intermediate','advanced') THEN 'intermediate_advanced' ELSE l::text END $$;
CREATE OR REPLACE FUNCTION public.enforce_booking_capacity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.starts_at::text || NEW.venue, 0));
 IF NEW.starts_at < now() + interval '3 hours' THEN RAISE EXCEPTION 'BOOKING_CLOSED'; END IF;
 IF EXISTS (SELECT 1 FROM public.booking_closed_slots WHERE starts_at=NEW.starts_at AND venue=NEW.venue) THEN RAISE EXCEPTION 'SLOT_CANCELLED'; END IF;
 IF (SELECT count(*) FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL) >= 4 THEN RAISE EXCEPTION 'This slot is fully booked'; END IF;
 IF EXISTS (SELECT 1 FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL AND user_id=NEW.user_id) THEN RAISE EXCEPTION 'ALREADY_BOOKED'; END IF;
 IF EXISTS (SELECT 1 FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL AND public.booking_group_key(level)<>public.booking_group_key(NEW.level)) THEN RAISE EXCEPTION 'LEVEL_MISMATCH'; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.booking_unit_price(b public.bookings, n integer) RETURNS integer LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE h integer; outdoor boolean; base integer;
BEGIN
 IF b.price_two IS NOT NULL THEN RETURN CASE WHEN n>=4 THEN b.price_four WHEN n=3 THEN b.price_three ELSE b.price_two END; END IF;
 h:=extract(hour FROM b.starts_at AT TIME ZONE 'Europe/Berlin');
 outdoor:=b.venue='alemannia' AND (b.starts_at AT TIME ZONE 'Europe/Berlin')::date<='2026-10-24' AND (b.starts_at AT TIME ZONE 'Europe/Berlin')::date<>'2026-10-08' AND NOT ((b.starts_at AT TIME ZONE 'Europe/Berlin')::date='2026-10-07' AND h>=21) AND NOT ((b.starts_at AT TIME ZONE 'Europe/Berlin')::date IN ('2026-10-20','2026-10-21') AND h>=18);
 IF outdoor THEN base:=CASE WHEN n>=4 THEN 17 WHEN n=3 THEN 19 ELSE 25 END;
 ELSIF b.venue='longline' THEN base:=CASE WHEN n>=4 THEN 25 WHEN n=3 THEN 31 ELSE 39 END + CASE WHEN h>=16 THEN 2 ELSE 0 END;
 ELSE base:=CASE WHEN n>=4 THEN 24 WHEN n=3 THEN 30 ELSE 37 END + CASE WHEN h>=16 THEN 2 ELSE 0 END;
 END IF;
 RETURN round((base + CASE WHEN b.venue='alemannia' AND b.non_member THEN 2 ELSE 0 END)*100*b.duration/60.0);
END $$;
CREATE OR REPLACE FUNCTION public.booking_email(b public.bookings, kind text, n integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE details text; title text;
BEGIN
 title:=CASE kind WHEN 'confirmed' THEN 'RESERVATION CONFIRMED' WHEN 'waiting' THEN 'BOOKING RECEIVED — waiting for players' WHEN 'unconfirmed' THEN 'SESSION NO LONGER CONFIRMED' WHEN 'expired' THEN 'SESSION CANCELLED — not enough players' WHEN 'cancelled_due' THEN 'CANCELLATION — payment remains due' WHEN 'replacement' THEN 'REPLACEMENT FOUND — no payment due' ELSE 'CANCELLATION CONFIRMED' END;
 details:=to_char(b.starts_at AT TIME ZONE 'Europe/Berlin','FMDay DD FMMonth YYYY HH24:MI') || ' (Berlin time)' || E'\n' || CASE b.venue WHEN 'alemannia' THEN 'BFC Alemannia' ELSE 'TC Longline' END || E'\n' || b.duration || ' minutes · ' || replace(b.level::text,'_',' ') || ' · ' || n || '/4 players';
 IF kind IN ('confirmed','waiting') THEN
 details:=details || E'\nPrice per person: 2 players €' || (public.booking_unit_price(b,2)/100.0)::text || ' · 3 players €' || (public.booking_unit_price(b,3)/100.0)::text || ' · 4 players €' || (public.booking_unit_price(b,4)/100.0)::text || E'\n\nBooking received. Your session takes place as soon as 2 players of your level have joined, and you will get a confirmation email. Up to 2 more players can still join, and the price per person drops with each new player. Cancellation is free up to 48 hours before the session. Bookings made less than 48 hours before are binding immediately.';
 ELSIF kind='unconfirmed' THEN details:=details || E'\nYour group has dropped below 2 players and is no longer confirmed. You can wait for another player or cancel at no cost in My bookings. If only 1 player is booked 24 hours before the session, it will be cancelled automatically.';
 ELSIF kind='expired' THEN details:=details || E'\nOnly 1 player was booked at the 24-hour deadline. This session is cancelled at no cost. Any credits charged have been refunded.';
 ELSIF kind='cancelled_due' THEN details:=details || E'\nYour spot is released. Cancellation is within 48 hours, so the session remains due unless another player takes your place.';
 ELSE details:=details || E'\nNo payment is due. Any credits charged have been refunded.'; END IF;
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES(b.email,title || ' — Youpi Tennis Club',details);
END $$;
CREATE OR REPLACE FUNCTION public.reconcile_booking_slot(t timestamptz, v text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.bookings; n integer; price integer; balance integer; was_confirmed boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(t::text || v,0));
 FOR b IN SELECT * FROM public.bookings WHERE starts_at=t AND venue=v AND cancelled_at IS NULL ORDER BY id FOR UPDATE LOOP
  SELECT count(*) INTO n FROM public.bookings WHERE starts_at=t AND venue=v AND cancelled_at IS NULL AND public.booking_group_key(level)=public.booking_group_key(b.level);
  was_confirmed:=b.confirmed_at IS NOT NULL;
  IF n<2 THEN
   IF b.charged_cents>0 AND b.user_id IS NOT NULL THEN PERFORM public.apply_credit(b.user_id,b.charged_cents,'Refund — group no longer confirmed',b.id); END IF;
   UPDATE public.bookings SET confirmed_at=NULL, charged_cents=0, free_cancel_override=free_cancel_override OR was_confirmed WHERE id=b.id;
   IF was_confirmed THEN PERFORM public.booking_email(b,'unconfirmed',n); END IF;
  ELSE
   price:=public.booking_unit_price(b,n);
   IF b.user_id IS NOT NULL THEN
    INSERT INTO public.student_credits(user_id,balance_cents) VALUES(b.user_id,0) ON CONFLICT DO NOTHING;
    SELECT balance_cents INTO balance FROM public.student_credits WHERE user_id=b.user_id FOR UPDATE;
    IF b.charged_cents>price THEN PERFORM public.apply_credit(b.user_id,b.charged_cents-price,'Group price decreased',b.id); b.charged_cents:=price;
    ELSIF b.charged_cents>0 AND balance>=price-b.charged_cents THEN PERFORM public.apply_credit(b.user_id,b.charged_cents-price,'Group price adjusted',b.id); b.charged_cents:=price;
    ELSIF b.charged_cents>0 THEN PERFORM public.apply_credit(b.user_id,b.charged_cents,'Refund — pay session after training',b.id); b.charged_cents:=0;
    ELSIF balance>=price THEN PERFORM public.apply_credit(b.user_id,-price,'Confirmed session',b.id); b.charged_cents:=price; END IF;
   END IF;
   UPDATE public.bookings SET confirmed_at=coalesce(confirmed_at,now()),charged_cents=b.charged_cents,free_cancel_override=false WHERE id=b.id;
   IF NOT was_confirmed THEN PERFORM public.booking_email(b,'confirmed',n); END IF;
  END IF;
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.create_booking_v2(p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.bookings; old public.bookings; n integer;
BEGIN
 INSERT INTO public.bookings(starts_at,level,venue,first_name,last_name,email,phone,photo_url,user_id,non_member,duration,price_two,price_three,price_four)
 VALUES((p->>'starts_at')::timestamptz,(p->>'level')::public.tennis_level,p->>'venue',p->>'first_name',p->>'last_name',p->>'email',p->>'phone',p->>'photo_url',(p->>'user_id')::uuid,(p->>'non_member')::boolean,(p->>'duration')::integer,(p->>'price_two')::integer,(p->>'price_three')::integer,(p->>'price_four')::integer) RETURNING * INTO b;
 SELECT * INTO old FROM public.bookings WHERE starts_at=b.starts_at AND venue=b.venue AND cancelled_at IS NOT NULL AND payment_due AND NOT replacement_resolved AND public.booking_group_key(level)=public.booking_group_key(b.level) ORDER BY cancelled_at LIMIT 1 FOR UPDATE;
 IF FOUND THEN
  IF old.user_id IS NOT NULL AND old.charged_cents>0 THEN PERFORM public.apply_credit(old.user_id,old.charged_cents,'Refund — replacement joined',old.id); END IF;
  UPDATE public.bookings SET payment_due=false,replacement_resolved=true,charged_cents=0 WHERE id=old.id;
  PERFORM public.booking_email(old,'replacement',0);
 END IF;
 PERFORM public.reconcile_booking_slot(b.starts_at,b.venue);
 SELECT * INTO b FROM public.bookings WHERE id=b.id;
 SELECT count(*) INTO n FROM public.bookings WHERE starts_at=b.starts_at AND venue=b.venue AND cancelled_at IS NULL;
 IF b.confirmed_at IS NULL THEN PERFORM public.booking_email(b,'waiting',n); END IF;
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','BOOKING — ' || b.first_name || ' ' || b.last_name, b.starts_at::text || ' · ' || b.venue || ' · ' || n || '/4 · ' || b.email || ' · ' || b.phone);
 RETURN jsonb_build_object('ok',true,'id',b.id,'confirmed',b.confirmed_at IS NOT NULL,'count',n,'paidFromCredits',b.charged_cents>0);
END $$;
CREATE OR REPLACE FUNCTION public.cancel_booking_v2(booking_id uuid, owner_id uuid DEFAULT NULL, token uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.bookings; free boolean;
BEGIN
 SELECT * INTO b FROM public.bookings WHERE id=booking_id;
 IF NOT FOUND OR NOT ((owner_id IS NOT NULL AND b.user_id=owner_id) OR (token IS NOT NULL AND token=b.cancel_token)) THEN RETURN jsonb_build_object('status','invalid'); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(b.starts_at::text || b.venue,0));
 SELECT * INTO b FROM public.bookings WHERE id=booking_id FOR UPDATE;
 IF b.cancelled_at IS NOT NULL THEN RETURN jsonb_build_object('status','already','starts_at',b.starts_at); END IF;
 IF b.starts_at<=now() THEN RETURN jsonb_build_object('status','too_late','starts_at',b.starts_at); END IF;
 free:=b.free_cancel_override OR b.starts_at>=now()+interval '48 hours';
 IF free AND b.charged_cents>0 AND b.user_id IS NOT NULL THEN PERFORM public.apply_credit(b.user_id,b.charged_cents,'Refund — cancelled session',b.id); END IF;
 UPDATE public.bookings SET cancelled_at=now(),payment_due=NOT free,charged_cents=CASE WHEN free THEN 0 ELSE charged_cents END WHERE id=b.id;
 PERFORM public.booking_email(b,CASE WHEN free THEN 'cancelled' ELSE 'cancelled_due' END,0);
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','CANCELLATION — '||b.first_name||' '||b.last_name,b.starts_at::text || ' · ' || b.venue || CASE WHEN free THEN ' · free cancellation' ELSE ' · payment due unless replaced' END);
 PERFORM public.reconcile_booking_slot(b.starts_at,b.venue);
 RETURN jsonb_build_object('status',CASE WHEN free THEN 'cancelled' ELSE 'cancelled_due' END,'starts_at',b.starts_at);
END $$;
CREATE OR REPLACE FUNCTION public.expire_lone_bookings() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s record; b public.bookings;
BEGIN
 FOR s IN SELECT starts_at,venue FROM public.bookings WHERE cancelled_at IS NULL AND starts_at<=now()+interval '24 hours' AND starts_at>now() GROUP BY starts_at,venue HAVING count(*)=1 LOOP
  PERFORM pg_advisory_xact_lock(hashtextextended(s.starts_at::text || s.venue,0));
  IF (SELECT count(*) FROM public.bookings WHERE starts_at=s.starts_at AND venue=s.venue AND cancelled_at IS NULL)<>1 THEN CONTINUE; END IF;
  SELECT * INTO b FROM public.bookings WHERE starts_at=s.starts_at AND venue=s.venue AND cancelled_at IS NULL FOR UPDATE;
  IF b.charged_cents>0 AND b.user_id IS NOT NULL THEN PERFORM public.apply_credit(b.user_id,b.charged_cents,'Refund — session underfilled at 24 hours',b.id); END IF;
  UPDATE public.bookings SET cancelled_at=now(),charged_cents=0,payment_due=false WHERE id=b.id;
  INSERT INTO public.booking_closed_slots(starts_at,venue) VALUES(b.starts_at,b.venue) ON CONFLICT DO NOTHING;
  PERFORM public.booking_email(b,'expired',1);
  INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','SESSION CANCELLED — not enough players',b.starts_at::text || ' · ' || b.venue || ' · ' || b.first_name || ' ' || b.last_name);
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE cancelled_at IS NULL AND starts_at>now()) AND NOT EXISTS(SELECT 1 FROM public.booking_notifications WHERE sent_at IS NULL) THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='booking-lifecycle';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.wake_booking_lifecycle() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cfg public.booking_delivery_config;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='booking-lifecycle') THEN PERFORM cron.schedule('booking-lifecycle','* * * * *','SELECT public.expire_lone_bookings()'); END IF;
 IF TG_TABLE_NAME='booking_notifications' THEN
  SELECT * INTO cfg FROM public.booking_delivery_config WHERE id;
  IF FOUND THEN PERFORM net.http_post(url:=cfg.callback_url,headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||cfg.secret),body:='{}'::jsonb); END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER booking_wake_after_insert AFTER INSERT ON public.bookings FOR EACH STATEMENT EXECUTE FUNCTION public.wake_booking_lifecycle();
CREATE TRIGGER booking_notification_wake AFTER INSERT ON public.booking_notifications FOR EACH STATEMENT EXECUTE FUNCTION public.wake_booking_lifecycle();
CREATE OR REPLACE FUNCTION public.claim_booking_notifications() RETURNS SETOF public.booking_notifications LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 UPDATE public.booking_notifications SET locked_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id IN (SELECT id FROM public.booking_notifications WHERE sent_at IS NULL AND next_attempt_at<=now() AND (locked_until IS NULL OR locked_until<now()) ORDER BY next_attempt_at LIMIT 20 FOR UPDATE SKIP LOCKED) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.create_booking_v2(jsonb), public.cancel_booking_v2(uuid,uuid,uuid), public.reconcile_booking_slot(timestamptz,text), public.expire_lone_bookings(), public.booking_email(public.bookings,text,integer), public.wake_booking_lifecycle(), public.claim_booking_notifications(), public.enforce_booking_capacity() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking_v2(jsonb), public.cancel_booking_v2(uuid,uuid,uuid), public.reconcile_booking_slot(timestamptz,text), public.expire_lone_bookings(), public.booking_email(public.bookings,text,integer), public.wake_booking_lifecycle(), public.claim_booking_notifications(), public.enforce_booking_capacity() TO service_role;