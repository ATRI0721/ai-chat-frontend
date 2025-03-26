import {create} from "zustand";
import { LoginCodeRequest,LoginPasswordRequest, RegisterRequest, ResetPasswordRequest, User, VerificationRequest } from "../types";
import { authAPI } from "../api/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCodeRequest | LoginPasswordRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  resetPassword: (credentials: ResetPasswordRequest) => Promise<boolean>;
  logout: () => void;
  sendVerification: (r: VerificationRequest) => Promise<void>;
  verifyToken: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

function setToken(token: string) {
  localStorage.setItem("token", token);
}

function removeToken() {
  localStorage.removeItem("token");
}

function getError(error: unknown): string {
  const t = ["detail", "message", "error", "data", "description"] as const;
  const hasKey = (obj: object, key: string): obj is { [k in string]: unknown } => key in obj;
  if (typeof error === "string") {
    return error;
  }else if (error instanceof Error) {
    return error.message;
  } else if (error instanceof Object) {
    for (const key of t) {
      if (hasKey(error, key)) {
        return getError(error[key]);
      }
    }
  }
  return "Unknown error";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      setToken(response.access_token);
      set({ user: response.user });
    } catch (error) {
      set({ error: getError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (credentials: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(credentials);
      setToken(response.access_token);
      set({ user: response.user });
    } catch (error) {
      set({ error: getError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (credentials: ResetPasswordRequest) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.reset_password(credentials);
      return true;
    } catch (error) {
      set({ error: getError(error) });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    removeToken();
    set({ user: null });
  },

  deleteAccount: async () => {
    authAPI.delete_account().then(() => {
      get().logout()
    }).catch(err => console.error(err));
  },

  sendVerification: async ({ email, type }) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.sendVerification(email, type);
    } catch (error) {
      set({ error: getError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  verifyToken: async () => {
    set({ isLoading: true, error: null });
    try {
        const response = await authAPI.verifyToken();
        setToken(response.access_token);
        set({ user: response.user });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
