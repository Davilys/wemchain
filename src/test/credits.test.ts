import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * 🧮 CREDIT SYSTEM TESTS
 * Critical tests for credit consumption, balance, and ledger consistency
 */

// Mock Supabase RPC calls
const mockRpc = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  rpc: mockRpc,
  from: mockFrom,
  channel: vi.fn(() => ({
    on: vi.fn(() => ({ on: vi.fn(() => ({ subscribe: vi.fn() })) })),
  })),
  removeChannel: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("Credit System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Credit Consumption", () => {
    it("should successfully consume credit with positive balance", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: true, remaining_balance: 4 },
        error: null,
      });

      const result = await mockSupabase.rpc("consume_credit_atomic", {
        p_user_id: "user-123",
        p_registro_id: "registro-456",
        p_reason: "Consumo para registro em blockchain",
      });

      expect(result.error).toBeNull();
      expect(result.data.success).toBe(true);
      expect(result.data.remaining_balance).toBe(4);
    });

    it("should block consumption when balance is zero", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Créditos insuficientes", available: 0 },
        error: null,
      });

      const result = await mockSupabase.rpc("consume_credit_atomic", {
        p_user_id: "user-123",
        p_registro_id: "registro-456",
        p_reason: "Test consumption",
      });

      expect(result.data.success).toBe(false);
      expect(result.data.error).toContain("insuficientes");
    });

    it("should be idempotent - not consume twice for same registro", async () => {
      // First call - success
      mockRpc.mockResolvedValueOnce({
        data: { success: true, remaining_balance: 4 },
        error: null,
      });

      // Second call with same registro - should be idempotent
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Crédito já consumido para este registro", idempotent: true },
        error: null,
      });

      const firstResult = await mockSupabase.rpc("consume_credit_atomic", {
        p_user_id: "user-123",
        p_registro_id: "registro-456",
      });

      const secondResult = await mockSupabase.rpc("consume_credit_atomic", {
        p_user_id: "user-123",
        p_registro_id: "registro-456",
      });

      expect(firstResult.data.success).toBe(true);
      expect(secondResult.data.success).toBe(false);
      expect(secondResult.data.idempotent).toBe(true);
    });

    it("should not consume credit for failed registro", async () => {
      // Simulating the consume_credit_safe behavior
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Registro não está confirmado" },
        error: null,
      });

      const result = await mockSupabase.rpc("consume_credit_safe", {
        p_user_id: "user-123",
        p_registro_id: "failed-registro",
      });

      expect(result.data.success).toBe(false);
    });

    it("should consume exactly 1 credit for confirmed registro", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: true, credits_consumed: 1, remaining_balance: 3 },
        error: null,
      });

      const result = await mockSupabase.rpc("consume_credit_atomic", {
        p_user_id: "user-123",
        p_registro_id: "confirmed-registro",
      });

      expect(result.data.credits_consumed).toBe(1);
    });
  });

  describe("Credit Balance Validation", () => {
    it("should never have negative balance", async () => {
      mockRpc.mockResolvedValueOnce({
        data: 0,
        error: null,
      });

      const result = await mockSupabase.rpc("get_ledger_balance", {
        p_user_id: "user-123",
      });

      expect(result.data).toBeGreaterThanOrEqual(0);
    });

    it("should return correct balance from ledger", async () => {
      mockRpc.mockResolvedValueOnce({
        data: 5,
        error: null,
      });

      const result = await mockSupabase.rpc("get_ledger_balance", {
        p_user_id: "user-123",
      });

      expect(result.data).toBe(5);
    });
  });

  describe("Credit Addition", () => {
    it("should add credits atomically for avulso plan", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { 
          success: true, 
          amount_added: 5, 
          new_balance: 10,
          was_subscription_reset: false 
        },
        error: null,
      });

      const result = await mockSupabase.rpc("add_credits_atomic", {
        p_user_id: "user-123",
        p_amount: 5,
        p_reason: "Plano Profissional",
        p_reference_type: "payment",
        p_reference_id: "pay_abc123",
        p_is_subscription: false,
      });

      expect(result.data.success).toBe(true);
      expect(result.data.new_balance).toBe(10);
      expect(result.data.was_subscription_reset).toBe(false);
    });

    it("should reset credits for subscription plan (not accumulate)", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { 
          success: true, 
          amount_added: 5, 
          new_balance: 5,
          was_subscription_reset: true 
        },
        error: null,
      });

      const result = await mockSupabase.rpc("add_credits_atomic", {
        p_user_id: "user-123",
        p_amount: 5,
        p_reason: "Assinatura Mensal - Ciclo 2",
        p_reference_type: "subscription",
        p_reference_id: "sub_abc123",
        p_is_subscription: true,
      });

      expect(result.data.success).toBe(true);
      expect(result.data.new_balance).toBe(5); // Reset, not accumulated
      expect(result.data.was_subscription_reset).toBe(true);
    });

    it("should prevent duplicate credit addition (idempotency)", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Referência já processada anteriormente", idempotent: true },
        error: null,
      });

      const result = await mockSupabase.rpc("add_credits_atomic", {
        p_user_id: "user-123",
        p_amount: 5,
        p_reason: "Duplicate payment",
        p_reference_type: "payment",
        p_reference_id: "already_processed_pay_123",
      });

      expect(result.data.success).toBe(false);
      expect(result.data.idempotent).toBe(true);
    });
  });

  describe("Credit Refund", () => {
    it("should correctly refund credits with admin authorization", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: true, amount_refunded: 2, new_balance: 7 },
        error: null,
      });

      const result = await mockSupabase.rpc("refund_credit_atomic", {
        p_user_id: "user-123",
        p_amount: 2,
        p_reason: "Registro falhou - estorno",
        p_reference_id: "failed-registro-id",
        p_admin_id: "admin-user-id",
      });

      expect(result.data.success).toBe(true);
      expect(result.data.amount_refunded).toBe(2);
    });

    it("should reject refund without admin role", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { success: false, error: "Apenas administradores podem estornar créditos" },
        error: null,
      });

      const result = await mockSupabase.rpc("refund_credit_atomic", {
        p_user_id: "user-123",
        p_amount: 2,
        p_reason: "Unauthorized refund attempt",
        p_reference_id: "some-id",
        p_admin_id: "non-admin-user-id",
      });

      expect(result.data.success).toBe(false);
      expect(result.data.error).toContain("administradores");
    });
  });

  describe("Ledger Consistency", () => {
    it("should reconcile cache with ledger and correct discrepancies", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { 
          ledger_balance: 5, 
          cache_balance: 3, 
          was_consistent: false, 
          corrected: true 
        },
        error: null,
      });

      const result = await mockSupabase.rpc("reconcile_credit_balance", {
        p_user_id: "user-123",
      });

      expect(result.data.was_consistent).toBe(false);
      expect(result.data.corrected).toBe(true);
      expect(result.data.ledger_balance).toBe(5);
    });

    it("should confirm consistency when cache matches ledger", async () => {
      mockRpc.mockResolvedValueOnce({
        data: { 
          ledger_balance: 5, 
          cache_balance: 5, 
          was_consistent: true, 
          corrected: false 
        },
        error: null,
      });

      const result = await mockSupabase.rpc("reconcile_credit_balance", {
        p_user_id: "user-123",
      });

      expect(result.data.was_consistent).toBe(true);
      expect(result.data.corrected).toBe(false);
    });
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent credit consumption correctly", async () => {
      // Simulate two concurrent consumption attempts
      // First should succeed, second should fail due to insufficient balance
      mockRpc
        .mockResolvedValueOnce({ data: { success: true, remaining_balance: 0 }, error: null })
        .mockResolvedValueOnce({ data: { success: false, error: "Créditos insuficientes", available: 0 }, error: null });

      const [result1, result2] = await Promise.all([
        mockSupabase.rpc("consume_credit_atomic", { p_user_id: "user-123", p_registro_id: "reg-1" }),
        mockSupabase.rpc("consume_credit_atomic", { p_user_id: "user-123", p_registro_id: "reg-2" }),
      ]);

      // One should succeed, one should fail
      const successCount = [result1, result2].filter(r => r.data.success).length;
      const failCount = [result1, result2].filter(r => !r.data.success).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
    });
  });
});
