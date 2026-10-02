import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api.js";

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        company: "",
    });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    function change(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    async function submit(event) {
        event.preventDefault();
        setError("");

        if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm_password) {
            setError("Please complete all required fields.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (form.password !== form.confirm_password) {
            setError("Passwords do not match. Please re-enter them.");
            return;
        }

        setBusy(true);
        try {
            await signup({
                name: form.name.trim(),
                email: form.email.trim(),
                company: form.company.trim(),
                password: form.password,
                confirm_password: form.confirm_password,
            });
            navigate("/login", {
                state: { message: "Account created. Sign in to open your recruiter workspace." },
            });
        } catch (err) {
            setError(
                err?.status === 409
                    ? "An account with that email already exists."
                    : err?.message || "Unable to create the account right now."
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
                <p className="eyebrow">Create demo account</p>
                <h1>Make hiring clearer.</h1>
                <p className="auth-subtitle">
                    Create a local recruiter account. No external service or payment is required.
                </p>

                <form onSubmit={submit} className="auth-form" noValidate>
                    <label>
                        Full name
                        <input name="name" value={form.name} onChange={change} placeholder="Your full name" />
                    </label>

                    <label>
                        Email
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={change}
                            placeholder="name@company.com"
                        />
                    </label>

                    <label>
                        Company or team <span className="field-hint">optional</span>
                        <input name="company" value={form.company} onChange={change} placeholder="Hiring team" />
                    </label>

                    <label>
                        Password
                        <div className="password-wrap">
                            <input
                                name="password"
                                minLength="8"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={change}
                                placeholder="At least 8 characters"
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

                    <label>
                        Confirm password
                        <div className="password-wrap">
                            <input
                                name="confirm_password"
                                minLength="8"
                                type={showConfirmPassword ? "text" : "password"}
                                value={form.confirm_password}
                                onChange={change}
                                placeholder="Repeat your password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword((current) => !current)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </label>

                    {error ? <p className="error-state">{error}</p> : null}

                    <button className="btn btn-primary" disabled={busy}>
                        {busy ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </main>
    );
}

export default Signup;
