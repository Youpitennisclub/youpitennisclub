CREATE OR REPLACE FUNCTION public.enforce_booking_capacity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.starts_at::text || NEW.venue, 0));
 IF NEW.starts_at < now() + interval '3 hours' THEN RAISE EXCEPTION 'BOOKING_CLOSED'; END IF;
 IF EXISTS (SELECT 1 FROM public.booking_closed_slots WHERE starts_at=NEW.starts_at AND venue=NEW.venue) THEN RAISE EXCEPTION 'SLOT_CANCELLED'; END IF;
 SELECT count(*) INTO n FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL;
 IF n >= 4 THEN RAISE EXCEPTION 'This slot is fully booked'; END IF;
 IF n = 0 AND NEW.starts_at <= now() + interval '24 hours' THEN RAISE EXCEPTION 'LONE_TOO_LATE'; END IF;
 IF EXISTS (SELECT 1 FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL AND user_id=NEW.user_id) THEN RAISE EXCEPTION 'ALREADY_BOOKED'; END IF;
 IF EXISTS (SELECT 1 FROM public.bookings WHERE starts_at=NEW.starts_at AND venue=NEW.venue AND cancelled_at IS NULL AND public.booking_group_key(level)<>public.booking_group_key(NEW.level)) THEN RAISE EXCEPTION 'LEVEL_MISMATCH'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_booking_capacity() FROM PUBLIC,anon,authenticated;