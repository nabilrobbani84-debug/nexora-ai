'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginInputSchema, type LoginInput } from '@nexora/shared';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, ApiClientError } from '@/lib/api-client';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: 'admin@nexora.demo',
      password: 'Nexora-Demo-2026!',
    },
  });
  const login = useMutation({
    mutationFn: (values: LoginInput) => api.login(values.email, values.password),
    onSuccess: () => router.replace('/dashboard'),
  });

  const errorMessage =
    login.error instanceof ApiClientError
      ? login.error.message
      : login.error
        ? 'API tidak dapat dijangkau. Pastikan backend berjalan.'
        : null;

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Link href="/" aria-label="Kembali ke halaman utama">
          <Brand />
        </Link>

        <div className="my-auto w-full max-w-md py-12">
          <div className="eyebrow">SECURE ENTERPRISE ACCESS</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">
            Masuk ke intelligence workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Akses dibatasi berdasarkan organisasi, role, dan permission yang terverifikasi oleh API.
          </p>

          <form className="mt-9 space-y-5" onSubmit={form.handleSubmit((values) => login.mutate(values))} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">
                Email perusahaan
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-2 text-xs text-rose-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
                <Link className="text-xs font-medium text-blue-400 hover:text-blue-300" href="/forgot-password">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-11"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-2 text-xs text-rose-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            <AnimatePresence initial={false}>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="rounded-lg border border-rose-400/20 bg-rose-400/8 px-3.5 py-3 text-sm text-rose-300"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <Button className="h-11 w-full" disabled={login.isPending} type="submit">
              {login.isPending ? 'Memverifikasi…' : 'Masuk ke NEXORA'}
              {!login.isPending && <ArrowRight aria-hidden="true" className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3.5">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyan-400" />
            <p className="text-xs leading-5 text-slate-500">
              Demo lokal menggunakan akun yang sudah diisi. Token disimpan dalam cookie HttpOnly dan dirotasi oleh server.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600">NEXORA AI · Secure enterprise access</p>
      </section>

      <aside className="auth-visual hidden lg:flex">
        <div className="signal-map" aria-hidden="true">
          <span className="signal-core" />
          <span className="signal-orbit signal-orbit-one" />
          <span className="signal-orbit signal-orbit-two" />
          <span className="signal-node signal-node-one" />
          <span className="signal-node signal-node-two" />
          <span className="signal-node signal-node-three" />
        </div>
        <div className="auth-visual-copy">
          <span className="status-chip">
            <ShieldCheck className="size-3.5" /> FOUNDATION ACTIVE
          </span>
          <p className="mt-5 max-w-xl text-3xl font-medium leading-10 tracking-[-0.02em] text-slate-100">
            Customer intelligence starts with trusted identity and isolated enterprise data.
          </p>
          <div className="mt-9 grid grid-cols-3 gap-8 border-t border-slate-700/60 pt-6 text-xs">
            <div><div className="text-slate-500">AUTH</div><div className="mt-2 text-slate-200">Rotating tokens</div></div>
            <div><div className="text-slate-500">TENANCY</div><div className="mt-2 text-slate-200">Server-enforced</div></div>
            <div><div className="text-slate-500">CONTROL</div><div className="mt-2 text-slate-200">Deny by default</div></div>
          </div>
        </div>
      </aside>
    </main>
  );
}
