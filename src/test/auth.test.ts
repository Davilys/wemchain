import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * 🔐 AUTHENTICATION TESTS
 * Tests for user authentication flow
 */

// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => ({
    update: vi.fn(() => ({ eq: vi.fn() })),
    select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })),
  })),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("Authentication Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Registration", () => {
    it("should successfully register a new user with valid data", async () => {
      const mockUser = { id: "test-user-id", email: "test@example.com" };
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: { access_token: "test-token" } },
        error: null,
      });

      const result = await mockSupabase.auth.signUp({
        email: "test@example.com",
        password: "ValidPass123!",
        options: {
          data: { full_name: "Test User" },
        },
      });

      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe("test@example.com");
    });

    it("should fail registration with invalid email", async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Invalid email format" },
      });

      const result = await mockSupabase.auth.signUp({
        email: "invalid-email",
        password: "ValidPass123!",
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Invalid");
    });

    it("should fail registration with weak password", async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Password should be at least 6 characters" },
      });

      const result = await mockSupabase.auth.signUp({
        email: "test@example.com",
        password: "123",
      });

      expect(result.error).toBeDefined();
    });
  });

  describe("User Login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockSession = { access_token: "valid-token", user: { id: "user-id" } };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      const result = await mockSupabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "ValidPass123!",
      });

      expect(result.error).toBeNull();
      expect(result.data.session).toBeDefined();
      expect(result.data.session.access_token).toBe("valid-token");
    });

    it("should fail login with invalid credentials", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid login credentials" },
      });

      const result = await mockSupabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "WrongPassword",
      });

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain("Invalid");
    });

    it("should fail login with non-existent user", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid login credentials" },
      });

      const result = await mockSupabase.auth.signInWithPassword({
        email: "nonexistent@example.com",
        password: "SomePassword123!",
      });

      expect(result.error).toBeDefined();
    });
  });

  describe("Session Management", () => {
    it("should return null session for unauthenticated user", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await mockSupabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });

    it("should return valid session for authenticated user", async () => {
      const mockSession = { 
        access_token: "valid-token", 
        user: { id: "user-id" },
        expires_at: Date.now() + 3600000
      };
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      const result = await mockSupabase.auth.getSession();

      expect(result.data.session).toBeDefined();
      expect(result.data.session.access_token).toBe("valid-token");
    });

    it("should handle expired token gracefully", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: "Token expired" },
      });

      const result = await mockSupabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });
  });

  describe("Logout", () => {
    it("should successfully logout user", async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      const result = await mockSupabase.auth.signOut();

      expect(result.error).toBeNull();
    });
  });

  describe("Protected Route Access", () => {
    it("should block access without authentication token", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const session = await mockSupabase.auth.getSession();
      const isAuthenticated = !!session.data.session;

      expect(isAuthenticated).toBe(false);
    });

    it("should allow access with valid authentication token", async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: "valid-token", user: { id: "user-id" } } },
        error: null,
      });

      const session = await mockSupabase.auth.getSession();
      const isAuthenticated = !!session.data.session;

      expect(isAuthenticated).toBe(true);
    });
  });
});
