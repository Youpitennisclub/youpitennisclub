ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
UPDATE public.bookings SET confirmed_at = created_at WHERE confirmed_at IS NULL;
DROP FUNCTION IF EXISTS public.get_public_bookings(timestamptz);
CREATE FUNCTION public.get_public_bookings(from_ts timestamptz)
RETURNS TABLE(starts_at timestamptz, level tennis_level, first_name text, last_initials text, photo_url text, confirmed boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT b.starts_at, b.level, b.first_name, upper(left(b.last_name, 2)), b.photo_url, b.confirmed_at IS NOT NULL
  FROM public.bookings b
  WHERE b.starts_at >= from_ts AND b.cancelled_at IS NULL
  ORDER BY b.starts_at
$$;
GRANT EXECUTE ON FUNCTION public.get_public_bookings(timestamptz) TO anon, authenticated;