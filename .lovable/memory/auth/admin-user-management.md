---
name: Admin User Management
description: Tabela user_roles + edge function manage-users + página AdminUsers para reset de senha e edição de fotos/perfis
type: feature
---

Admins (super_admin/admin) gerenciam corretores via:
- Tabela `user_roles` (enum app_role: super_admin/admin/corretor) — separada de profiles para evitar privilege escalation
- Funções SECURITY DEFINER: `has_role(user_id, role)`, `is_admin(user_id)`
- Edge function `manage-users` (actions: list, reset_password, update_profile, upload_photo, update_role) — valida admin via service_role
- Página `src/components/AdminUsers.tsx` acessível via item "Usuários" no menu lateral (só visível se `isAdmin` em AuthContext)
- RLS: admins têm SELECT/UPDATE em todos profiles; storage `agent-photos` permite upload/update/delete por admin em qualquer pasta

Bootstrap inicial: diogo@souzagomes.com.br = super_admin; demais usuários = corretor.
Reset de senha: senha padrão sugerida `souzagomes`, copiada para clipboard automaticamente.
Foto enviada pelo admin: gera URL pública e atualiza profile.foto_url — aparece imediatamente nas artes.

**Why:** padrão herdado do projeto "Central de propostas SG" (349d3280-...) para consistência operacional entre sistemas SG.