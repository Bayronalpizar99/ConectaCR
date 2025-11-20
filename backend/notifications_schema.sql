-- Crea la tabla de notificaciones
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id), -- Referencia explícita a la tabla de usuarios
  report_id uuid references public.reports(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita Row Level Security (RLS)
alter table public.notifications enable row level security;

-- Política para que los usuarios puedan ver sus propias notificaciones
create policy "Users can view their own notifications"
on public.notifications for select
using (auth.uid() = user_id);

-- Política para permitir a los administradores insertar notificaciones (si no se usa service_role)
create policy "Admins can insert notifications"
on public.notifications for insert
with check (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
