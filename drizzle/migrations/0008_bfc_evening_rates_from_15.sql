CREATE OR REPLACE FUNCTION public.booking_unit_price(b bookings, n integer)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE h integer; outdoor boolean; base integer;
BEGIN
 IF b.price_two IS NOT NULL THEN RETURN CASE WHEN n>=4 THEN b.price_four WHEN n=3 THEN b.price_three ELSE b.price_two END; END IF;
 h:=extract(hour FROM b.starts_at AT TIME ZONE 'Europe/Berlin');
 outdoor:=b.venue='alemannia' AND (b.starts_at AT TIME ZONE 'Europe/Berlin')::date<='2026-10-24' AND (b.starts_at AT TIME ZONE 'Europe/Berlin')::date<>'2026-10-08' AND NOT ((b.starts_at AT TIME ZONE 'Europe/Berlin')::date='2026-10-07' AND h>=21) AND NOT ((b.starts_at AT TIME ZONE 'Europe/Berlin')::date IN ('2026-10-20','2026-10-21') AND h>=18);
 IF outdoor THEN base:=CASE WHEN n>=4 THEN 17 WHEN n=3 THEN 19 ELSE 25 END;
 ELSIF b.venue='longline' THEN base:=CASE WHEN n>=4 THEN 25 WHEN n=3 THEN 31 ELSE 39 END + CASE WHEN h>=16 THEN 2 ELSE 0 END;
 ELSE base:=CASE WHEN n>=4 THEN 24 WHEN n=3 THEN 30 ELSE 37 END + CASE WHEN h>=15 THEN 2 ELSE 0 END;
 END IF;
 RETURN round((base + CASE WHEN b.venue='alemannia' AND b.non_member THEN 2 ELSE 0 END)*100*b.duration/60.0);
END $function$;