import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(location.state?.message || "");
    const [busy, setBusy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function change(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    async function submit(event) {
        event.preventDefault();
        setError("");

        if (!form.email.trim() || !form.password.trim()) {
            setError("Enter your email and password.");
            return;
        }

        setBusy(true);
        try {
            await signIn({
                email: form.email.trim(),
                password: form.password,
            });
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err?.status === 401
                    ? "Invalid email or password. Please try again."
                    : err?.message || "Unable to sign in right now."
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <Link className="auth-brand" to="/">
                    jobboard<span>.</span>
                </Link>
                <p className="eyebrow">Demo recruiter workspace</p>
                <h1>Welcome back.</h1>
                <p className="auth-subtitle">Sign in to manage roles, candidates, and hiring decisions.</p>

                <form onSubmit={submit} className="auth-form" noValidate>
                    <label>
                        Email
                        <input
                            autoComplete="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={change}
                            placeholder="name@company.com"
                        />
                    </label>

                    <label>
                        Password
                        <div className="password-wrap">
                            <input
                                autoComplete="current-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={change}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((current) => !current)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </label>

                    {error ? <p className="error-state">{error}</p> : null}

                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="auth-footer">
                    New to jobboard? <Link to="/signup">Create an account</Link>
                </p>
                <Link className="text-link" to="/jobs">
                    ← Browse public roles
                </Link>
            </div>
        </main>
    );
}

export default Login;
