import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROTATION_DAYS = 90;
const SNOOZE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Once mounted, checks if the authenticated user's password is older than 90 days.
 * If so, shows a non-dismissable-but-snoozable prompt to update the password.
 *
 * The "password age" is read from `prefs.passwordChangedAt`. If unset (legacy users),
 * we fall back to `user.created_at` so old accounts get prompted within the next cycle.
 */
export function PasswordRotationPrompt() {
  const { user } = useAuth();
  const { prefs, setPref, loading } = usePreferences();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Email-password users only (skip OAuth)
  const isEmailUser = useMemo(
    () => (user?.app_metadata?.provider ?? user?.app_metadata?.providers?.[0]) === "email",
    [user],
  );

  useEffect(() => {
    if (loading || !user || !isEmailUser) return;
    const baseline = prefs.passwordChangedAt
      ? new Date(prefs.passwordChangedAt).getTime()
      : (user.created_at ? new Date(user.created_at).getTime() : Date.now());
    const ageDays = (Date.now() - baseline) / DAY_MS;
    if (ageDays < ROTATION_DAYS) return;

    if (prefs.passwordRotationSnoozedAt) {
      const snoozedAge = (Date.now() - new Date(prefs.passwordRotationSnoozedAt).getTime()) / DAY_MS;
      if (snoozedAge < SNOOZE_DAYS) return;
    }
    setOpen(true);
  }, [loading, user, isEmailUser, prefs.passwordChangedAt, prefs.passwordRotationSnoozedAt]);

  const handleSnooze = () => {
    setPref("passwordRotationSnoozedAt", new Date().toISOString());
    setOpen(false);
  };

  const handleUpdate = async () => {
    if (pwd.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (pwd !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not update password", description: error.message, variant: "destructive" });
      return;
    }
    setPref("passwordChangedAt", new Date().toISOString());
    setPref("passwordRotationSnoozedAt", undefined as any);
    setPwd("");
    setConfirm("");
    setOpen(false);
    toast({ title: "Password updated", description: "Your account is secured for the next 90 days." });
  };

  if (!user || !isEmailUser) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleSnooze(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <DialogTitle className="font-display">Time to refresh your password</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            For your account's security, we recommend rotating your password every 90 days. Choose a new one to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd" className="text-xs">New password</Label>
            <Input id="new-pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd" className="text-xs">Confirm password</Label>
            <Input id="confirm-pwd" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleSnooze} disabled={submitting}>
            Remind me in 7 days
          </Button>
          <Button onClick={handleUpdate} disabled={submitting} className="gradient-primary">
            {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Update password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
