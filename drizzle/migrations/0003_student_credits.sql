CREATE TABLE public.student_credits (
  user_id uuid PRIMARY KEY,
  balance_cents integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.student_credits TO authenticated;
GRANT ALL ON public.student_credits TO service_role;
ALTER TABLE public.student_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read their own balance" ON public.student_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  reason text NOT NULL,
  booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read their own transactions" ON public.credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.bookings
  ADD COLUMN non_member boolean NOT NULL DEFAULT false,
  ADD COLUMN duration integer NOT NULL DEFAULT 60,
  ADD COLUMN charged_cents integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.apply_credit(_user_id uuid, _amount_cents integer, _reason text, _booking_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE new_balance integer;
BEGIN
  INSERT INTO public.student_credits (user_id, balance_cents)
  VALUES (_user_id, _amount_cents)
  ON CONFLICT (user_id) DO UPDATE
    SET balance_cents = public.student_credits.balance_cents + _amount_cents,
        updated_at = now()
  RETURNING balance_cents INTO new_balance;
  INSERT INTO public.credit_transactions (user_id, amount_cents, reason, booking_id)
  VALUES (_user_id, _amount_cents, _reason, _booking_id);
  RETURN new_balance;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_credit(uuid, integer, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_credit(uuid, integer, text, uuid) TO service_role;