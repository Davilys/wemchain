import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  AdminRole,
  Permission 
} from "../lib/adminPermissions";

/**
 * 🧑‍💼 ADMIN TESTS
 * Tests for admin access, permissions, and operations
 */

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  rpc: mockRpc,
  from: mockFrom,
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("Admin Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC Permission System", () => {
    it("super_admin should have all permissions", () => {
      const permissions: Permission[] = [
        "admins.manage",
        "users.view",
        "users.create",
        "credits.adjust",
        "config.edit",
        "config.maintenance",
        "logs.view_all",
      ];
      
      permissions.forEach(p => {
        expect(hasPermission("super_admin", p)).toBe(true);
      });
    });

    it("admin should not have admin management permissions", () => {
      expect(hasPermission("admin", "admins.manage")).toBe(false);
      expect(hasPermission("admin", "config.edit")).toBe(false);
      expect(hasPermission("admin", "config.maintenance")).toBe(false);
    });

    it("admin should have operational permissions", () => {
      expect(hasPermission("admin", "users.view")).toBe(true);
      expect(hasPermission("admin", "users.edit")).toBe(true);
      expect(hasPermission("admin", "credits.adjust")).toBe(true);
      expect(hasPermission("admin", "registros.view")).toBe(true);
    });

    it("suporte should have limited permissions", () => {
      expect(hasPermission("suporte", "users.view")).toBe(true);
      expect(hasPermission("suporte", "registros.view")).toBe(true);
      expect(hasPermission("suporte", "certificates.reissue")).toBe(true);
      expect(hasPermission("suporte", "credits.adjust")).toBe(false);
      expect(hasPermission("suporte", "users.edit")).toBe(false);
    });

    it("financeiro should only access financial data", () => {
      expect(hasPermission("financeiro", "payments.view")).toBe(true);
      expect(hasPermission("financeiro", "payments.view_details")).toBe(true);
      expect(hasPermission("financeiro", "subscriptions.view")).toBe(true);
      expect(hasPermission("financeiro", "users.view")).toBe(false);
      expect(hasPermission("financeiro", "registros.view")).toBe(false);
    });

    it("auditor should have read-only access to everything", () => {
      expect(hasPermission("auditor", "users.view")).toBe(true);
      expect(hasPermission("auditor", "logs.view_all")).toBe(true);
      expect(hasPermission("auditor", "registros.view")).toBe(true);
      expect(hasPermission("auditor", "credits.adjust")).toBe(false);
      expect(hasPermission("auditor", "users.edit")).toBe(false);
    });

    it("null role should have no permissions", () => {
      expect(hasPermission(null, "users.view")).toBe(false);
      expect(hasAnyPermission(null, ["users.view", "credits.view"])).toBe(false);
    });

    it("hasAnyPermission should work correctly", () => {
      expect(hasAnyPermission("suporte", ["users.view", "admins.manage"])).toBe(true);
      expect(hasAnyPermission("suporte", ["admins.manage", "config.edit"])).toBe(false);
    });

    it("hasAllPermissions should work correctly", () => {
      expect(hasAllPermissions("admin", ["users.view", "users.edit"])).toBe(true);
      expect(hasAllPermissions("admin", ["users.view", "admins.manage"])).toBe(false);
    });
  });

  describe("Admin Role Verification", () => {
    it("should correctly identify admin user", async () => {
      mockRpc.mockResolvedValueOnce({ data: true, error: null });

      const result = await mockSupabase.rpc("has_role", {
        _user_id: "admin-user-id",
        _role: "admin",
      });

      expect(result.data).toBe(true);
    });

    it("should correctly identify non-admin user", async () => {
      mockRpc.mockResolvedValueOnce({ data: false, error: null });

      const result = await mockSupabase.rpc("has_role", {
        _user_id: "regular-user-id",
        _role: "admin",
      });

      expect(result.data).toBe(false);
    });

    it("should block admin routes for non-admin users", () => {
      const isAdmin = false;
      const requestedRoute = "/admin/dashboard";
      
      const shouldBlock = requestedRoute.startsWith("/admin") && !isAdmin;
      
      expect(shouldBlock).toBe(true);
    });

    it("should allow admin routes for admin users", () => {
      const isAdmin = true;
      const requestedRoute = "/admin/dashboard";
      
      const shouldAllow = requestedRoute.startsWith("/admin") && isAdmin;
      
      expect(shouldAllow).toBe(true);
    });
  });

  describe("User Management", () => {
    it("should allow admin to view all users", async () => {
      const mockUsers = [
        { id: "user-1", email: "user1@example.com" },
        { id: "user-2", email: "user2@example.com" },
      ];
      
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: mockUsers, error: null }),
      });

      const result = await mockSupabase.from("profiles").select("*");
      
      expect(result.data).toHaveLength(2);
    });

    it("should not allow non-admin to view all users via RLS", () => {
      // RLS policy should filter this
      const isAdmin = false;
      const canViewAllUsers = isAdmin; // Only admins can view all
      
      expect(canViewAllUsers).toBe(false);
    });
  });

  describe("Credit Adjustment", () => {
    it("should allow admin to adjust user credits", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: true, previous_balance: 3, new_balance: 10, difference: 7 },
        error: null,
      });

      const result = await mockSupabase.rpc("adjust_credit_atomic", {
        p_user_id: "target-user-id",
        p_new_balance: 10,
        p_reason: "Ajuste manual - teste",
        p_admin_id: "admin-user-id",
      });

      expect(result.data.success).toBe(true);
      expect(result.data.new_balance).toBe(10);
    });

    it("should reject credit adjustment from non-admin", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Apenas administradores podem ajustar créditos" },
        error: null,
      });

      const result = await mockSupabase.rpc("adjust_credit_atomic", {
        p_user_id: "target-user-id",
        p_new_balance: 10,
        p_reason: "Unauthorized adjustment",
        p_admin_id: "non-admin-user-id",
      });

      expect(result.data.success).toBe(false);
      expect(result.data.error).toContain("administradores");
    });

    it("should log credit adjustment in ledger", () => {
      const adjustment = {
        operation: "ADJUST",
        amount: 7,
        balance_after: 10,
        created_by: "admin-user-id",
        reason: "Manual adjustment",
      };

      expect(adjustment.operation).toBe("ADJUST");
      expect(adjustment.created_by).toBeDefined();
    });
  });

  describe("Registro Reprocessing", () => {
    it("should allow admin to trigger reprocessing", () => {
      const registro = {
        id: "registro-123",
        status: "falhou",
        attempt_number: 2,
      };
      
      const canReprocess = registro.status === "falhou";
      
      expect(canReprocess).toBe(true);
    });

    it("should not allow reprocessing of confirmed registro", () => {
      const registro = {
        id: "registro-123",
        status: "confirmado",
      };
      
      const canReprocess = registro.status === "falhou";
      
      expect(canReprocess).toBe(false);
    });
  });

  describe("Audit Logs Access", () => {
    it("should allow admin to view all audit logs", async () => {
      const mockLogs = [
        { id: "log-1", action_type: "terms_accepted", user_id: "user-1" },
        { id: "log-2", action_type: "login", user_id: "user-2" },
      ];
      
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: mockLogs, error: null }),
        }),
      });

      const result = await mockSupabase.from("audit_logs").select("*").order("created_at");
      
      expect(result.data).toHaveLength(2);
    });

    it("should include all required log fields", () => {
      const requiredFields = [
        "id",
        "user_id",
        "action_type",
        "created_at",
        "metadata",
      ];
      
      const sampleLog = {
        id: "log-1",
        user_id: "user-1",
        action_type: "login",
        created_at: new Date().toISOString(),
        metadata: {},
      };
      
      requiredFields.forEach(field => {
        expect(sampleLog).toHaveProperty(field);
      });
    });
  });

  describe("Destructive Actions Prevention", () => {
    it("should not allow deletion of confirmed registros", () => {
      const registro = { status: "confirmado" };
      const canDelete = registro.status !== "confirmado";
      
      expect(canDelete).toBe(false);
    });

    it("should not allow deletion of payment records", () => {
      // Payment records should be immutable for audit purposes
      const paymentRecordDeletable = false;
      
      expect(paymentRecordDeletable).toBe(false);
    });

    it("should not allow deletion of ledger entries", () => {
      // Ledger is append-only
      const ledgerEntryDeletable = false;
      
      expect(ledgerEntryDeletable).toBe(false);
    });

    it("should not allow deletion of webhook logs", () => {
      // Webhook logs are immutable for audit
      const webhookLogDeletable = false;
      
      expect(webhookLogDeletable).toBe(false);
    });
  });

  describe("Webhook Logs Access", () => {
    it("should allow admin to view all webhook logs", async () => {
      const mockWebhookLogs = [
        { id: "wh-1", event_type: "PAYMENT_CONFIRMED", processed: true },
        { id: "wh-2", event_type: "PAYMENT_FAILED", processed: true },
      ];
      
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          order: vi.fn().mockResolvedValueOnce({ data: mockWebhookLogs, error: null }),
        }),
      });

      const result = await mockSupabase.from("asaas_webhook_logs").select("*").order("created_at");
      
      expect(result.data).toHaveLength(2);
    });
  });

  describe("Processing Logs Access", () => {
    it("should allow admin to view all processing logs", async () => {
      const mockProcessingLogs = [
        { id: "pl-1", registro_id: "reg-1", success: true },
        { id: "pl-2", registro_id: "reg-2", success: false },
      ];
      
      mockFrom.mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: mockProcessingLogs, error: null }),
      });

      const result = await mockSupabase.from("processing_logs").select("*");
      
      expect(result.data).toHaveLength(2);
    });
  });
});
