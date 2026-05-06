import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useDemo } from "@/contexts/DemoContext";
import { Property } from "@/types/property";

import { isRobustCRMFeed, parseRobustCRMFeed } from "@/utils/robustcrm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileJson, AlertCircle, CheckCircle2, Globe, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const JsonImporter = () => {
  const { setProperties, setBrand, brand } = useApp();
  const { blockWrite } = useDemo();
  const [jsonText, setJsonText] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"json" | "api">("api");

  const validateProperties = (data: unknown): Property[] => {
    if (!Array.isArray(data)) throw new Error("JSON deve ser um array de imóveis");
    return data.map((item: any, i: number) => {
      if (!item.titulo) throw new Error(`Imóvel #${i + 1}: campo 'titulo' obrigatório`);
      if (!item.fotos?.length) throw new Error(`Imóvel #${i + 1}: pelo menos uma foto é obrigatória`);
      return {
        id: item.id || String(i + 1),
        titulo: item.titulo,
        tipo: item.tipo || "Imóvel",
        preco: Number(item.preco) || 0,
        endereco: item.endereco || "",
        bairro: item.bairro || "",
        cidade: item.cidade || "",
        estado: item.estado || "",
        area: Number(item.area) || 0,
        quartos: Number(item.quartos) || 0,
        banheiros: Number(item.banheiros) || 0,
        vagas: Number(item.vagas) || 0,
        descricao: item.descricao || "",
        fotos: item.fotos,
        destaque: item.destaque || false,
      };
    });
  };

  const processData = (data: any) => {
    if (isRobustCRMFeed(data)) {
      const { properties, clientName } = parseRobustCRMFeed(data);
      if (properties.length === 0) throw new Error("Nenhum imóvel com fotos encontrado no feed");
      setProperties(properties);
      setBrand({ ...brand, nome: clientName });
      toast.success(`${properties.length} imóveis importados de ${clientName}!`);
    } else if (Array.isArray(data)) {
      const validated = validateProperties(data);
      setProperties(validated);
      toast.success(`${validated.length} imóveis importados com sucesso!`);
    } else {
      throw new Error("Formato não reconhecido. Use um array JSON ou um feed RobustCRM.");
    }
  };

  const handleImportJson = () => {
    if (blockWrite()) return;
    try {
      setError(null);
      const parsed = JSON.parse(jsonText);
      processData(parsed);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleImportApi = async () => {
    if (blockWrite()) return;
    if (!apiUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const targetUrl = apiUrl.trim();
      const proxies = [
        targetUrl,
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      ];
      let res: Response | null = null;
      for (const url of proxies) {
        try {
          const r = await fetch(url);
          if (r.ok) { res = r; break; }
        } catch { continue; }
      }
      if (!res) throw new Error("Não foi possível acessar a API. Verifique a URL.");
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      processData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (blockWrite()) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        processData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Importar Catálogo</h2>
        <p className="text-muted-foreground">Conecte sua API, cole o JSON, ou envie um arquivo</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === "api" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("api")}
          className="gap-2"
        >
          <Globe className="w-4 h-4" /> URL da API
        </Button>
        <Button
          variant={mode === "json" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("json")}
          className="gap-2"
        >
          <FileJson className="w-4 h-4" /> Colar JSON
        </Button>
      </div>

      <div className="space-y-4">
        {mode === "api" ? (
          <>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.robustcrm.io/feeds/..."
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleImportApi} disabled={!apiUrl.trim() || loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {loading ? "Carregando..." : "Importar da API"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='[{"titulo": "Apartamento...", "preco": 500000, "fotos": ["url..."], ...}]'
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleImportJson} disabled={!jsonText.trim()} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Importar JSON
              </Button>
            </div>
          </>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-3 border-t border-border pt-4">
          <label>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" asChild className="gap-2 cursor-pointer">
              <span>
                <Upload className="w-4 h-4" />
                Enviar Arquivo
              </span>
            </Button>
          </label>

        </div>
      </div>
    </motion.div>
  );
};

export default JsonImporter;
