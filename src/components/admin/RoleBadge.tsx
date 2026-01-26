import { AdminRole, roleLabels, roleColors } from "@/lib/adminPermissions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  Shield, 
  Headphones, 
  Wallet, 
  Eye 
} from "lucide-react";

interface RoleBadgeProps {
  role: AdminRole;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const roleIcons: Record<AdminRole, React.ComponentType<{ className?: string }>> = {
  super_admin: ShieldCheck,
  admin: Shield,
  suporte: Headphones,
  financeiro: Wallet,
  auditor: Eye,
};

export function RoleBadge({ role, showIcon = true, size = "md" }: RoleBadgeProps) {
  const colors = roleColors[role];
  const label = roleLabels[role];
  const Icon = roleIcons[role];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        "font-medium gap-1.5"
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </Badge>
  );
}
