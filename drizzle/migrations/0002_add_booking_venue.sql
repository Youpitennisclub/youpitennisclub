-- Each booking now stores which club it takes place at.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS venue text NOT NULL DEFAULT 'alemannia';

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_venue_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_venue_check CHECK (venue IN ('alemannia', 'longline'));

-- Backfill: Friday sessions and late Saturday sessions were TC Longline.
UPDATE public.bookings b
SET venue = 'longline'
WHERE b.venue = 'alemannia'
  AND (
    (extract(dow from b.starts_at at time zone 'Europe/Berlin')::int = 5)
    OR (
      extract(dow from b.starts_at at time zone 'Europe/Berlin')::int = 6
      AND extract(hour from b.starts_at at time zone 'Europe/Berlin')::int >= 15
    )
  );

CREATE INDEX IF NOT EXISTS bookings_slot_venue_idx
  ON public.bookings (starts_at, venue);

-- Capacity is now enforced per club, not per hour across clubs.
CREATE OR REPLACE FUNCTION public.enforce_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (SELECT count(*) FROM public.bookings b
      WHERE b.starts_at = NEW.starts_at
        AND b.venue = NEW.venue
        AND b.cancelled_at IS NULL) >= 6 THEN
    RAISE EXCEPTION 'This slot is fully booked';
  END IF;
  RETURN NEW;
END;
$$;

-- Public feed now exposes the club of each session.
DROP FUNCTION IF EXISTS public.get_public_bookings(timestamp with time zone);
CREATE FUNCTION public.get_public_bookings(from_ts timestamp with time zone)
RETURNS TABLE(starts_at timestamp with time zone, level tennis_level, first_name text, last_initials text, photo_url text, confirmed boolean, venue text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT b.starts_at,
         b.level,
         b.first_name,
         upper(left(b.last_name, 2)),
         b.photo_url,
         b.confirmed_at IS NOT NULL,
         b.venue
  FROM public.bookings b
  WHERE b.starts_at >= from_ts
    AND b.cancelled_at IS NULL
  ORDER BY b.starts_at
$$;

REVOKE ALL ON FUNCTION public.get_public_bookings(timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_bookings(timestamp with time zone) TO anon, authenticated;