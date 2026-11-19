import Link from 'next/link';
import { ArrowLeft, MailWarning } from 'lucide-react';
import { Brand } from '@/components/brand';

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        <div className="my-auto max-w-md">
          <div className="mb-6 grid size-12 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <MailWarning aria-hidden="true" className="size-6" />
          </div>
          <div className="eyebrow">PEMULIHAN AKUN</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Hubungi administrator organisasi</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Pengiriman email belum dikonfigurasi pada environment demo. NEXORA AI tidak akan berpura-pura mengirim tautan reset. Administrator dapat memulihkan akun melalui proses terverifikasi setelah integrasi email diaktifkan.
          </p>
          <Link className="button-secondary mt-8 h-11 w-fit" href="/login">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Kembali ke login
          </Link>
        </div>
        <p className="text-xs text-slate-600">NEXORA AI · Secure enterprise access</p>
      </section>
      <aside className="auth-visual hidden lg:flex" aria-hidden="true">
        <div className="auth-visual-copy">
          <span className="status-chip">SECURITY POLICY</span>
          <p className="mt-5 max-w-lg text-2xl font-medium leading-9 text-slate-100">
            Pemulihan akses memerlukan verifikasi identitas dan jejak audit. Tidak ada token reset yang ditampilkan di browser.
          </p>
        </div>
      </aside>
    </main>
  );
}
