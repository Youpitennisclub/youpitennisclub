REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.student_credits FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.credit_transactions FROM anon, authenticated;
REVOKE ALL ON public.student_credits FROM anon;
REVOKE ALL ON public.credit_transactions FROM anon;
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.bookings FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_credit(uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_credit(uuid, integer, text, uuid) TO service_role;