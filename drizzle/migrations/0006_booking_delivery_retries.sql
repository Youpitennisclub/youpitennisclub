CREATE OR REPLACE FUNCTION public.retry_booking_notifications() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE cfg public.booking_delivery_config;
BEGIN
 SELECT * INTO cfg FROM public.booking_delivery_config WHERE id;
 IF FOUND AND EXISTS(SELECT 1 FROM public.booking_notifications WHERE sent_at IS NULL AND next_attempt_at<=now() AND (locked_until IS NULL OR locked_until<now())) THEN
  PERFORM net.http_post(url:=cfg.callback_url,headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||cfg.secret),body:='{}'::jsonb);
 END IF;
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
 PERFORM public.retry_booking_notifications();
 IF NOT EXISTS(SELECT 1 FROM public.bookings WHERE cancelled_at IS NULL AND starts_at>now()) AND NOT EXISTS(SELECT 1 FROM public.booking_notifications WHERE sent_at IS NULL) THEN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='booking-lifecycle';
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.retry_booking_notifications() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.retry_booking_notifications() TO service_role;
CREATE INDEX IF NOT EXISTS bookings_active_slot ON public.bookings(starts_at,venue) WHERE cancelled_at IS NULL;
CREATE INDEX IF NOT EXISTS booking_notifications_pending ON public.booking_notifications(next_attempt_at) WHERE sent_at IS NULL;