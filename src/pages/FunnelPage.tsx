import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Palette, FileText, Sparkles } from "lucide-react";
import { springIOS, fadeUp } from "@/lib/motion";
import PersonasPage from "@/pages/PersonasPage";
import DesignStudioPage from "@/pages/DesignStudioPage";
import PageBuilderPage from "@/pages/PageBuilderPage";

type FunnelTab = "personas" | "card" | "page";

const TABS: { id: FunnelTab; label: string; icon: any; hint: string }[] = [
  { id: "personas", label: "Personas", icon: Users, hint: "Identities" },
  { id: "card", label: "Card Studio", icon: Palette, hint: "Visual" },
  { id: "page", label: "Page Builder", icon: FileText, hint: "Content" },
];

const FunnelPage = () => {
  const [tab, setTab] = useState<FunnelTab>(() => {
    const hash = window.location.hash.replace("#", "");
    return (TABS.find((t) => t.id === hash)?.id ?? "personas") as FunnelTab;
  });

  const onChange = (value: string) => {
    setTab(value as FunnelTab);
    window.history.replaceState(null, "", `#${value}`);
  };

  const Header = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springIOS}
        className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 backdrop-blur-xl bg-background/70 border-b border-border/40"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[var(--shadow-card)]">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-title-2 leading-tight">Funnel</h1>
              <p className="text-xs text-muted-foreground">
                Personas, card design and pages — one canvas
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={onChange}>
            <TabsList className="rounded-2xl bg-muted/40 backdrop-blur-md p-1 h-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="relative rounded-xl px-3 sm:px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 mr-2 opacity-80" />
                    <span className="hidden xs:inline">{t.label}</span>
                    <span className="xs:hidden">{t.hint}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
    ),
    [tab]
  );

  return (
    <DashboardLayout>
      {Header}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
          >
            {tab === "personas" && <EmbeddedPage><PersonasPage /></EmbeddedPage>}
            {tab === "card" && <EmbeddedPage><DesignStudioPage /></EmbeddedPage>}
            {tab === "page" && <EmbeddedPage><PageBuilderPage /></EmbeddedPage>}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

/**
 * The embedded sub-pages already render their own DashboardLayout.
 * We strip the outer chrome by isolating them in a contained wrapper,
 * relying on CSS to hide nested layout duplicates.
 */
function EmbeddedPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="funnel-embedded">
      {children}
    </div>
  );
}

export default FunnelPage;
