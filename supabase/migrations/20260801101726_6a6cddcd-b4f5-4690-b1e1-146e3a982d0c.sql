REVOKE ALL ON FUNCTION public.enforce_booking_capacity() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_public_bookings(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_bookings(timestamptz) TO anon, authenticated;

REVOKE SELECT, UPDATE, DELETE ON public.bookings FROM anon, authenticated;
GRANT ALL ON public.bookings TO service_role;