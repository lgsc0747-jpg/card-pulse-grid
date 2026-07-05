import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Layers, Search, Palette, LayoutTemplate, ExternalLink, Lock, Eye, Users2, Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props { orgId: string; }

interface PersonaRow {
  id: string; user_id: string; slug: string; label: string;
  display_name: string | null; headline: string | null; avatar_url: string | null;
  accent_color: string | null; secondary_color: string | null;
  landing_bg_color: string | null;
  background_preset: string | null; background_image_url: string | null;
  is_active: boolean; is_private: boolean;
  updated_at: string; created_at: string;
  owner_name: string | null; owner_username: string | null; owner_avatar: string | null;
  page_count: number; block_count: number;
}

type Sort = "recent" | "name" | "activity";

export function AgencyStudio({ orgId }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("recent");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_org_personas", { _org_id: orgId });
    setRows((data ?? []) as PersonaRow[]);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const owners = useMemo(() => {
    const map = new Map<string, { name: string; avatar: string | null }>();
    rows.forEach((r) => {
      if (!map.has(r.user_id)) {
        map.set(r.user_id, { name: r.owner_name || r.owner_username || "Member", avatar: r.owner_avatar });
      }
    });
    return Array.from(map.entries()).map(([id, meta]) => ({ id, ...meta }));
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (ownerFilter !== "all") list = list.filter((r) => r.user_id === ownerFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((r) =>
        [r.label, r.display_name, r.headline, r.slug, r.owner_name, r.owner_username]
          .filter(Boolean).some((v) => (v as string).toLowerCase().includes(needle)),
      );
    }
    list = [...list];
    if (sort === "name") list.sort((a, b) => (a.label || "").localeCompare(b.label || ""));
    else if (sort === "activity") list.sort((a, b) => (b.page_count + b.block_count) - (a.page_count + a.block_count));
    else list.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
    return list;
  }, [rows, ownerFilter, q, sort]);

  const totals = useMemo(() => ({
    personas: rows.length,
    pages: rows.reduce((s, r) => s + r.page_count, 0),
    blocks: rows.reduce((s, r) => s + r.block_count, 0),
    creators: owners.length,
  }), [rows, owners]);

  return (
    <div className="space-y-5">
      {/* Hero strip */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[var(--shadow-card)]">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold tracking-tight inline-flex items-center gap-2">
              Shared Studio <Sparkles className="w-3.5 h-3.5 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every card, page, and design from your teammates — one seamless workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <MiniStat label="Designs" value={totals.personas} />
            <MiniStat label="Pages" value={totals.pages} />
            <MiniStat label="Blocks" value={totals.blocks} />
            <MiniStat label="Creators" value={totals.creators} />
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search designs, creators, headlines…"
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
            <SelectValue placeholder="All creators" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All creators</SelectItem>
            {owners.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="name">Name (A→Z)</SelectItem>
            <SelectItem value="activity">Most built out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">
          {rows.length === 0
            ? "No designs yet. When teammates create personas, they'll flow in here."
            : "No matches for that filter."}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <StudioCard key={r.id} row={r} isMine={r.user_id === user?.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-background/60 border border-border/60 backdrop-blur-sm">
      <div className="text-sm font-semibold tabular-nums leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function StudioCard({ row, isMine }: { row: PersonaRow; isMine: boolean }) {
  const accent = row.accent_color || "hsl(var(--primary))";
  const secondary = row.secondary_color || row.landing_bg_color || "hsl(var(--muted))";
  const bg = row.background_image_url
    ? `url(${row.background_image_url}) center/cover`
    : `linear-gradient(135deg, ${accent}, ${secondary})`;

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      {/* Preview */}
      <div
        className="relative h-32 flex items-end p-3"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="relative z-10 flex items-center gap-2">
          <Avatar className="w-10 h-10 ring-2 ring-white/40 shadow">
            <AvatarImage src={row.avatar_url ?? undefined} />
            <AvatarFallback>{(row.display_name || row.label || "?").slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="text-white leading-tight drop-shadow">
            <div className="text-sm font-semibold truncate max-w-[180px]">{row.display_name || row.label}</div>
            {row.headline && <div className="text-[11px] opacity-90 truncate max-w-[180px]">{row.headline}</div>}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {row.is_private && (
            <Badge variant="secondary" className="bg-black/40 text-white border-0 backdrop-blur-sm text-[10px]">
              <Lock className="w-3 h-3 mr-1" />Private
            </Badge>
          )}
          {!row.is_active && (
            <Badge variant="secondary" className="bg-black/40 text-white border-0 backdrop-blur-sm text-[10px]">
              Paused
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 space-y-3">
        {/* Creator */}
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={row.owner_avatar ?? undefined} />
            <AvatarFallback className="text-[9px]">
              {(row.owner_name || row.owner_username || "?").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {row.owner_name || row.owner_username || "Member"}
          </span>
          {isMine && <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1.5">You</Badge>}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><LayoutTemplate className="w-3 h-3" />{row.page_count} pages</span>
          <span className="inline-flex items-center gap-1"><Palette className="w-3 h-3" />{row.block_count} blocks</span>
          <span>{formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isMine ? (
            <>
              <Button asChild size="sm" variant="secondary" className="flex-1 h-8 text-xs">
                <Link to="/design-studio"><Palette className="w-3 h-3 mr-1" />Card</Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="flex-1 h-8 text-xs">
                <Link to="/page-builder"><LayoutTemplate className="w-3 h-3 mr-1" />Pages</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline" className="flex-1 h-8 text-xs">
              <Link to={`/p/${row.owner_username ?? ""}/${row.slug}`} target="_blank" rel="noreferrer">
                <Eye className="w-3 h-3 mr-1" />Preview
              </Link>
            </Button>
          )}
          {row.owner_username && (
            <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Open live page">
              <Link to={`/p/${row.owner_username}/${row.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {!isMine && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <Users2 className="w-3 h-3" />
            Editing another creator's design requires a delegated grant in Members.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
