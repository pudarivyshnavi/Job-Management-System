import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login, logout } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("jobboard_token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem("jobboard_token")));

    useEffect(() => {
        let active = true;

        async function hydrateSession() {
            if (!token) {
                localStorage.removeItem("jobboard_user");
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const activeUser = await getMe(token);
                if (!active) return;
                setUser(activeUser);
                localStorage.setItem("jobboard_user", JSON.stringify(activeUser));
            } catch (error) {
                if (!active) return;
                localStorage.removeItem("jobboard_token");
                localStorage.removeItem("jobboard_user");
                setToken(null);
                setUser(null);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        hydrateSession();
        return () => {
            active = false;
        };
    }, [token]);

    async function signIn(credentials) {
        const result = await login(credentials);
        localStorage.setItem("jobboard_token", result.token);
        localStorage.setItem("jobboard_user", JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
        return result.user;
    }

    async function signOut() {
        const activeToken = token || localStorage.getItem("jobboard_token");
        try {
            if (activeToken) {
                await logout(activeToken);
            }
        } finally {
            localStorage.removeItem("jobboard_token");
            localStorage.removeItem("jobboard_user");
            setToken(null);
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                isAuthenticated: Boolean(token && user),
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
