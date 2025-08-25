import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "@/types";
import { AuthAPI, clearTokens, loadTokensFromStorage } from "@/lib/api";
import { setTokens as setTokensApi } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

export interface AuthContextType {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  loading: boolean;
  login: (newTokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState({
    accessToken: null as string | null,
    refreshToken: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedTokens = loadTokensFromStorage();
    if (storedTokens?.accessToken) {
      setTokens(storedTokens);
      AuthAPI.profile()
        .then((userData) => {
          setUser(userData);
          // Redirect authenticated users away from auth pages to their intended destination
          if (pathname?.startsWith("/auth/")) {
            const intendedUrl = sessionStorage.getItem("intendedUrl");
            if (intendedUrl && intendedUrl !== "/") {
              sessionStorage.removeItem("intendedUrl");
              router.push(intendedUrl);
            } else {
              router.push("/");
            }
          }
        })
        .catch(() => {
          setUser(null);
          // Clear invalid tokens
          setTokens({ accessToken: null, refreshToken: null });
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  const login = (newTokens: { accessToken: string; refreshToken: string }) => {
    // Set tokens in storage and API
    setTokensApi(newTokens);
    setTokens(newTokens);
    // Fetch user profile
    AuthAPI.profile()
      .then((userData) => {
        setUser(userData);
        // Redirect to intended URL after login
        if (pathname?.startsWith("/auth/")) {
          const intendedUrl = sessionStorage.getItem("intendedUrl");
          if (intendedUrl && intendedUrl !== "/") {
            sessionStorage.removeItem("intendedUrl");
            router.push(intendedUrl);
          } else {
            router.push("/");
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
        setUser(null);
      });
  };

  const logout = () => {
    setTokens({ accessToken: null, refreshToken: null });
    setUser(null);
    clearTokens();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
