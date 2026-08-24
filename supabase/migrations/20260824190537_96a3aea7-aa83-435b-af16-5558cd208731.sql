ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings (user_id);

-- Existing bookings are attached to the account that later signs up with the same email.
CREATE OR REPLACE FUNCTION public.attach_bookings_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND lower(btrim(email)) = lower(btrim(NEW.email));
  RETURN NEW;
END;
$$;

GRANT SELECT ON public.bookings TO authenticated;

DROP POLICY IF EXISTS "Students read their own bookings" ON public.bookings;
CREATE POLICY "Students read their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);