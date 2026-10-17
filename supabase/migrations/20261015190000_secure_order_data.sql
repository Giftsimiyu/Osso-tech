alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders, public.order_items from anon, authenticated;
grant all on table public.orders, public.order_items to service_role;

do $$
declare
  payment_function regprocedure;
begin
  for payment_function in
    select p.oid::regprocedure
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'complete_mpesa_order'
  loop
    execute format(
      'revoke all on function %s from public, anon, authenticated',
      payment_function
    );
    execute format(
      'grant execute on function %s to service_role',
      payment_function
    );
  end loop;
end;
$$;
