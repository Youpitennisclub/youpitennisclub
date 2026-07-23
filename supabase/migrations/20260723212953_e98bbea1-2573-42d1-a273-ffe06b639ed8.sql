
DROP VIEW IF EXISTS public.bookings_public;

REVOKE ALL ON FUNCTION public.enforce_booking_capacity() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_public_bookings(from_ts timestamptz)
RETURNS TABLE(starts_at timestamptz, level public.tennis_level, first_name text, last_initials text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.starts_at, b.level, b.first_name, substr(b.last_name, 1, 2) AS last_initials
  FROM public.bookings b
  WHERE b.starts_at >= from_ts
  ORDER BY b.starts_at ASC;
$$;

REVOKE ALL ON FUNCTION public.get_public_bookings(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_bookings(timestamptz) TO anon, authenticated;

-- Tighten the insert policy: require required fields are present and non-empty
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(first_name)) > 0
    AND length(btrim(last_name)) > 0
    AND length(btrim(email)) > 3
    AND length(btrim(phone)) > 3
    AND starts_at > now()
  );
