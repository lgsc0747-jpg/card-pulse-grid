import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Save, Loader2, Camera, Mail, Link2, Unlink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    display_name: "",
    username: "",
    email_public: "",
  });

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // Linked identities (Google / Apple)
  const [identities, setIdentities] = useState<Array<{ id: string; provider: string }>>([]);
  const [identityBusy, setIdentityBusy] = useState<string | null>(null);

  const refreshIdentities = async () => {
    const { data } = await supabase.auth.getUserIdentities();
    setIdentities(((data?.identities ?? []) as any[]).map((i) => ({ id: i.identity_id, provider: i.provider })));
  };

  useEffect(() => { refreshIdentities(); }, [user]);

  const handleChangeEmail = async () => {
    if (!newEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }
    setChangingEmail(true);
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: window.location.origin + "/profile" },
    );
    setChangingEmail(false);
    if (error) return toast({ title: "Update failed", description: error.message, variant: "destructive" });
    toast({ title: "Confirmation sent", description: "Check both your old and new inbox to confirm the change." });
    setNewEmail("");
  };

  const linkProvider = async (provider: "google" | "apple") => {
    setIdentityBusy(provider);
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: window.location.origin + "/profile" },
    } as any);
    setIdentityBusy(null);
    if (error) toast({ title: "Could not start linking", description: error.message, variant: "destructive" });
  };

  const unlinkProvider = async (provider: string) => {
    const target = (await supabase.auth.getUserIdentities()).data?.identities?.find((i: any) => i.provider === provider);
    if (!target) return;
    setIdentityBusy(provider);
    const { error } = await supabase.auth.unlinkIdentity(target as any);
    setIdentityBusy(null);
    if (error) return toast({ title: "Unlink failed", description: error.message, variant: "destructive" });
    toast({ title: `Disconnected ${provider}` });
    refreshIdentities();
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url, display_name, username, email_public")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setProfile({
            display_name: data.display_name ?? "",
            username: data.username ?? "",
            email_public: data.email_public ?? user.email ?? "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Account updated" });
    setSaving(false);
  };

  const update = (f: string, v: string) => setProfile((p) => ({ ...p, [f]: v }));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: newUrl }).eq("user_id", user.id);
    setAvatarUrl(newUrl);
    toast({ title: "Avatar updated" });
    setUploading(false);
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
      <div className="space-y-6 max-w-2xl">
        <div>
          <p className="text-eyebrow text-muted-foreground">Account</p>
          <h1 className="text-display font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Account-level details. Public design and content live in your <a href="/personas" className="text-accent underline">personas</a>.
          </p>
        </div>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="text-sm">Account details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="w-16 h-16">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                  <AvatarFallback className="text-xl">{(profile.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div>
                <p className="font-medium">{profile.display_name || "Unnamed"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile.username && <p className="text-xs text-accent">/p/{profile.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-eyebrow text-muted-foreground">Display name</label>
                <Input value={profile.display_name} onChange={(e) => update("display_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-eyebrow text-muted-foreground">Username</label>
                <Input value={profile.username} onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-eyebrow text-muted-foreground">Public email (account fallback)</label>
                <Input type="email" value={profile.email_public} onChange={(e) => update("email_public", e.target.value)} />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="rounded-sm">
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Sign-in email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-mono">{user?.email}</span>. Changing requires confirming
              from <em>both</em> the old and new inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button onClick={handleChangeEmail} disabled={changingEmail || !newEmail} className="rounded-sm">
                {changingEmail ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Mail className="w-4 h-4 mr-1.5" />}
                Update email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" /> Linked accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Sign in faster by linking a Google or Apple account. You can keep your password too.
            </p>
            {(["google", "apple"] as const).map((p) => {
              const linked = identities.some((i) => i.provider === p);
              return (
                <div key={p} className="flex items-center justify-between p-3 border border-border rounded-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="capitalize text-sm font-medium">{p}</span>
                    {linked && <Badge variant="secondary" className="text-[10px]">Linked</Badge>}
                  </div>
                  {linked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-sm"
                      disabled={identityBusy === p || identities.length <= 1}
                      onClick={() => unlinkProvider(p)}
                    >
                      <Unlink className="w-3.5 h-3.5 mr-1.5" />Unlink
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-sm"
                      disabled={identityBusy === p}
                      onClick={() => linkProvider(p)}
                    >
                      {identityBusy === p ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5 mr-1.5" />}
                      Link {p}
                    </Button>
                  )}
                </div>
              );
            })}
            <p className="text-[10px] text-muted-foreground">
              GitHub and other providers aren't supported yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
