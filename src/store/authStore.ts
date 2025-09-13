import {create} from "zustand";
import { LoginCodeRequest,LoginPasswordRequest, RegisterRequest, ResetPasswordRequest, User, VerificationRequest } from "../types";
import { authAPI } from "../api/auth";
import { handleError } from "./errorStore";

interface AuthState {
  user: User | null;
  isLoading: boolean;

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setToken(response.access_token);
      set({ user: response.user });
    } catch (error) {
      handleError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (credentials: RegisterRequest) => {
    try {
      const response = await authAPI.register(credentials);
      setToken(response.access_token);
      set({ user: response.user });
    } catch (error) {
      handleError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (credentials: ResetPasswordRequest) => {
    try {
      await authAPI.reset_password(credentials);
      return true;
    } catch (error) {
      handleError(error);
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
    try {
      await authAPI.sendVerification(email, type);
    } catch (error) {
      handleError(error);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyToken: async () => {
    try {
        const response = await authAPI.verifyToken();
        setToken(response.access_token);
        set({ user: response.user });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
