with new_codes as (
  select upper(encode(gen_random_bytes(8), 'hex')) as admin_code,
         upper(encode(gen_random_bytes(6), 'hex')) as join_code
), upd as (
  update class_secrets s
     set admin_code_hash = crypt(n.admin_code, gen_salt('bf')),
         join_code_hash  = crypt(n.join_code,  gen_salt('bf'))
    from new_codes n, classes c
   where c.id = s.class_id and lower(c.name) = lower('10A5')
  returning c.name
)
select (select name from upd) as class_name, admin_code, join_code from new_codes;