ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.feedback ADD COLUMN IF NOT EXISTS photo_url text;

DROP FUNCTION IF EXISTS public.get_public_bookings(timestamp with time zone);
CREATE FUNCTION public.get_public_bookings(from_ts timestamp with time zone)
RETURNS TABLE(starts_at timestamp with time zone, level tennis_level, first_name text, last_initials text, photo_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT b.starts_at, b.level, b.first_name, substr(b.last_name, 1, 1) AS last_initials, b.photo_url
  FROM public.bookings b
  WHERE b.starts_at >= from_ts
  ORDER BY b.starts_at ASC;
$$;

DROP FUNCTION IF EXISTS public.get_public_feedback();
CREATE FUNCTION public.get_public_feedback()
RETURNS TABLE(first_name text, last_initial text, rating integer, comment text, photo_url text, created_at timestamp with time zone)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT f.first_name, substr(coalesce(f.last_name, ''), 1, 1) AS last_initial, f.rating, f.comment, f.photo_url, f.created_at
  FROM public.feedback f
  ORDER BY f.created_at DESC
  LIMIT 50;
$$;

DROP FUNCTION IF EXISTS public.submit_feedback(text, text, integer, text);
CREATE FUNCTION public.submit_feedback(_email text, _first_name text, _rating integer, _comment text, _last_name text DEFAULT NULL, _photo_url text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF length(btrim(_first_name)) = 0 OR length(btrim(_comment)) = 0 THEN
    RAISE EXCEPTION 'Please fill in your name and your comment.';
  END IF;
  IF _rating < 1 OR _rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5.';
  END IF;
  IF _photo_url IS NOT NULL AND length(_photo_url) > 400000 THEN
    RAISE EXCEPTION 'Photo is too large.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings b WHERE lower(btrim(b.email)) = lower(btrim(_email))
  ) THEN
    RAISE EXCEPTION 'Only players who already booked a session can leave feedback.';
  END IF;
  INSERT INTO public.feedback (first_name, last_name, email, rating, comment, photo_url)
  VALUES (btrim(_first_name), nullif(btrim(coalesce(_last_name, '')), ''), lower(btrim(_email)), _rating, left(btrim(_comment), 1000), _photo_url);
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_bookings(timestamp with time zone) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_feedback() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_feedback(text, text, integer, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_bookings(timestamp with time zone) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_feedback() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_feedback(text, text, integer, text, text, text) TO anon, authenticated;