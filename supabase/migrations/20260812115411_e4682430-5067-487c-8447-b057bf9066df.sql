ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancel_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE INDEX IF NOT EXISTS bookings_cancel_token_idx ON public.bookings (cancel_token);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON public.bookings (lower(email));

CREATE OR REPLACE FUNCTION public.get_public_bookings(from_ts timestamp with time zone)
RETURNS TABLE(starts_at timestamp with time zone, level tennis_level, first_name text, last_initials text, photo_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.starts_at,
         b.level,
         b.first_name,
         upper(left(b.last_name, 2)) AS last_initials,
         b.photo_url
  FROM public.bookings b
  WHERE b.starts_at >= from_ts
    AND b.cancelled_at IS NULL
  ORDER BY b.starts_at
$$;

CREATE OR REPLACE FUNCTION public.enforce_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.bookings b
      WHERE b.starts_at = NEW.starts_at AND b.cancelled_at IS NULL) >= 6 THEN
    RAISE EXCEPTION 'This slot is fully booked';
  END IF;
  RETURN NEW;
END;
$$;
