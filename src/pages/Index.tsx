import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChartPaletteProvider, ChartPaletteSelector } from "@/components/dashboard/ChartPaletteSelector";
import { TimeframeSelector } from "@/components/dashboard/TimeframeSelector";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { PersonaCardCarousel } from "@/components/dashboard/PersonaCardCarousel";
import { useNfcData } from "@/hooks/useNfcData";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Users, MousePointerClick, FileText, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AnalyticsChart = lazy(() =>
  import("@/components/AnalyticsChart").then((m) => ({ default: m.AnalyticsChart }))
);
const DeviceDonutChart = lazy(() =>
  import("@/components/dashboard/DeviceDonutChart").then((m) => ({ default: m.DeviceDonutChart }))
);
const ConversionFunnel = lazy(() =>
  import("@/components/dashboard/ConversionFunnel").then((m) => ({ default: m.ConversionFunnel }))
);
const PersonaBarChart = lazy(() =>
  import("@/components/dashboard/PersonaBarChart").then((m) => ({ default: m.PersonaBarChart }))
);

const TIMEFRAME_LABELS: Record<string, string> = {
  thirtymin: "Last 30 min",
  daily: "Last 24h",
  weekly: "Last 7 days",
  monthly: "Last 30 days",
  quarterly: "Last 90 days",
};

interface KpiProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ReactNode;
}

function Kpi({ label, value, delta, icon }: KpiProps) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-eyebrow">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-display font-semibold tracking-tight tabular-nums">{value}</p>
      {delta && <p className="text-eyebrow text-muted-foreground">{delta}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-sm border border-border bg-card p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-muted-foreground">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
      </div>
      <Skeleton className="h-7 w-16 mt-1" />
    </div>
  );
}

function ChartSkeleton({ height = "h-[240px]" }: { height?: string }) {
  return (
    <div className="glass-card animate-fade-in">
      <div className="px-6 pt-5 pb-2">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className={`px-6 pb-6 ${height}`}>
        <Skeleton className="h-full w-full rounded-sm" />
      </div>
    </div>
  );
}

function FunnelSkeleton() {
  return (
    <div className="glass-card animate-fade-in">
      <div className="px-6 pt-5 pb-2">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="px-6 pb-6 h-[240px]">
        <Skeleton className="h-full w-full rounded-sm" />
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const { stats, chartData, timeframe, setTimeframe, loading } = useNfcData();
  const { isPro } = useSubscription();
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("interaction_logs")
      .select("id, entity_id, occasion, interaction_type, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRecentLogs(data ?? []));
  }, [user]);

  const totalLinkClicks = stats.linkCTR.reduce((s, l) => s + l.clicks, 0);

  const timeSince = (s: string) => {
    const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <ChartPaletteProvider>
      <DashboardLayout>
        {/* Break out of layout padding for true edge-to-edge cinematic bands */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:-my-8">

          {/* ── BAND 1 · Masthead (ink on paper) ───────────────────────── */}
          <section className="bg-foreground text-background px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex items-center justify-between text-eyebrow text-background/60">
                <span>Vol. 1 · {today}</span>
                <span className="hidden sm:inline">The Handshake Broadsheet</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
                  {TIMEFRAME_LABELS[timeframe]}
                </span>
              </div>
              <h1 className="font-display leading-[0.9] tracking-tight mt-6 lg:mt-10 text-[clamp(3rem,10vw,9rem)]">
                Analytics.
              </h1>
              <div className="mt-6 lg:mt-10 pt-6 border-t border-background/20 flex items-center gap-2 flex-wrap">
                <TimeframeSelector value={timeframe} onChange={setTimeframe} />
                <ChartPaletteSelector />
                {isPro && <ExportButton stats={stats} chartData={chartData} timeframe={timeframe} />}
              </div>
            </div>
          </section>

          {/* ── BAND 2 · Lead story (oversized chart) ──────────────────── */}
          <section className="bg-background px-4 sm:px-6 lg:px-12 py-12 lg:py-20 border-b border-border">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-eyebrow text-muted-foreground mb-4">01 · Lead Story</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight mb-8 max-w-3xl">
                The week, charted — every tap, view, and handshake across your network.
              </h2>
              {loading ? (
                <ChartSkeleton height="h-[420px]" />
              ) : (
                <Suspense fallback={<ChartSkeleton height="h-[420px]" />}>
                  <AnalyticsChart data={chartData} />
                </Suspense>
              )}
            </div>
          </section>

          {/* ── BAND 3 · By the Numbers (paper, big KPIs) ──────────────── */}
          <section className="bg-muted/40 px-4 sm:px-6 lg:px-12 py-12 lg:py-20 border-b border-border">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-eyebrow text-muted-foreground mb-4">02 · By the Numbers</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight mb-10">
                Four signals, no noise.
              </h2>
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                  <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
                  <Kpi label="Profile views" value={stats.profileViews} icon={<Eye className="w-3.5 h-3.5" />} />
                  <Kpi label="Unique visitors" value={stats.uniqueVisitors} icon={<Users className="w-3.5 h-3.5" />} />
                  <Kpi label="Save rate" value={`${stats.contactSaveRate}%`} icon={<FileText className="w-3.5 h-3.5" />} />
                  <Kpi label="Leads" value={stats.leadGenCount} icon={<MousePointerClick className="w-3.5 h-3.5" />} />
                </div>
              )}
            </div>
          </section>

          {/* ── BAND 4 · Featured identities (ink band, cinematic) ─────── */}
          <section className="bg-foreground text-background px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-eyebrow text-background/60 mb-4">03 · Identities</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight mb-10">
                Every face you wear.
              </h2>
              <PersonaCardCarousel />
            </div>
          </section>

          {/* ── BAND 5 · Funnel (full-bleed, single focus) ─────────────── */}
          <section className="bg-background px-4 sm:px-6 lg:px-12 py-12 lg:py-20 border-b border-border">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-eyebrow text-muted-foreground mb-4">04 · The Funnel</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight mb-10 max-w-3xl">
                From a glance to a saved contact.
              </h2>
              {loading ? (
                <FunnelSkeleton />
              ) : (
                <Suspense fallback={<FunnelSkeleton />}>
                  <ConversionFunnel
                    profileViews={stats.profileViews}
                    cardFlips={stats.cardFlips}
                    linkClicks={totalLinkClicks}
                    vcardDownloads={stats.vcardDownloads}
                  />
                </Suspense>
              )}
            </div>
          </section>

          {/* ── BAND 6 · Personas + Devices (two-up cinematic split) ──── */}
          <section className="bg-muted/40 px-4 sm:px-6 lg:px-12 py-12 lg:py-20 border-b border-border">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-eyebrow text-muted-foreground mb-4">05 · Audience</p>
              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight mb-10 max-w-3xl">
                Who they are. What they carry.
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-border">
                <div className="lg:col-span-8 bg-background p-6">
                  <p className="text-eyebrow text-muted-foreground mb-3">Persona Index</p>
                  {loading ? (
                    <ChartSkeleton height="h-[280px]" />
                  ) : (
                    <Suspense fallback={<ChartSkeleton height="h-[280px]" />}>
                      <PersonaBarChart data={stats.personaPerformance} />
                    </Suspense>
                  )}
                </div>
                <div className="lg:col-span-4 bg-background p-6">
                  <p className="text-eyebrow text-muted-foreground mb-3">Devices</p>
                  {loading ? (
                    <ChartSkeleton />
                  ) : (
                    <Suspense fallback={<ChartSkeleton />}>
                      <DeviceDonutChart data={stats.deviceBreakdown} title="Devices" />
                    </Suspense>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── BAND 7 · The Wire (closing credits) ────────────────────── */}
          <section className="bg-background px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
                <div>
                  <p className="text-eyebrow text-muted-foreground mb-2">06 · The Wire</p>
                  <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-tight">
                    Latest from the field.
                  </h2>
                </div>
                <Link to="/logs" className="text-eyebrow text-accent hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="border-t-2 border-foreground">
                {loading ? (
                  <div className="divide-y divide-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
                        <Skeleton className="h-3 w-40 flex-1" />
                        <Skeleton className="h-3 w-12 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-10 text-center italic">No interactions yet.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {recentLogs.map((log) => {
                      const meta = (log.metadata as Record<string, any>) ?? {};
                      return (
                        <div key={log.id} className="flex items-center gap-3 py-3 hover:bg-muted/40 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <p className="text-base font-medium flex-1 truncate">
                            {log.occasion || log.interaction_type?.replace(/_/g, " ")}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {meta.persona_slug && (
                              <Badge variant="outline" className="rounded-sm text-eyebrow">
                                {meta.persona_slug}
                              </Badge>
                            )}
                            {meta.device && <span className="text-eyebrow text-muted-foreground">{meta.device}</span>}
                            <span className="text-eyebrow text-muted-foreground tabular-nums w-10 text-right">{timeSince(log.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Masthead ─────────────────────────────────────────── */}
          <header className="border-y-2 border-foreground py-4">
            <div className="flex items-center justify-between text-eyebrow text-muted-foreground">
              <span>Vol. 1 · {today}</span>
              <span className="hidden sm:inline">The Handshake Broadsheet</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                {TIMEFRAME_LABELS[timeframe]}
              </span>
            </div>
            <h1 className="text-display font-display text-center mt-2 leading-none">Analytics</h1>
            <div className="flex items-center justify-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-border">
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              <ChartPaletteSelector />
              {isPro && <ExportButton stats={stats} chartData={chartData} timeframe={timeframe} />}
            </div>
          </header>

          {/* ── Lede: featured trend + KPI rail ──────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-6 border-b border-border">
            <div className="lg:col-span-8 lg:border-r lg:border-border lg:pr-5">
              <p className="text-eyebrow text-muted-foreground mb-2">Lead Story</p>
              {loading ? (
                <ChartSkeleton height="h-[300px]" />
              ) : (
                <Suspense fallback={<ChartSkeleton height="h-[300px]" />}>
                  <AnalyticsChart data={chartData} />
                </Suspense>
              )}
            </div>
            <aside className="lg:col-span-4 flex flex-col gap-3">
              <p className="text-eyebrow text-muted-foreground">By the Numbers</p>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Kpi label="Profile views" value={stats.profileViews} icon={<Eye className="w-3.5 h-3.5" />} />
                  <Kpi label="Unique visitors" value={stats.uniqueVisitors} icon={<Users className="w-3.5 h-3.5" />} />
                  <Kpi label="Save rate" value={`${stats.contactSaveRate}%`} icon={<FileText className="w-3.5 h-3.5" />} />
                  <Kpi label="Leads" value={stats.leadGenCount} icon={<MousePointerClick className="w-3.5 h-3.5" />} />
                </div>
              )}
            </aside>
          </section>

          {/* ── Editorial feature: 3D card ────────────────────────── */}
          <section className="pb-6 border-b border-border">
            <p className="text-eyebrow text-muted-foreground mb-3 text-center">Featured · Identities</p>
            <PersonaCardCarousel />
          </section>

          {/* ── Three-column editorial grid ──────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-6 border-b border-border">
            <div className="lg:col-span-5 lg:border-r lg:border-border lg:pr-5">
              <p className="text-eyebrow text-muted-foreground mb-2">Funnel Report</p>
              {loading ? (
                <FunnelSkeleton />
              ) : (
                <Suspense fallback={<FunnelSkeleton />}>
                  <ConversionFunnel
                    profileViews={stats.profileViews}
                    cardFlips={stats.cardFlips}
                    linkClicks={totalLinkClicks}
                    vcardDownloads={stats.vcardDownloads}
                  />
                </Suspense>
              )}
            </div>
            <div className="lg:col-span-4 lg:border-r lg:border-border lg:pr-5">
              <p className="text-eyebrow text-muted-foreground mb-2">Persona Index</p>
              {loading ? (
                <ChartSkeleton height="h-[220px]" />
              ) : (
                <Suspense fallback={<ChartSkeleton height="h-[220px]" />}>
                  <PersonaBarChart data={stats.personaPerformance} />
                </Suspense>
              )}
            </div>
            <div className="lg:col-span-3">
              <p className="text-eyebrow text-muted-foreground mb-2">Devices</p>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <Suspense fallback={<ChartSkeleton />}>
                  <DeviceDonutChart data={stats.deviceBreakdown} title="Devices" />
                </Suspense>
              )}
            </div>
          </section>

          {/* ── Wire: recent activity ────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-eyebrow text-muted-foreground">The Wire · Recent Activity</p>
              <Link to="/logs" className="text-eyebrow text-accent hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="border-t-2 border-foreground">
              {loading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
                      <Skeleton className="h-3 w-40 flex-1" />
                      <Skeleton className="h-3 w-12 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center italic">No interactions yet.</p>
              ) : (
                <div className="divide-y divide-border columns-1 md:columns-2 gap-x-6">
                  {recentLogs.map((log) => {
                    const meta = (log.metadata as Record<string, any>) ?? {};
                    return (
                      <div key={log.id} className="flex items-center gap-3 py-2.5 break-inside-avoid hover:bg-muted/40 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        <p className="text-sm font-medium flex-1 truncate">
                          {log.occasion || log.interaction_type?.replace(/_/g, " ")}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {meta.persona_slug && (
                            <Badge variant="outline" className="rounded-sm text-eyebrow">
                              {meta.persona_slug}
                            </Badge>
                          )}
                          {meta.device && <span className="text-eyebrow text-muted-foreground">{meta.device}</span>}
                          <span className="text-eyebrow text-muted-foreground tabular-nums w-8 text-right">{timeSince(log.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ChartPaletteProvider>
  );
};

export default Dashboard;

