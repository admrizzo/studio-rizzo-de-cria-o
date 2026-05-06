import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Não autorizado");

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user: caller },
  } = await callerClient.auth.getUser();
  if (!caller) throw new Error("Não autorizado");

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .in("role", ["super_admin", "admin"]);

  if (!roleData || roleData.length === 0) {
    throw new Error("Acesso restrito a administradores");
  }

  return { supabase, caller };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { supabase } = await requireAdmin(req);
    const body = await req.json();
    const { action } = body;

    // ─── LIST USERS ───
    if (action === "list") {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, telefone, whatsapp, creci, foto_url, created_at")
        .order("nome", { ascending: true });

      const { data: authList } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const emailMap: Record<string, string> = {};
      for (const u of authList?.users || []) {
        if (u.email) emailMap[u.id] = u.email;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");
      const rolesMap: Record<string, string[]> = {};
      for (const r of roles || []) {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      }

      const users = (profiles || []).map((p: any) => ({
        ...p,
        email: emailMap[p.id] || null,
        roles: rolesMap[p.id] || [],
      }));

      return json({ users });
    }

    // ─── RESET PASSWORD ───
    if (action === "reset_password") {
      const { user_id, new_password } = body;
      if (!user_id || !new_password) {
        return json({ error: "user_id e new_password obrigatórios" }, 400);
      }
      if (String(new_password).length < 6) {
        return json({ error: "Senha deve ter ao menos 6 caracteres" }, 400);
      }

      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // ─── UPDATE PROFILE (nome, telefone, whatsapp, creci, foto_url) ───
    if (action === "update_profile") {
      const { user_id, nome, telefone, whatsapp, creci, foto_url } = body;
      if (!user_id) return json({ error: "user_id obrigatório" }, 400);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (nome !== undefined) update.nome = nome;
      if (telefone !== undefined) update.telefone = telefone;
      if (whatsapp !== undefined) update.whatsapp = whatsapp;
      if (creci !== undefined) update.creci = creci;
      if (foto_url !== undefined) update.foto_url = foto_url;

      const { error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", user_id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // ─── UPLOAD PHOTO (admin envia foto para qualquer corretor) ───
    if (action === "upload_photo") {
      const { user_id, file_base64, ext } = body;
      if (!user_id || !file_base64) {
        return json({ error: "user_id e file_base64 obrigatórios" }, 400);
      }
      const cleanExt = (ext || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
      const path = `${user_id}/avatar.${cleanExt}`;

      // Decode base64
      const base64Data = String(file_base64).replace(/^data:[^;]+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      const contentType =
        cleanExt === "png"
          ? "image/png"
          : cleanExt === "webp"
          ? "image/webp"
          : "image/jpeg";

      const { error: uploadErr } = await supabase.storage
        .from("agent-photos")
        .upload(path, bytes, { upsert: true, contentType });
      if (uploadErr) return json({ error: uploadErr.message }, 400);

      const { data: urlData } = supabase.storage
        .from("agent-photos")
        .getPublicUrl(path);
      const url = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ foto_url: url, updated_at: new Date().toISOString() })
        .eq("id", user_id);

      return json({ success: true, url });
    }

    // ─── UPDATE ROLE ───
    if (action === "update_role") {
      const { user_id, role, remove } = body;
      if (!user_id || !role) {
        return json({ error: "user_id e role obrigatórios" }, 400);
      }
      if (remove) {
        await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", role);
      } else {
        await supabase
          .from("user_roles")
          .upsert({ user_id, role }, { onConflict: "user_id,role" });
      }
      return json({ success: true });
    }

    // ─── DELETE USER (remove de auth + profiles + user_roles + foto storage) ───
    if (action === "delete_user") {
      const { user_id } = body;
      if (!user_id) return json({ error: "user_id obrigatório" }, 400);

      // Bloqueia exclusão de super_admin
      const { data: targetRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user_id);
      if ((targetRoles || []).some((r: any) => r.role === "super_admin")) {
        return json({ error: "Super Admin não pode ser excluído" }, 400);
      }

      // Remove foto do storage (best effort)
      try {
        const { data: list } = await supabase.storage
          .from("agent-photos")
          .list(user_id);
        if (list && list.length > 0) {
          await supabase.storage
            .from("agent-photos")
            .remove(list.map((f: any) => `${user_id}/${f.name}`));
        }
      } catch (_) {}

      // Remove roles e profile (FK não-existente, então deletar manualmente)
      await supabase.from("user_roles").delete().eq("user_id", user_id);
      await supabase.from("profiles").delete().eq("id", user_id);

      // Remove do auth — isso cascateia no profiles via id, mas já garantimos acima
      const { error } = await supabase.auth.admin.deleteUser(user_id);
      if (error) return json({ error: error.message }, 400);

      return json({ success: true });
    }

    return json({ error: `Ação desconhecida: ${action}` }, 400);
  } catch (error: any) {
    console.error("manage-users error:", error);
    const status = error.message?.includes("autorizado") || error.message?.includes("restrito") ? 401 : 500;
    return json({ error: error.message }, status);
  }
});