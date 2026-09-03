import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <div className="auth-grid pointer-events-none absolute inset-0" />
      <div className="auth-ribbon auth-ribbon-one pointer-events-none absolute -left-24 top-[12%] h-40 w-[125%] -rotate-[12deg] rounded-[45%] bg-orange-400/35 blur-2xl dark:bg-orange-500/20" />
      <div className="auth-ribbon auth-ribbon-two pointer-events-none absolute -right-24 bottom-[8%] h-44 w-[120%] rotate-[10deg] rounded-[45%] bg-teal-400/30 blur-2xl dark:bg-teal-500/20" />
      <div className="pointer-events-none absolute left-[7%] top-[15%] h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_0_10px_rgba(253,224,71,0.16)] dark:bg-yellow-400/70" />
      <div className="pointer-events-none absolute bottom-[16%] right-[9%] h-4 w-4 rounded-full bg-rose-400 shadow-[0_0_0_12px_rgba(251,113,133,0.14)] dark:bg-rose-400/70" />

      <main className="relative w-full max-w-[500px] animate-scale-in">
        <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(45,37,28,0.18)] backdrop-blur-xl sm:p-8 dark:border-neutral-700/80 dark:bg-neutral-950/85">
          <Outlet />
        </div>

        <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400 animate-fade-in-up [animation-delay:240ms]">A calmer way to run service</p>
      </main>
    </div>
  );
}

