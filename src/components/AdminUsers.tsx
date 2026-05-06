import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Copy,
  Key,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";

interface AdminUserRow {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  creci: string | null;
  foto_url: string | null;
  roles: string[];
}

interface AdminUsersProps {
  onClose: () => void;
}

const ROLE_BADGE: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  corretor: "Corretor",
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AdminUsers: React.FC<AdminUsersProps> = ({ onClose }) => {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reset password
  const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
  const [newPassword, setNewPassword] = useState("trocar123");
  const [resetting, setResetting] = useState(false);

  // Edit profile
  const [editTarget, setEditTarget] = useState<AdminUserRow | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    telefone: "",
    whatsapp: "",
    creci: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Delete user
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "list" },
    });
    if (error || !data?.users) {
      toast.error(data?.error || "Erro ao carregar usuários");
    } else {
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    const senha = newPassword.trim();
    if (senha.length < 6) {
      toast.error("Senha precisa ter ao menos 6 caracteres");
      return;
    }
    setResetting(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: {
        action: "reset_password",
        user_id: resetTarget.id,
        new_password: senha,
      },
    });
    setResetting(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Erro ao resetar senha");
      return;
    }
    const nome = resetTarget.nome || resetTarget.email;
    toast.success(`Senha de ${nome} definida como: ${senha}`, {
      duration: 12000,
      description: "Copie e envie ao usuário.",
    });
    try {
      await navigator.clipboard.writeText(senha);
    } catch {}
    setResetTarget(null);
    setNewPassword("trocar123");
  };

  const openEdit = (u: AdminUserRow) => {
    setEditTarget(u);
    setEditForm({
      nome: u.nome || "",
      telefone: u.telefone || "",
      whatsapp: u.whatsapp || "",
      creci: u.creci || "",
    });
  };

  const handleSaveProfile = async () => {
    if (!editTarget) return;
    setSavingProfile(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: {
        action: "update_profile",
        user_id: editTarget.id,
        ...editForm,
      },
    });
    setSavingProfile(false);
    if (error || !data?.success) {
      toast.error(data?.error || "Erro ao salvar perfil");
      return;
    }
    toast.success("Perfil atualizado");
    setEditTarget(null);
    fetchUsers();
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editTarget) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto deve ter no máximo 5MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const base64 = await fileToBase64(file);
      const ext = file.name.split(".").pop() || "jpg";
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "upload_photo",
          user_id: editTarget.id,
          file_base64: base64,
          ext,
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error || "Erro ao enviar foto");
      } else {
        toast.success("Foto atualizada");
        setEditTarget({ ...editTarget, foto_url: data.url });
        fetchUsers();
      }
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "delete_user", user_id: deleteTarget.id },
    });
    setDeleting(false);
    if (error || !data?.success) {
      toast.error(data?.error || error?.message || "Erro ao excluir usuário");
      return;
    }
    toast.success(`Usuário ${deleteTarget.nome || deleteTarget.email} excluído`);
    setDeleteTarget(null);
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.nome?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.creci?.toLowerCase().includes(s)
    );
  });

  const isSuperAdmin = (u: AdminUserRow) => u.roles.includes("super_admin");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gestão de Usuários</h2>
            <p className="text-xs text-muted-foreground">
              {users.length} usuário(s) · resete senhas, edite fotos e exclua corretores
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou CRECI..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando usuários...
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map((u) => {
            const isSuper = isSuperAdmin(u);
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                  {u.foto_url ? (
                    <img
                      src={u.foto_url}
                      alt={u.nome || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-foreground text-sm font-medium truncate">
                      {u.nome || "(sem nome)"}
                    </p>
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                          r === "super_admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : r === "admin"
                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {ROLE_BADGE[r] || r}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs truncate">
                    {u.email || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8"
                    title="Editar perfil e foto"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary h-8 w-8"
                    title="Resetar senha"
                    onClick={() => {
                      setResetTarget(u);
                      setNewPassword("trocar123");
                    }}
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-8 w-8 disabled:opacity-30"
                    title={isSuper ? "Super Admin não pode ser excluído" : "Excluir usuário"}
                    disabled={isSuper}
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Nenhum usuário encontrado
            </p>
          )}
        </div>
      )}

      {/* Reset password dialog */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => !o && setResetTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> Resetar senha
            </DialogTitle>
            <DialogDescription>
              Defina uma nova senha temporária para{" "}
              <span className="text-foreground font-medium">
                {resetTarget?.nome || resetTarget?.email}
              </span>
              . O usuário deve trocar no primeiro acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Nova senha</Label>
            <div className="flex gap-2">
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(newPassword);
                  toast.success("Senha copiada");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Será copiada automaticamente após salvar.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} disabled={resetting}>
              {resetting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              Definir senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit profile dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar perfil do corretor</DialogTitle>
            <DialogDescription>
              A foto será exibida nas artes do corretor.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-2">
            <div className="relative">
              <div
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-muted border-2 border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/60 transition-colors"
              >
                {editTarget?.foto_url ? (
                  <img
                    src={editTarget.foto_url}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input
                value={editForm.nome}
                onChange={(e) =>
                  setEditForm({ ...editForm, nome: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Telefone</Label>
                <Input
                  value={editForm.telefone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telefone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">WhatsApp</Label>
                <Input
                  value={editForm.whatsapp}
                  onChange={(e) =>
                    setEditForm({ ...editForm, whatsapp: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CRECI</Label>
              <Input
                value={editForm.creci}
                onChange={(e) =>
                  setEditForm({ ...editForm, creci: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>
              Fechar
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Salvar perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete user confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Excluir usuário?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é <strong>permanente</strong>. O acesso de{" "}
              <span className="text-foreground font-medium">
                {deleteTarget?.nome || deleteTarget?.email}
              </span>{" "}
              será revogado e seus dados (perfil, foto e papéis) serão removidos do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default AdminUsers;