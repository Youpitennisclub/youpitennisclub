CREATE OR REPLACE FUNCTION public.create_booking_v2(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','NEW BOOKING 🎾 — ' || b.first_name || ' ' || b.last_name,
  'NEW BOOKING 🎾' || E'\n\n'
  || '👤 Player: ' || b.first_name || ' ' || b.last_name || E'\n\n'
  || '📅 Date: ' || to_char(b.starts_at AT TIME ZONE 'Europe/Berlin','FMDay DD FMMonth YYYY') || E'\n\n'
  || '🕐 Time: ' || to_char(b.starts_at AT TIME ZONE 'Europe/Berlin','HH24:MI') || ' (Berlin time)' || E'\n\n'
  || '📍 Location: ' || CASE b.venue WHEN 'alemannia' THEN 'BFC Alemannia' ELSE 'TC Longline' END || E'\n\n'
  || '👥 Players: ' || n || '/4' || E'\n\n'
  || '📧 Email: ' || b.email || E'\n\n'
  || '📱 Phone: ' || b.phone);
 RETURN jsonb_build_object('ok',true,'id',b.id,'confirmed',b.confirmed_at IS NOT NULL,'count',n,'paidFromCredits',b.charged_cents>0);
END $function$;

CREATE OR REPLACE FUNCTION public.cancel_tournament(p_user uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.tournament_registrations;
BEGIN
 IF now() >= (timestamp '2027-01-15 15:00' AT TIME ZONE 'Europe/Berlin') THEN RETURN jsonb_build_object('ok',false,'error','too_late'); END IF;
 UPDATE public.tournament_registrations SET cancelled_at=now() WHERE user_id=p_user AND cancelled_at IS NULL RETURNING * INTO r;
 IF r.id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','none'); END IF;
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES(r.email,'TOURNAMENT CANCELLATION — Youpi Tennis Club','Hi ' || r.first_name || E',\n\nYour Tournament registration (30 January 2027) is cancelled.\n\nSee you on court,\nYoupi Tennis Club');
 INSERT INTO public.booking_notifications(recipient,subject,body) VALUES('youpitennisclub@gmail.com','TOURNAMENT CANCELLATION — ' || r.first_name || ' ' || r.last_name,'❌ ' || r.first_name || ' ' || r.last_name || ' cancelled the Tournament (30 January 2027).');
 RETURN jsonb_build_object('ok',true);
END $$;
REVOKE ALL ON FUNCTION public.cancel_tournament(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_tournament(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.my_tournament(p_user uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS(SELECT 1 FROM public.tournament_registrations WHERE user_id=p_user AND cancelled_at IS NULL) $$;
REVOKE ALL ON FUNCTION public.my_tournament(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_tournament(uuid) TO service_role;