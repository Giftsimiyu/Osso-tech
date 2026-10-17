create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(trim(review_text)) between 5 and 2000),
  created_at timestamptz not null default now(),
  constraint product_reviews_one_per_order unique (product_id, order_id)
);

create index if not exists product_reviews_product_created_idx
  on public.product_reviews (product_id, created_at desc);

alter table public.product_reviews enable row level security;
revoke all on public.product_reviews from anon, authenticated;
grant all on public.product_reviews to service_role;

alter table public.orders
  add column if not exists receipt_email_status text not null default 'pending'
    check (receipt_email_status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  add column if not exists receipt_sent_at timestamptz;
