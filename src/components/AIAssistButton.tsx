import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIAssistButtonProps {
  kind: "bio" | "headline" | "rewrite";
  context?: string;
  tone?: string;
  onResult: (text: string) => void;
  label?: string;
}

export const AIAssistButton = ({ kind, context, tone, onResult, label }: AIAssistButtonProps) => {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-persona-assist", {
        body: { kind, context, tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.text) {
        onResult(data.text);
        toast.success("AI suggestion ready");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={run}
      disabled={loading}
      className="h-7 px-2 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {label ?? "AI"}
    </Button>
  );
};
