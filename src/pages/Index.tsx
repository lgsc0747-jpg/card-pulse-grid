import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { CreditCard, Zap, Activity, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const chartData = [
  { time: "00:00", taps: 4 }, { time: "04:00", taps: 2 }, { time: "08:00", taps: 18 },
  { time: "10:00", taps: 32 }, { time: "12:00", taps: 28 }, { time: "14:00", taps: 45 },
  { time: "16:00", taps: 38 }, { time: "18:00", taps: 22 }, { time: "20:00", taps: 15 },
  { time: "22:00", taps: 8 },
];

const recentLogs = [
  { id: 1, entity: "Staff_User_88", occasion: "Staff Attendance", time: "2 min ago" },
  { id: 2, entity: "Asset_Laptop_04", occasion: "IT Asset Tracking", time: "18 min ago" },
  { id: 3, entity: "Guest_Visitor_12", occasion: "Event Check-in", time: "45 min ago" },
  { id: 4, entity: "Staff_User_22", occasion: "Security Access", time: "1 hr ago" },
  { id: 5, entity: "Asset_Badge_09", occasion: "Staff Attendance", time: "2 hr ago" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time NFC interaction overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Cards"
            value="3 / 5"
            icon={<CreditCard className="w-4 h-4" />}
            trend={{ value: 12, label: "vs last week" }}
          />
          <StatCard
            title="Total Taps Today"
            value="1,240"
            icon={<Zap className="w-4 h-4" />}
            trend={{ value: 5.2, label: "vs yesterday" }}
          />
          <StatCard
            title="Avg Response"
            value="42ms"
            icon={<Activity className="w-4 h-4" />}
            trend={{ value: -8, label: "faster" }}
          />
          <StatCard
            title="Uptime"
            value="99.9%"
            icon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Chart + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity Chart */}
          <div className="lg:col-span-2 glass-card rounded-lg p-5 animate-fade-in">
            <h2 className="font-display font-semibold mb-4">Interaction Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tapGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="taps"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#tapGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-lg p-5 animate-fade-in">
            <h2 className="font-display font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 group">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:animate-pulse-glow" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{log.entity}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {log.occasion}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
