CREATE OR REPLACE FUNCTION public.verify_persona_pin(p_persona_id uuid, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_code INTO stored_hash
  FROM public.personas
  WHERE id = p_persona_id;

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN crypt(p_pin, stored_hash) = stored_hash;
END;
$function$;