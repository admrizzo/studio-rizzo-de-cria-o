import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Camera, Save, ArrowLeft } from "lucide-react";

interface AgentProfileEditorProps {
  onClose: () => void;
}

const AgentProfileEditor = ({ onClose }: AgentProfileEditorProps) => {
  const { profile, updateProfile, uploadPhoto } = useAuth();
  const [nome, setNome] = useState(profile?.nome || "");
  const [telefone, setTelefone] = useState(profile?.telefone || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [creci, setCreci] = useState(profile?.creci || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({ nome, telefone, whatsapp, creci });
    if (error) {
      toast.error(error);
    } else {
      toast.success("Perfil atualizado!");
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    const url = await uploadPhoto(file);
    if (url) {
      toast.success("Foto atualizada!");
    } else {
      toast.error("Erro ao enviar foto");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground/60 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-light text-foreground">Meu Perfil</h2>
      </div>

      {/* Photo */}
      <div className="flex justify-center">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full bg-muted border-2 border-[#1a6b47]/40 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {profile?.foto_url ? (
              <img src={profile.foto_url} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-foreground/30" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1a6b47] flex items-center justify-center text-white"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground/80 text-sm">Nome</Label>
          <Input value={nome} onChange={e => setNome(e.target.value)} className="bg-background border-border text-foreground" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 text-sm">Telefone</Label>
          <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(32) 99999-9999" className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 text-sm">WhatsApp</Label>
          <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5532999999999" className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 text-sm">CRECI</Label>
          <Input value={creci} onChange={e => setCreci(e.target.value)} placeholder="CRECI-MG 00000" className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-[#1a6b47] hover:bg-[#1a6b47]/90 text-white">
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Salvando..." : "Salvar perfil"}
      </Button>
    </motion.div>
  );
};

export default AgentProfileEditor;
