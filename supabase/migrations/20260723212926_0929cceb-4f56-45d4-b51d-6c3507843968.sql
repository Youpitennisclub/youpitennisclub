
CREATE TYPE public.tennis_level AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at timestamptz NOT NULL,
  level public.tennis_level NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bookings_starts_at_idx ON public.bookings (starts_at);

GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No direct SELECT for anon/authenticated; use the public view instead.

-- Enforce max 6 participants per starting time
CREATE OR REPLACE FUNCTION public.enforce_booking_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_count int;
BEGIN
  SELECT count(*) INTO slot_count FROM public.bookings WHERE starts_at = NEW.starts_at;
  IF slot_count >= 6 THEN
    RAISE EXCEPTION 'This time slot is fully booked (6 participants max).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_enforce_capacity
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_capacity();

-- Public view showing only first name + last-name initials
CREATE VIEW public.bookings_public
WITH (security_invoker = false) AS
SELECT
  starts_at,
  level,
  first_name,
  substr(last_name, 1, 2) AS last_initials
FROM public.bookings;

GRANT SELECT ON public.bookings_public TO anon, authenticated;
