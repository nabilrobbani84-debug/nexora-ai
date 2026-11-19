'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, CheckCircle2, Database, KeyRound, RefreshCw, ShieldCheck, Waypoints } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api, ApiClientError } from '@/lib/api-client';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ENTERPRISE_ADMIN: 'Enterprise Administrator',
  SALES_MANAGER: 'Sales Manager',
  CUSTOMER_SERVICE_MANAGER: 'Customer Service Manager',
  SALES_AGENT: 'Sales Agent',
  CUSTOMER_SERVICE_AGENT: 'Customer Service Agent',
  BUSINESS_ANALYST: 'Business Analyst',
};

export function DashboardWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: ['session'], queryFn: api.session });
  const foundation = useQuery({
    queryKey: ['foundation-status'],
    queryFn: api.foundationStatus,
    enabled: session.isSuccess,
  });
  const logout = useMutation({
    mutationFn: api.logout,
    onSettled: async () => {
      queryClient.clear();
      router.replace('/login');
    },
  });

  useEffect(() => {
    if (session.error instanceof ApiClientError && session.error.status === 401) {
      router.replace('/login');
    }
  }, [router, session.error]);

  if (session.isPending) return <DashboardSkeleton />;

  if (session.isError || !session.data) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#080B14] p-6 text-slate-100">
        <Card className="max-w-md p-7 text-center">
          <ShieldCheck className="mx-auto size-8 text-amber-400" />
          <h1 className="mt-5 text-xl font-semibold text-white">Sesi tidak dapat diverifikasi</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">API mungkin belum berjalan atau sesi Anda telah berakhir.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => void session.refetch()}>
              <RefreshCw className="size-4" /> Coba lagi
            </Button>
            <Button onClick={() => router.replace('/login')}>Ke login</Button>
          </div>
        </Card>
      </main>
    );
  }

  const { user } = session.data;
  const checks = [
    { icon: KeyRound, title: 'Secure authentication', detail: 'Short-lived access token and rotating refresh family' },
    { icon: ShieldCheck, title: 'Tenant authorization', detail: `Context terkunci ke ${user.organizationName}` },
    { icon: Waypoints, title: 'Role-based access', detail: `${user.permissions.length} permission efektif dari server` },
    { icon: Database, title: 'Audit-ready data', detail: 'Login, rotation, and revocation events are persisted' },
  ];

  return (
    <AppShell user={user} onLogout={() => logout.mutate()} loggingOut={logout.isPending}>
      <section className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="eyebrow">PHASE 1 · FOUNDATION</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Enterprise control plane</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Status berikut berasal dari identitas terautentikasi dan endpoint API yang dilindungi RBAC, bukan angka demo acak.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`size-2 rounded-full ${foundation.isSuccess ? 'bg-emerald-400' : foundation.isError ? 'bg-rose-400' : 'animate-pulse bg-amber-400'}`} />
            {foundation.isSuccess ? 'Protected API operational' : foundation.isError ? 'Protected API unavailable' : 'Checking protected API'}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {checks.map(({ icon: Icon, title, detail }, index) => (
            <Card key={title} className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid size-9 place-items-center rounded-lg border border-slate-700 bg-slate-900 text-cyan-400"><Icon className="size-[18px]" strokeWidth={1.8} /></div>
                <span className="font-mono text-[10px] text-slate-600">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-sm font-medium text-slate-100">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div><h3 className="text-sm font-medium text-white">Platform capability status</h3><p className="mt-1 text-xs text-slate-500">Validated by `/api/v1/foundation/status`</p></div>
              <Activity className="size-4 text-blue-400" />
            </div>
            <div className="divide-y divide-slate-800">
              {foundation.data?.capabilities.map((capability) => (
                <div key={capability} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3"><CheckCircle2 className="size-4 text-emerald-400" /><span className="text-sm text-slate-300">{capability}</span></div>
                  <Badge className="border-emerald-400/20 bg-emerald-400/5 text-emerald-300">Operational</Badge>
                </div>
              ))}
              {foundation.isPending && Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[57px] animate-pulse bg-slate-800/20" />)}
              {foundation.isError && <div className="px-5 py-8 text-center text-sm text-rose-300">Endpoint RBAC tidak dapat diverifikasi. <button className="ml-1 underline" onClick={() => void foundation.refetch()}>Coba lagi</button></div>}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between"><h3 className="text-sm font-medium text-white">Access context</h3><ShieldCheck className="size-4 text-violet-400" /></div>
            <dl className="mt-6 space-y-5">
              <div><dt className="text-[10px] font-medium tracking-wider text-slate-600">ORGANIZATION</dt><dd className="mt-1.5 text-sm text-slate-300">{user.organizationName}</dd></div>
              <div><dt className="text-[10px] font-medium tracking-wider text-slate-600">IDENTITY</dt><dd className="mt-1.5 text-sm text-slate-300">{user.email}</dd></div>
              <div><dt className="text-[10px] font-medium tracking-wider text-slate-600">ACTIVE ROLES</dt><dd className="mt-2 flex flex-wrap gap-2">{user.roles.map((role) => <Badge key={role} className="border-blue-400/20 bg-blue-400/5 text-blue-300">{roleLabels[role] ?? role}</Badge>)}</dd></div>
              <div><dt className="text-[10px] font-medium tracking-wider text-slate-600">TENANT ID</dt><dd className="mt-1.5 break-all font-mono text-xs text-slate-500">{user.organizationId}</dd></div>
            </dl>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-[#080B14] p-6 md:pl-[272px]">
      <div className="mx-auto max-w-[1440px] animate-pulse pt-20">
        <div className="h-4 w-32 rounded bg-slate-800" /><div className="mt-4 h-9 w-80 max-w-full rounded bg-slate-800" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 rounded-xl border border-slate-800 bg-slate-900" />)}</div>
      </div>
    </div>
  );
}
