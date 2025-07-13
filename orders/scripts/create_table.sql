create table public.orders (
  order_id text not null,
  status text not null,
  created_at timestamp with time zone not null default now(),
  image_url text null,
  constraint orders_pkey primary key (order_id)
) TABLESPACE pg_default;