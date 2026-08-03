CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.submit_feedback(_email text, _first_name text, _rating int, _comment text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(btrim(_first_name)) = 0 OR length(btrim(_comment)) = 0 THEN
    RAISE EXCEPTION 'Please fill in your name and your comment.';
  END IF;
  IF _rating < 1 OR _rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings b WHERE lower(btrim(b.email)) = lower(btrim(_email))
  ) THEN
    RAISE EXCEPTION 'Only players who already booked a session can leave feedback.';
  END IF;
  INSERT INTO public.feedback (first_name, email, rating, comment)
  VALUES (btrim(_first_name), lower(btrim(_email)), _rating, left(btrim(_comment), 1000));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_feedback(text, text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_feedback(text, text, int, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_feedback()
RETURNS TABLE(first_name text, rating int, comment text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.first_name, f.rating, f.comment, f.created_at
  FROM public.feedback f
  ORDER BY f.created_at DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.get_public_feedback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_feedback() TO anon, authenticated;