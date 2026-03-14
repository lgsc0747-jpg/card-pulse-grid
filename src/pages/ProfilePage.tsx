import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [username, setUsername] = useState("admin_user");
  const [email, setEmail] = useState("admin@nfchub.io");
  const { toast } = useToast();

  const handleSave = () => {
    if (!username.trim() || !email.trim()) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-accent text-accent-foreground text-xl font-display">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
