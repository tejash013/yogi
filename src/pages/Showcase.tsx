import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiShoppingCart,
  FiTrendingUp,
  FiShield,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi';
import { ROUTES } from '@/constants';
import Logo from '@/components/common/Logo';
import Footer from '@/components/common/Footer';

interface Scene {
  id: number;
  timeLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  routeLink: string;
  routeLabel: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    timeLabel: '0:00 - 0:08',
    badge: 'Introduction & Ecosystem',
    title: 'Modern Restaurant Operating System',
    subtitle: 'Streamline dine-in QR orders, kitchen ticket workflows, POS cashier billing, and multi-outlet management in one unified cloud system.',
    accent: 'from-amber-400 via-orange-500 to-rose-500',
    accentBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    routeLink: ROUTES.CUSTOMER.MENU,
    routeLabel: 'Explore Live Menu',
  },
  {
    id: 2,
    timeLabel: '0:08 - 0:16',
    badge: 'Customer Self-Ordering',
    title: 'Instant Table QR Ordering',
    subtitle: 'Guests scan the table QR code to browse high-definition menus, customize ingredients, and place orders directly without waiting.',
    accent: 'from-emerald-400 via-teal-500 to-cyan-500',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    routeLink: ROUTES.CUSTOMER.MENU,
    routeLabel: 'Try QR Menu Demo',
  },
  {
    id: 3,
    timeLabel: '0:16 - 0:24',
    badge: 'Kitchen Display System',
    title: 'Zero-Lag Real-Time Kitchen KDS',
    subtitle: 'Chefs receive tickets instantly over WebSockets. Track preparation stages, cooking countdowns, and sound alerts for completed orders.',
    accent: 'from-blue-400 via-indigo-500 to-purple-500',
    accentBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    routeLink: ROUTES.KITCHEN.DASHBOARD,
    routeLabel: 'Open Kitchen KDS',
  },
  {
    id: 4,
    timeLabel: '0:24 - 0:32',
    badge: 'Cashier POS & Invoicing',
    title: 'Lightning POS & Instant Bills',
    subtitle: 'Table bills update continuously. Settle with cash, card, or dynamic UPI QR codes and generate 80mm thermal tax invoices on the fly.',
    accent: 'from-purple-400 via-pink-500 to-rose-500',
    accentBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    routeLink: ROUTES.CASHIER.DASHBOARD,
    routeLabel: 'Open Cashier POS',
  },
  {
    id: 5,
    timeLabel: '0:32 - 0:40',
    badge: 'Analytics & Management',
    title: 'Manager & Owner Command Center',
    subtitle: 'Monitor hourly sales velocity, top-performing dishes, table turnover rates, staff access, and multiple restaurant branches.',
    accent: 'from-cyan-400 via-sky-500 to-blue-500',
    accentBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    routeLink: ROUTES.ADMIN.DASHBOARD,
    routeLabel: 'View Manager Hub',
  },
  {
    id: 6,
    timeLabel: '0:40 - 0:48',
    badge: 'Engineered with Precision',
    title: 'Powered by tsubasa digital',
    subtitle: 'Enterprise-grade tenant security, high-availability architecture, and dedicated technical assistance for growing restaurant brands.',
    accent: 'from-amber-300 via-yellow-400 to-orange-500',
    accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    routeLink: 'mailto:tsubasadigital@gmail.com',
    routeLabel: 'Contact Technical Team',
  },
];

const SCENE_DURATION = 8000; // 8 seconds per scene

export default function Showcase() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [interactiveStep, setInteractiveStep] = useState(1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const scene = SCENES[currentSceneIndex];

  // Synthesizer chime for scene transitions (gentle ambient harmonic)
  const playChime = useCallback((frequency = 440) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // AudioContext not allowed or not supported
    }
  }, [soundEnabled]);

  // Main playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50;
    const increment = (intervalMs / SCENE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene
          setCurrentSceneIndex((idx) => {
            const nextIdx = (idx + 1) % SCENES.length;
            playChime(380 + nextIdx * 60);
            return nextIdx;
          });
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playChime]);

  const selectScene = (index: number) => {
    setCurrentSceneIndex(index);
    setProgress(0);
    playChime(420 + index * 50);
  };

  const nextScene = () => {
    selectScene((currentSceneIndex + 1) % SCENES.length);
  };

  const prevScene = () => {
    selectScene((currentSceneIndex - 1 + SCENES.length) % SCENES.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary-500 selection:text-white">
      {/* Top Floating Cinema Navigation */}
      <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
            <span className="hidden rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-400 sm:inline-flex">
              Interactive Video Showcase
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.CUSTOMER.MENU}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 transition hover:border-neutral-700 hover:text-white"
            >
              <span>Live Menu</span>
            </Link>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500"
            >
              <span>Sign In</span>
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Video Presentation Stage */}
      <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -left-48 top-12 h-96 w-96 rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-48 top-32 h-96 w-96 rounded-full bg-orange-500/15 blur-[140px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-10 h-80 w-80 rounded-full bg-cyan-600/15 blur-[130px]" />

        <div className="mx-auto max-w-6xl">
          {/* Header intro badge & title */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="font-semibold uppercase tracking-wider text-neutral-300">QuickTable 4K Feature Tour</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">by tsubasa digital</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                Experience QuickTable in Action
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400 sm:text-base">
                An interactive video tour demonstrating customer QR self-ordering, real-time kitchen KDS, POS cashier settlement, and multi-tenant cloud operations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundEnabled((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  soundEnabled
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Mute Chimes' : 'Enable Harmonic Chimes'}
              >
                {soundEnabled ? <FiVolume2 className="h-4 w-4" /> : <FiVolumeX className="h-4 w-4" />}
                <span>{soundEnabled ? 'Sound ON' : 'Sound OFF'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
                title="Toggle Fullscreen"
              >
                <FiMaximize className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Cinematic Video Player Screen */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/70 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Top Video HUD status bar */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/60 px-4 py-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono font-medium text-neutral-300">SCENE 0{scene.id} / 06</span>
                <span className="text-neutral-700">|</span>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${scene.accentBg}`}>
                  {scene.badge}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-neutral-500">{scene.timeLabel}</span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">60 FPS</span>
              </div>
            </div>

            {/* Stage Body Container */}
            <div className="relative min-h-[460px] p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              {/* Scene Info Banner */}
              <div className="relative z-10 max-w-xl animate-fade-in-up" key={`header-${scene.id}`}>
                <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">
                  <span className={`bg-gradient-to-r ${scene.accent} bg-clip-text text-transparent`}>
                    {scene.title}
                  </span>
                </h2>
                <p className="mt-2 text-sm text-neutral-300 sm:text-base leading-relaxed">
                  {scene.subtitle}
                </p>
              </div>

              {/* Dynamic Interactive Scene Renderers */}
              <div className="my-6">
                {scene.id === 1 && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 backdrop-blur">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                        <FiShoppingCart className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 font-bold text-white">QR Table Ordering</h3>
                      <p className="mt-1 text-xs text-neutral-400">Customers scan tables, explore rich visuals, and send orders to chefs without servers.</p>
                      <span className="mt-3 inline-block text-[11px] font-semibold text-orange-400">Instant Cart Sync</span>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 backdrop-blur">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                        <FiClock className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 font-bold text-white">Live Kitchen KDS</h3>
                      <p className="mt-1 text-xs text-neutral-400">Real-time WebSocket tickets, preparation countdowns, priority sorting, and readiness sound bells.</p>
                      <span className="mt-3 inline-block text-[11px] font-semibold text-indigo-400">Zero Refresh Lag</span>
                    </div>

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 backdrop-blur">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
                        <FiTrendingUp className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 font-bold text-white">POS Cashier & Bills</h3>
                      <p className="mt-1 text-xs text-neutral-400">Split payments, dynamic UPI QR codes, tax invoice printing, and revenue analytics.</p>
                      <span className="mt-3 inline-block text-[11px] font-semibold text-pink-400">Thermal 80mm Print</span>
                    </div>
                  </div>
                )}

                {scene.id === 2 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">TABLE #4</span>
                        <span className="text-xs text-neutral-400">Live Customer Cart Demo</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-300">Total: ₹837</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3">
                        <div>
                          <p className="font-semibold text-white text-xs">Margherita Pizza</p>
                          <p className="text-[11px] text-neutral-400">1x • Extra Basil</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">₹299</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3">
                        <div>
                          <p className="font-semibold text-white text-xs">Smoky BBQ Burger</p>
                          <p className="text-[11px] text-neutral-400">1x • Brioche bun</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">₹349</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3">
                        <div>
                          <p className="font-semibold text-white text-xs">Truffle Herb Fries</p>
                          <p className="text-[11px] text-neutral-400">1x • Golden cut</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">₹189</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <FiCheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Order Synced with Kitchen POS instantly via WebSocket</span>
                      </div>
                      <Link to={ROUTES.CUSTOMER.MENU} className="font-bold text-emerald-400 underline hover:text-emerald-300">
                        Open Customer Menu ➔
                      </Link>
                    </div>
                  </div>
                )}

                {scene.id === 3 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-xs font-bold text-amber-400">LIVE KITCHEN TICKET #1042</span>
                        <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">Table 4</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs text-amber-400">
                        <FiClock className="h-3.5 w-3.5" />
                        <span>Prep Timer: 04:15</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-bold text-white">Dish Checklist:</p>
                        <ul className="mt-1.5 space-y-1 text-xs text-neutral-300">
                          <li>• 1x Margherita Pizza <span className="text-amber-400 text-[10px]">(In Oven)</span></li>
                          <li>• 1x Smoky BBQ Burger <span className="text-amber-400 text-[10px]">(Grilling)</span></li>
                          <li>• 1x Truffle Herb Fries <span className="text-emerald-400 text-[10px]">(Ready)</span></li>
                        </ul>
                      </div>

                      <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <div>
                          <p className="text-xs font-bold text-white">Chef Actions:</p>
                          <p className="mt-1 text-[11px] text-neutral-400">Click to test cooking state transitions:</p>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setInteractiveStep((s) => (s === 1 ? 2 : 1))}
                            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-500"
                          >
                            {interactiveStep === 1 ? 'Start Cooking' : 'Preparing (Active)'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setInteractiveStep(3)}
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            {interactiveStep === 3 ? 'Marked Ready! 🔔' : 'Mark Ready'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {scene.id === 4 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                      <span className="text-xs font-bold text-pink-400">POS DESK • BILL SETTLEMENT</span>
                      <span className="text-xs text-neutral-400">Invoice #INV-2026-089</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-semibold text-neutral-400">Order Amount</p>
                        <p className="text-lg font-bold text-white">₹837.00</p>
                        <p className="text-[11px] text-neutral-400">+ GST 5%: ₹41.85</p>
                        <p className="mt-1 text-xs font-bold text-pink-400">Total: ₹878.85</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-semibold text-neutral-400">Payment Modes</p>
                        <div className="mt-2 flex flex-col gap-1 text-xs">
                          <span className="rounded bg-pink-500/20 px-2 py-0.5 text-pink-300 font-semibold">• UPI Dynamic QR</span>
                          <span className="rounded bg-neutral-800 px-2 py-0.5 text-neutral-300">• Credit / Debit Card</span>
                          <span className="rounded bg-neutral-800 px-2 py-0.5 text-neutral-300">• Cash Counter</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <div>
                          <p className="text-xs font-semibold text-neutral-400">Thermal Receipt</p>
                          <p className="mt-1 font-mono text-[11px] text-neutral-300">QuickTable by tsubasa digital</p>
                          <p className="text-[10px] text-emerald-400">Status: Settle & Print</p>
                        </div>
                        <Link
                          to={ROUTES.CASHIER.DASHBOARD}
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-500"
                        >
                          Open POS Desk
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {scene.id === 5 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                      <span className="text-xs font-bold text-sky-400">OWNER CONTROL PLANE & ANALYTICS</span>
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">Downtown Branch</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-semibold text-neutral-400">Today's Revenue</p>
                        <p className="text-xl font-bold text-white">₹42,850</p>
                        <p className="text-[11px] text-emerald-400">+18.4% vs last week</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-semibold text-neutral-400">Completed Orders</p>
                        <p className="text-xl font-bold text-white">128 Orders</p>
                        <p className="text-[11px] text-neutral-400">Avg Prep: 14 mins</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
                        <p className="text-xs font-semibold text-neutral-400">Active Tables</p>
                        <p className="text-xl font-bold text-white">14 / 18</p>
                        <p className="text-[11px] text-sky-400">77% Occupancy</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-900/90 p-3 text-xs">
                      <span className="text-neutral-400">Multi-outlet support: Manage menus, pricing, and staff per branch outlet</span>
                      <Link to={ROUTES.ADMIN.DASHBOARD} className="font-bold text-sky-400 hover:underline">
                        Open Admin Dashboard ➔
                      </Link>
                    </div>
                  </div>
                )}

                {scene.id === 6 && (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FiShield className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">TECHNICAL SUPPORT & INQUIRIES</span>
                      </div>
                      <span className="text-xs text-neutral-400">QuickTable by tsubasa digital</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase">Official Support Mail</p>
                        <div className="mt-2 flex items-center gap-2">
                          <FiMail className="h-4 w-4 text-primary-400" />
                          <a
                            href="mailto:tsubasadigital@gmail.com"
                            className="font-mono text-sm font-bold text-primary-400 underline hover:text-primary-300"
                          >
                            tsubasadigital@gmail.com
                          </a>
                        </div>
                        <p className="mt-2 text-xs text-neutral-400">Response time within 2–4 hours for onboarding, customization, and deployment assistance.</p>
                      </div>

                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase">Architecture Highlights</p>
                        <ul className="mt-2 space-y-1 text-xs text-neutral-300">
                          <li>• Strict multi-tenant data boundaries</li>
                          <li>• React 19 + TypeScript + Vite 8 frontend</li>
                          <li>• Node.js ESM + Express + MongoDB backend</li>
                          <li>• Thermal printer invoice export</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom CTA for current scene */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800/60">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Scene {scene.id} of {SCENES.length}</span>
                  <span>•</span>
                  <span>Auto-advances every 8 seconds</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={scene.routeLink}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-neutral-950 shadow-md transition hover:bg-neutral-100"
                  >
                    <span>{scene.routeLabel}</span>
                    <FiExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Video Player Scrubbable Progress Bar */}
            <div className="relative h-1.5 w-full bg-neutral-800">
              <div
                className={`h-full bg-gradient-to-r ${scene.accent} transition-all duration-75`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Bottom HUD Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800/80 bg-neutral-950/90 px-4 py-3 sm:px-6">
              {/* Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-500 active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProgress(0);
                    selectScene(0);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
                  title="Restart Presentation"
                >
                  <FiRotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={prevScene}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
                  title="Previous Chapter"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={nextScene}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-700 hover:text-white"
                  title="Next Chapter"
                >
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Scene Chapter Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {SCENES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectScene(idx)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      idx === currentSceneIndex
                        ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-neutral-700'
                        : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'
                    }`}
                  >
                    0{s.id}. {s.badge.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Direct Jump Links */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to={ROUTES.CUSTOMER.MENU}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 transition hover:border-orange-500/50 hover:bg-neutral-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Customer</span>
                <FiArrowRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-orange-400" />
              </div>
              <h3 className="mt-2 text-base font-bold text-white">Digital Menu & QR</h3>
              <p className="mt-1 text-xs text-neutral-400">Browse categories, food cards, dietary filters, and place table orders.</p>
            </Link>

            <Link
              to={ROUTES.KITCHEN.DASHBOARD}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 transition hover:border-indigo-500/50 hover:bg-neutral-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Chef & Kitchen</span>
                <FiArrowRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
              </div>
              <h3 className="mt-2 text-base font-bold text-white">Live KDS Display</h3>
              <p className="mt-1 text-xs text-neutral-400">Track orders by cooking status, timer urgency, and ingredient notes.</p>
            </Link>

            <Link
              to={ROUTES.CASHIER.DASHBOARD}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 transition hover:border-pink-500/50 hover:bg-neutral-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Cashier POS</span>
                <FiArrowRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-pink-400" />
              </div>
              <h3 className="mt-2 text-base font-bold text-white">POS Billing Desk</h3>
              <p className="mt-1 text-xs text-neutral-400">Table bill settling, UPI QR payments, and print-ready tax invoices.</p>
            </Link>

            <Link
              to={ROUTES.ADMIN.DASHBOARD}
              className="group rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 transition hover:border-sky-500/50 hover:bg-neutral-900/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Manager & Admin</span>
                <FiArrowRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-sky-400" />
              </div>
              <h3 className="mt-2 text-base font-bold text-white">Management Console</h3>
              <p className="mt-1 text-xs text-neutral-400">Inventory counts, staff permissions, menu catalog editing, and reports.</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer with Privacy Policy & Support */}
      <Footer />
    </div>
  );
}
