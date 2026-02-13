import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminActionLog } from "@/hooks/useAdminActionLog";
import {
  Handshake, Plus, Copy, Users, Clock, CheckCircle2, Ban,
  Loader2, ExternalLink, Instagram,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PartnerLink {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface PartnerUser {
  id: string;
  user_id: string;
  full_name: string | null;
  partner_status: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  created_at: string;
  is_blocked: boolean;
}

export default function AdminParcerias() {
  const { user: adminUser } = useAuth();
  const { logAction } = useAdminActionLog();

  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [partners, setPartners] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [linksRes, partnersRes] = await Promise.all([
        supabase.from("partner_links").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, user_id, full_name, partner_status, instagram_url, tiktok_url, created_at, is_blocked").eq("is_partner", true).order("created_at", { ascending: false }),
      ]);

      if (linksRes.data) setLinks(linksRes.data as PartnerLink[]);
      if (partnersRes.data) setPartners(partnersRes.data as PartnerUser[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateLink() {
    if (!adminUser) return;
    setGenerating(true);

    try {
      const code = crypto.randomUUID().slice(0, 8);
      const { error } = await supabase.from("partner_links").insert({
        code,
        created_by: adminUser.id,
      });

      if (error) throw error;

      await logAction({
        actionType: "partner_link_created",
        targetType: "partner_link",
        targetId: code,
        details: { code },
      });

      toast.success("Link de parceria gerado!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar link");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleLink(link: PartnerLink) {
    try {
      const { error } = await supabase
        .from("partner_links")
        .update({ is_active: !link.is_active })
        .eq("id", link.id);

      if (error) throw error;
      toast.success(link.is_active ? "Link desativado" : "Link ativado");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar link");
    }
  }

  function copyLink(code: string) {
    const publishedUrl = "https://wemchain.lovable.app";
    const url = `${publishedUrl}/parceria/register?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  async function handlePartnerAction(action: "approve" | "block") {
    if (!selectedPartner || !adminUser) return;
    setActionLoading(true);

    try {
      const { data, error } = await supabase.rpc("handle_partner_approval", {
        p_user_id: selectedPartner.user_id,
        p_action: action,
        p_admin_id: adminUser.id,
      });

      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error);

      await logAction({
        actionType: action === "approve" ? "partner_approved" : "partner_blocked",
        targetType: "user",
        targetId: selectedPartner.user_id,
        details: { user_name: selectedPartner.full_name },
      });

      toast.success(action === "approve" ? "Parceiro aprovado!" : "Parceiro bloqueado!");
      setDetailOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar ação");
    } finally {
      setActionLoading(false);
    }
  }

  const stats = {
    total: partners.length,
    pending: partners.filter((p) => p.partner_status === "pending").length,
    approved: partners.filter((p) => p.partner_status === "approved").length,
    blocked: partners.filter((p) => p.partner_status === "blocked").length,
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Aprovado</Badge>;
      case "blocked":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Bloqueado</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display flex items-center gap-2">
            <Handshake className="h-7 w-7 text-primary" />
            Parcerias
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie links de parceria e influenciadores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Pendentes</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-yellow-500">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Aprovados</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-500">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                <span className="text-sm text-muted-foreground">Bloqueados</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-destructive">{stats.blocked}</p>
            </CardContent>
          </Card>
        </div>

        {/* Links Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Links de Parceria</CardTitle>
            <Button onClick={generateLink} disabled={generating} size="sm">
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Gerar Link
            </Button>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum link gerado ainda</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-mono text-sm">{link.code}</TableCell>
                        <TableCell>{format(new Date(link.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                        <TableCell>
                          <Badge variant={link.is_active ? "default" : "secondary"}>
                            {link.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => copyLink(link.code)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Switch checked={link.is_active} onCheckedChange={() => toggleLink(link)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partners Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usuários de Parceria</CardTitle>
          </CardHeader>
          <CardContent>
            {partners.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum parceiro cadastrado</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Instagram</TableHead>
                      <TableHead>TikTok</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.full_name || "—"}</TableCell>
                        <TableCell>
                          {partner.instagram_url ? (
                            <a href={partner.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
                              <Instagram className="h-3 w-3" />
                              Perfil
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          {partner.tiktok_url ? (
                            <a href={partner.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
                              TikTok
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell>{format(new Date(partner.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>{getStatusBadge(partner.partner_status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedPartner(partner); setDetailOpen(true); }}>
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Partner Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Parceiro</DialogTitle>
            </DialogHeader>
            {selectedPartner && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedPartner.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPartner.partner_status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastro</p>
                    <p className="text-sm">{format(new Date(selectedPartner.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  {selectedPartner.instagram_url ? (
                    <a href={selectedPartner.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <Instagram className="h-4 w-4" />
                      {selectedPartner.instagram_url}
                    </a>
                  ) : <p>—</p>}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">TikTok</p>
                  {selectedPartner.tiktok_url ? (
                    <a href={selectedPartner.tiktok_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      {selectedPartner.tiktok_url}
                    </a>
                  ) : <p>—</p>}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {selectedPartner.partner_status !== "approved" && (
                    <Button onClick={() => handlePartnerAction("approve")} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                      {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Aprovar Parceria
                    </Button>
                  )}
                  {selectedPartner.partner_status !== "blocked" && (
                    <Button onClick={() => handlePartnerAction("block")} disabled={actionLoading} variant="destructive" className="flex-1">
                      {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
                      Bloquear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
