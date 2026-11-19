import Link from 'next/link';
import { ArrowRight, Database, KeyRound, Network, ShieldCheck } from 'lucide-react';
import { Brand } from '@/components/brand';

const capabilities = [
  { icon: KeyRound, label: 'Secure sessions', value: 'Access + refresh rotation' },
  { icon: ShieldCheck, label: 'Authorization', value: 'Tenant-bound RBAC' },
  { icon: Database, label: 'Data foundation', value: 'PostgreSQL + Prisma' },
  { icon: Network, label: 'Platform', value: 'REST + WebSocket + queues' },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#080B14] text-slate-100">
      <div className="foundation-grid min-h-dvh">
        <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
              Phase 1 Foundation
            </span>
            <Link className="button-secondary h-10" href="/login">
              Masuk
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          <div>
            <div className="eyebrow">ENTERPRISE CUSTOMER INTELLIGENCE</div>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              Intelligence that turns customer signals into action.
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
              Fondasi aman NEXORA AI menyatukan identitas, isolasi tenant, kontrol akses, dan layanan real-time sebelum intelligence bisnis diaktifkan.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link className="button-primary h-12 px-5 text-base" href="/login">
                Buka platform
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a className="button-secondary h-12 px-5 text-base" href="http://localhost:4000/api/docs">
                Dokumentasi API
              </a>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
            <div className="absolute inset-[9%] rounded-full border border-blue-400/15" />
            <div className="orbit-ring absolute inset-[20%] rounded-full border border-cyan-400/20" />
            <div className="absolute inset-[34%] rounded-full border border-violet-400/30 bg-[radial-gradient(circle_at_35%_30%,rgba(34,211,238,0.42),rgba(59,130,246,0.16)_32%,rgba(8,11,20,0.8)_70%)] shadow-[0_0_90px_rgba(59,130,246,0.18),inset_0_0_35px_rgba(34,211,238,0.13)]">
              <div className="absolute inset-[28%] rounded-full bg-cyan-300/80 blur-xl" />
            </div>
            {[
              ['left-[8%] top-[34%]', 'bg-amber-400'],
              ['right-[7%] top-[50%]', 'bg-blue-400'],
              ['left-[30%] top-[5%]', 'bg-violet-400'],
              ['bottom-[8%] left-[34%]', 'bg-emerald-400'],
            ].map(([position, color]) => (
              <div key={position} className={`absolute ${position} grid size-8 place-items-center rounded-full border border-slate-700 bg-slate-950 shadow-lg`}>
                <span className={`size-2 rounded-full ${color}`} />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-px overflow-hidden border-y border-slate-800 bg-slate-800 sm:grid-cols-2 lg:grid-cols-4 lg:border-x">
          {capabilities.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#0B101C] p-6">
              <Icon aria-hidden="true" className="size-5 text-cyan-400" strokeWidth={1.7} />
              <div className="mt-5 text-sm font-medium text-slate-200">{label}</div>
              <div className="mt-1 text-xs text-slate-500">{value}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
