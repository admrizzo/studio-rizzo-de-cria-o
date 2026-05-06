import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Loader2, Film, ImageIcon, Wand2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";

const AuthPage = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [conceptIndex, setConceptIndex] = useState(0);

  const concepts = ["Conteúdo", "Movimento", "Luz", "História", "Imagem", "Direção"];

  useEffect(() => {
    const id = setInterval(
      () => setConceptIndex((i) => (i + 1) % concepts.length),
      2200,
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(
        error.toLowerCase().includes("invalid")
          ? "E-mail ou senha incorretos"
          : error,
      );
    } else {
      toast.success("Bem-vindo ao Studio");
    }
    setLoading(false);
  };

  const STUDIO_GREEN = "#39FF14";
  const STUDIO_PINK = "#ec5a8a";
  const STUDIO_ORANGE = "#ff8a5b";
  const STUDIO_GRAY = "#3d3d3f";

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white relative overflow-hidden flex">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-1/2 -left-1/4 w-[900px] h-[900px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(57,255,20,0.18) 0%, rgba(57,255,20,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-1/3 -right-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(236,90,138,0.20) 0%, rgba(236,90,138,0) 70%)",
        }}
      />

      <div className="hidden lg:flex relative z-10 w-1/2 flex-col justify-between p-14 xl:p-20">
        <div className="flex items-center gap-3">
          <BrandMark size="lg" variant="dark" />
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em]" style={{ color: STUDIO_GREEN }}>
            <span className="w-8 h-px" style={{ background: STUDIO_GREEN, opacity: 0.7 }} />
            TAKE 01, CENA 24
          </div>

          <h1
            className="text-[68px] xl:text-[88px] leading-[0.95] tracking-tight uppercase"
            style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800 }}
          >
            ONDE IMÓVEIS
            <br />
            VIRAM
            <br />
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={conceptIndex}
                  initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -30, opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.5 }}
                  className="inline-block"
                  style={{
                    background: `linear-gradient(135deg, ${STUDIO_GREEN} 0%, ${STUDIO_PINK} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {concepts[conceptIndex].toUpperCase()}.
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-white/50 text-base max-w-md leading-relaxed">
            Studio de criação para o seu time. Vídeos, artes editoriais e
            legendas, produzidas com a precisão de um set de cinema.
          </p>

          <div className="flex items-center gap-6 pt-4">
            {[
              { icon: Film, label: "Vídeos" },
              { icon: ImageIcon, label: "Artes" },
              { icon: Wand2, label: "Legendas" },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-widest font-bold"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                <t.icon className="w-3.5 h-3.5" style={{ color: STUDIO_GREEN }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between text-[10px] text-white/30 uppercase tracking-[0.3em]">
          <span>© SUA IMOBILIÁRIA</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: STUDIO_GREEN }} />
            On Air
          </span>
        </div>
      </div>

      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <BrandMark size="lg" variant="dark" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-1 mb-0">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 flex-1 -skew-x-12"
                  style={{
                    background: i % 2 === 0 ? "#fff" : STUDIO_GRAY,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 border-t-0 rounded-b-2xl p-8 sm:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
              <div className="space-y-1 mb-8">
                <p
                  className="text-[10px] uppercase tracking-[0.4em] font-bold"
                  style={{ fontFamily: "'Barlow', sans-serif" }}
                >
                  <span style={{
                    background: `linear-gradient(135deg, ${STUDIO_GREEN} 0%, ${STUDIO_PINK} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    ACESSO RESTRITO, EQUIPE
                  </span>
                </p>
                <h2
                  className="text-3xl uppercase tracking-tight"
                  style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800 }}
                >
                  ENTRE NO SET.
                </h2>
                <p className="text-white/40 text-sm pt-1">
                  Use suas credenciais para acessar o studio.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold"
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  >
                    E-mail corporativo
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@imobiliaria.com.br"
                      className="pl-10 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#39FF14]/40 focus-visible:border-[#39FF14]/40"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold"
                    style={{ fontFamily: "'Barlow', sans-serif" }}
                  >
                    Senha
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 transition-colors" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#39FF14]/40 focus-visible:border-[#39FF14]/40"
                      minLength={6}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-12 relative overflow-hidden border-0 font-bold uppercase tracking-wider"
                  style={{
                    background: STUDIO_GREEN,
                    color: "#000",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Aguarde...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" /> ACTION
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/30">
                <span>v1.0, 2026</span>
                <span>Sem acesso? Fale com o admin</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-0">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 -skew-x-12"
                  style={{
                    background: i % 2 === 0 ? STUDIO_GRAY : "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
