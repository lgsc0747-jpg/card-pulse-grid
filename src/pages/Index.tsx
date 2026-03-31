import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { CreditCard, Zap, Activity, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeCards: 0, totalCards: 0, totalLogs: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [cardsRes, logsRes, recentRes] = await Promise.all([
        supabase.from("nfc_cards").select("id, status").eq("user_id", user.id),
        supabase.from("interaction_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("interaction_logs").select("id, entity_id, occasion, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      const cards = cardsRes.data ?? [];
      setStats({
        activeCards: cards.filter((c) => c.status === "active").length,
        totalCards: cards.length,
        totalLogs: logsRes.count ?? 0,
      });
      setRecentLogs(recentRes.data ?? []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time NFC interaction overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Cards"
            value={`${stats.activeCards} / ${stats.totalCards}`}
            icon={<CreditCard className="w-4 h-4" />}
          />
          <StatCard
            title="Total Interactions"
            value={stats.totalLogs.toLocaleString()}
            icon={<Zap className="w-4 h-4" />}
          />
          <StatCard
            title="Categories"
            value="—"
            icon={<Activity className="w-4 h-4" />}
          />
          <StatCard
            title="System"
            value="Online"
            icon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-lg p-5 animate-fade-in max-w-2xl">
          <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 group">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:animate-pulse-glow" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{log.entity_id}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {log.occasion && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {log.occasion}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">{timeSince(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
