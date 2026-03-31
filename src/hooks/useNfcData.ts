import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Timeframe = "daily" | "weekly" | "monthly";

interface ChartPoint {
  label: string;
  taps: number;
}

interface NfcStats {
  totalTaps: number;
  uniqueVisitors: number;
  topDevice: string;
  topLocation: string;
  profileViews: number;
  cvDownloads: number;
  vcardDownloads: number;
}

export function useNfcData() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [stats, setStats] = useState<NfcStats>({
    totalTaps: 0,
    uniqueVisitors: 0,
    topDevice: "Unknown",
    topLocation: "Unknown",
    profileViews: 0,
    cvDownloads: 0,
    vcardDownloads: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Determine date range
    const now = new Date();
    let since: Date;
    let points: number;
    let formatLabel: (d: Date) => string;

    if (timeframe === "daily") {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      points = 24;
      formatLabel = (d) => `${d.getHours()}:00`;
    } else if (timeframe === "weekly") {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      points = 7;
      formatLabel = (d) => d.toLocaleDateString("en", { weekday: "short" });
    } else {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      points = 30;
      formatLabel = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    }

    const { data: logs } = await supabase
      .from("interaction_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    const allLogs = logs ?? [];

    // Build chart buckets
    const bucketMs = (now.getTime() - since.getTime()) / points;
    const buckets: ChartPoint[] = [];
    for (let i = 0; i < points; i++) {
      const bucketStart = new Date(since.getTime() + i * bucketMs);
      const bucketEnd = new Date(since.getTime() + (i + 1) * bucketMs);
      const count = allLogs.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= bucketStart.getTime() && t < bucketEnd.getTime();
      }).length;
      buckets.push({ label: formatLabel(bucketStart), taps: count });
    }
    setChartData(buckets);

    // Compute stats
    const devices = new Map<string, number>();
    const locations = new Map<string, number>();
    const visitors = new Set<string>();
    let profileViews = 0;
    let cvDownloads = 0;
    let vcardDownloads = 0;

    allLogs.forEach((log) => {
      const meta = (log.metadata as Record<string, any>) ?? {};
      const ua = (meta.ua as string) ?? "";
      const device = /iPhone|iPad/i.test(ua) ? "iPhone" : /Android/i.test(ua) ? "Android" : "Desktop";
      devices.set(device, (devices.get(device) ?? 0) + 1);

      const loc = log.location ?? "Unknown";
      locations.set(loc, (locations.get(loc) ?? 0) + 1);

      visitors.add(ua || log.id);

      if (log.interaction_type === "profile_view") profileViews++;
      if (log.interaction_type === "cv_download") cvDownloads++;
      if (log.interaction_type === "vcard_download") vcardDownloads++;
    });

    let topDevice = "No data";
    let topDeviceCount = 0;
    devices.forEach((count, name) => {
      if (count > topDeviceCount) {
        topDevice = name;
        topDeviceCount = count;
      }
    });

    let topLocation = "No data";
    let topLocCount = 0;
    locations.forEach((count, name) => {
      if (count > topLocCount) {
        topLocation = name;
        topLocCount = count;
      }
    });

    setStats({
      totalTaps: allLogs.length,
      uniqueVisitors: visitors.size,
      topDevice,
      topLocation,
      profileViews,
      cvDownloads,
      vcardDownloads,
    });

    setLoading(false);
  }, [user, timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, chartData, timeframe, setTimeframe, loading, refetch: fetchData };
}
