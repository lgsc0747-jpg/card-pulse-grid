import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Package, ClipboardList } from "lucide-react";

interface Order {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_location: string;
  payment_method: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  persona_id: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  confirmed: "bg-primary/20 text-primary",
  preparing: "bg-accent text-accent-foreground",
  shipped: "bg-chart-2/20 text-[hsl(var(--chart-2))]",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

export function OrderManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("seller_user_id", user!.id)
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order marked as ${newStatus}` });
      loadOrders();
    }
  };

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Orders
        </h2>
        <p className="text-xs text-muted-foreground">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <Card className="ios-card">
          <CardContent className="p-8 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No orders yet. Orders will appear here when customers purchase your products.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="ios-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Buyer</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Contact</TableHead>
                  <TableHead className="text-xs">Payment</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm font-medium">{order.buyer_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{order.buyer_location}</TableCell>
                    <TableCell className="text-xs font-mono">{order.buyer_phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {order.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono font-semibold">₱{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                        <SelectTrigger className="h-7 w-28 text-[10px] rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{timeSince(order.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
