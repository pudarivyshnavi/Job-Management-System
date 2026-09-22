import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login, logout } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("jobboard_token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(token));
    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        getMe(token)
            .then((activeUser) => setUser(activeUser))
            .catch(() => {
                localStorage.removeItem("jobboard_token");
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token]);
    async function signIn(credentials) { const result = await login(credentials); localStorage.setItem("jobboard_token", result.token); setToken(result.token); setUser(result.user); return result.user; }
    async function signOut() { try { await logout(token); } finally { localStorage.removeItem("jobboard_token"); setToken(null); setUser(null); } }
    return <AuthContext.Provider value={{ token, user, loading, isAuthenticated: Boolean(token && user), signIn, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
