/**
 * Sistema de Permissões RBAC para Painel Administrativo WebMarcas
 * 
 * Perfis:
 * - super_admin: Poder total
 * - admin: Operacional completo (sem poder estrutural)
 * - suporte: Atendimento e correções pontuais
 * - financeiro: Gestão de cobranças
 * - auditor: Somente leitura
 */

export type AdminRole = 'super_admin' | 'admin' | 'suporte' | 'financeiro' | 'auditor';

export type Permission = 
  // Usuários
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.block'
  // Admins
  | 'admins.manage'
  // Créditos
  | 'credits.view'
  | 'credits.adjust'
  | 'credits.add'
  | 'credits.remove'
  // Registros
  | 'registros.view'
  | 'registros.edit'
  | 'registros.reprocess'
  // Certificados
  | 'certificates.view'
  | 'certificates.reissue'
  | 'certificates.download'
  // Pagamentos
  | 'payments.view'
  | 'payments.view_details'
  | 'payments.sync'
  // Assinaturas
  | 'subscriptions.view'
  // Configurações
  | 'config.view'
  | 'config.edit'
  | 'config.maintenance'
  // Logs
  | 'logs.view'
  | 'logs.view_all';

// Mapa de permissões por role
const rolePermissions: Record<AdminRole, Permission[]> = {
  super_admin: [
    // Tudo
    'users.view', 'users.create', 'users.edit', 'users.block',
    'admins.manage',
    'credits.view', 'credits.adjust', 'credits.add', 'credits.remove',
    'registros.view', 'registros.edit', 'registros.reprocess',
    'certificates.view', 'certificates.reissue', 'certificates.download',
    'payments.view', 'payments.view_details', 'payments.sync',
    'subscriptions.view',
    'config.view', 'config.edit', 'config.maintenance',
    'logs.view', 'logs.view_all',
  ],
  
  admin: [
    // Operacional completo sem poder estrutural
    'users.view', 'users.create', 'users.edit', 'users.block',
    'credits.view', 'credits.adjust',
    'registros.view', 'registros.reprocess',
    'certificates.view', 'certificates.reissue', 'certificates.download',
    'payments.view',
    'subscriptions.view',
    'logs.view',
  ],
  
  suporte: [
    // Atendimento e correções pontuais
    'users.view',
    'registros.view',
    'certificates.view', 'certificates.reissue', 'certificates.download',
    'payments.view', // Status apenas
  ],
  
  financeiro: [
    // Gestão de cobranças
    'subscriptions.view',
    'payments.view', 'payments.view_details', 'payments.sync',
    'credits.view', // Apenas visualização
  ],
  
  auditor: [
    // Somente leitura
    'users.view',
    'registros.view',
    'certificates.view',
    'payments.view', 'payments.view_details',
    'subscriptions.view',
    'logs.view', 'logs.view_all',
    'credits.view',
  ],
};

// Labels amigáveis para os roles
export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  suporte: 'Suporte',
  financeiro: 'Financeiro',
  auditor: 'Auditor',
};

// Cores para badges
export const roleColors: Record<AdminRole, { bg: string; text: string; border: string }> = {
  super_admin: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  admin: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  suporte: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  financeiro: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  auditor: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
};

// Verifica se um role tem uma permissão específica
export function hasPermission(role: AdminRole | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Verifica se um role tem qualquer uma das permissões
export function hasAnyPermission(role: AdminRole | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(p => hasPermission(role, p));
}

// Verifica se um role tem todas as permissões
export function hasAllPermissions(role: AdminRole | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(p => hasPermission(role, p));
}

// Obtém todas as permissões de um role
export function getRolePermissions(role: AdminRole): Permission[] {
  return rolePermissions[role] || [];
}

// Verifica se é um role admin válido
export function isAdminRole(role: string | null): role is AdminRole {
  if (!role) return false;
  return ['super_admin', 'admin', 'suporte', 'financeiro', 'auditor'].includes(role);
}

// Itens de menu do admin com permissões necessárias
export interface AdminMenuItem {
  title: string;
  url: string;
  icon: string;
  permissions: Permission[];
  color: string;
  bgColor: string;
}

export const adminMenuConfig = {
  main: [
    {
      title: 'Visão Geral',
      url: '/admin',
      icon: 'LayoutDashboard',
      permissions: [] as Permission[], // Todos podem ver
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      title: 'Usuários',
      url: '/admin/usuarios',
      icon: 'Users',
      permissions: ['users.view'] as Permission[],
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      title: 'Créditos',
      url: '/admin/creditos',
      icon: 'Coins',
      permissions: ['credits.view'] as Permission[],
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
    {
      title: 'Registros Blockchain',
      url: '/admin/registros',
      icon: 'FileCheck',
      permissions: ['registros.view'] as Permission[],
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Certificados',
      url: '/admin/certificados',
      icon: 'Award',
      permissions: ['certificates.view'] as Permission[],
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
    },
  ],
  finance: [
    {
      title: 'Pagamentos',
      url: '/admin/pagamentos',
      icon: 'CreditCard',
      permissions: ['payments.view'] as Permission[],
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      title: 'Assinaturas',
      url: '/admin/assinaturas',
      icon: 'CalendarSync',
      permissions: ['subscriptions.view'] as Permission[],
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
  ],
  system: [
    {
      title: 'Monitoramento',
      url: '/admin/monitoramento',
      icon: 'Activity',
      permissions: ['config.view'] as Permission[],
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
    },
    {
      title: 'Logs e Auditoria',
      url: '/admin/logs',
      icon: 'ScrollText',
      permissions: ['logs.view'] as Permission[],
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/10',
    },
    {
      title: 'Configurações',
      url: '/admin/configuracoes',
      icon: 'Settings',
      permissions: ['config.view'] as Permission[],
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
    },
  ],
};

// Mensagens de erro por permissão negada
export const permissionDeniedMessages: Partial<Record<Permission, string>> = {
  'admins.manage': 'Apenas Super Admins podem gerenciar administradores.',
  'credits.adjust': 'Você não tem permissão para ajustar créditos.',
  'config.edit': 'Você não tem permissão para editar configurações.',
  'config.maintenance': 'Apenas Super Admins podem ativar o modo manutenção.',
  'users.block': 'Você não tem permissão para bloquear usuários.',
};
