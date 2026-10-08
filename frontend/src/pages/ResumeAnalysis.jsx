import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { analyseResume, getJobs } from "../services/api.js";

const DEFAULT_ROLE_OPTIONS = [
    { id: "frontend-engineer", title: "Frontend Engineer", required_skills: ["React", "JavaScript", "CSS", "HTML"], preferred_skills: ["TypeScript", "Testing"] },
    { id: "data-analyst", title: "Data Analyst", required_skills: ["SQL", "Excel", "Python"], preferred_skills: ["Power BI", "Data Analysis"] },
    { id: "python-developer", title: "Python Developer", required_skills: ["Python", "FastAPI", "SQL"], preferred_skills: ["Docker", "AWS"] },
    { id: "product-designer", title: "Product Designer", required_skills: ["Figma", "Design systems", "Research"], preferred_skills: ["UX writing", "Prototyping"] },
];

function ResumeAnalysis() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [file, setFile] = useState(null);
    const [jobOptions, setJobOptions] = useState(DEFAULT_ROLE_OPTIONS);
    const [selectedJobId, setSelectedJobId] = useState(DEFAULT_ROLE_OPTIONS[0].id);
    const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE_OPTIONS[0].title);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadRoleOptions() {
            try {
                const jobs = await getJobs();
                if (!active) return;
                const mergedJobs = [...jobs, ...DEFAULT_ROLE_OPTIONS].filter((item, index, list) => {
                    const key = item.title || item.label;
                    return list.findIndex((other) => (other.title || other.label) === key) === index;
                });
                setJobOptions(mergedJobs);
                if (!selectedJobId && mergedJobs[0]) {
                    const nextJob = mergedJobs[0];
                    const nextValue = typeof nextJob.id === "number" || /^\d+$/.test(String(nextJob.id || "")) ? String(nextJob.id) : "";
                    setSelectedJobId(nextValue);
                    setSelectedRole(nextJob.title || nextJob.label || "Selected role");
                }
            } catch {
                if (!active) return;
                setJobOptions(DEFAULT_ROLE_OPTIONS);
                const firstRole = DEFAULT_ROLE_OPTIONS[0];
                setSelectedRole(firstRole.title);
                setSelectedJobId("");
            }
        }

        loadRoleOptions();
        return () => {
            active = false;
        };
    }, []);

    async function submit(event) {
        event.preventDefault();
        if (!file) return;
        const jobId = /^\d+$/.test(String(selectedJobId || "")) ? String(selectedJobId) : "";
        setLoading(true);
        setError("");
        setResult(null);
        try {
            setResult(await analyseResume(file, { jobId, role: selectedRole }));
        } catch (err) {
            setError(err.message || "Resume analysis failed.");
        } finally {
            setLoading(false);
        }
    }

    if (authLoading) {
        return <section className="workspace-page"><p className="state-message">Checking your session...</p></section>;
    }

    if (!isAuthenticated) {
        return <section className="workspace-page"><p className="error-state">Please sign in to access the recruiter workspace.</p></section>;
    }

    return (
        <section className="workspace-page">
            <div className="workspace-heading">
                <div>
                    <p className="eyebrow">Candidate intelligence</p>
                    <h1>Resume analysis</h1>
                    <p className="subheading">Extract structured signals from TXT, PDF, or DOCX resumes and compare them with a target role.</p>
                </div>
                <span className="demo-chip">Maximum 5 MB</span>
            </div>

            <form className="surface-card resume-form" onSubmit={submit}>
                <div className="field-grid two-up">
                    <div className="field">
                        <label htmlFor="role-select">Target role</label>
                        <select
                            id="role-select"
                            value={selectedJobId || selectedRole}
                            onChange={(event) => {
                                const nextJob = jobOptions.find((job) => String(job.id ?? job.title) === event.target.value) || null;
                                const isNumericId = nextJob && (typeof nextJob.id === "number" || /^\d+$/.test(String(nextJob.id || "")));
                                setSelectedJobId(isNumericId ? String(nextJob.id) : "");
                                setSelectedRole(nextJob?.title || nextJob?.label || event.target.value);
                            }}
                        >
                            {jobOptions.map((job) => {
                                const optionValue = typeof job.id === "number" || /^\d+$/.test(String(job.id || "")) ? String(job.id) : job.title;
                                return (
                                    <option key={String(job.id ?? job.title)} value={optionValue}>
                                        {job.title || job.label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="resume">Resume file</label>
                        <input
                            id="resume"
                            type="file"
                            accept=".txt,.pdf,.docx"
                            onChange={(event) => setFile(event.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                <p className="field-hint">
                    Only upload fictional or consented data. The extracted result is for recruiter review.
                </p>
                <button className="btn btn-primary" disabled={!file || loading}>
                    {loading ? "Analysing..." : "Analyse resume"}
                </button>
            </form>

            {error && <p className="error-state">{error}</p>}

            {result && (
                <article className="surface-card resume-result">
                    <p className="eyebrow">{result.filename}</p>
                    <h2>Resume analysis</h2>

                    {result.role_match && (
                        <div className="match-summary">
                            <p className="eyebrow">Target role</p>
                            <div className="match-score-wrap">
                                <div className="match-score"><strong>{result.role_match.score}%</strong><span>match</span></div>
                                <div>
                                    <h3>{result.role_match.selected_role || result.selected_role || selectedRole}</h3>
                                    <p>{result.role_match.calculation}</p>
                                </div>
                            </div>
                            <div className="skill-list">
                                {(result.role_match.matching_skills?.length ? result.role_match.matching_skills : ["No required skills detected"]).map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </div>
                            {result.role_match.missing_skills?.length > 0 && (
                                <p className="field-hint">Missing skills: {result.role_match.missing_skills.join(", ")}</p>
                            )}
                        </div>
                    )}

                    <div className="resume-grid">
                        <div>
                            <h3>Candidate information</h3>
                            <p><strong>Name:</strong> {result.candidate?.name || "Not detected"}</p>
                            <p><strong>Email:</strong> {result.candidate?.email || "Not detected"}</p>
                            <p><strong>Phone:</strong> {result.candidate?.phone || "Not detected"}</p>
                        </div>

                        <div>
                            <h3>Skills</h3>
                            <div className="skill-list">
                                {(Array.isArray(result.skills) && result.skills.length ? result.skills : ["Not detected"]).map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3>Experience</h3>
                            <p>{result.experience?.summary || "Not detected"}</p>
                            <ul>
                                {(Array.isArray(result.experience?.evidence) && result.experience.evidence.length ? result.experience.evidence : ["Not detected"]).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3>Education</h3>
                            <ul>
                                {(Array.isArray(result.education) && result.education.length ? result.education : ["Not detected"]).map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="wide-block">
                            <h3>Keywords</h3>
                            <div className="skill-list">
                                {(Array.isArray(result.keywords) && result.keywords.length ? result.keywords : ["Not detected"]).map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </div>
                        </div>

                        <div className="wide-block">
                            <h3>Summary</h3>
                            <p>{result.summary || "Not detected"}</p>
                        </div>

                        <div className="wide-block">
                            <h3>Extraction confidence / notes</h3>
                            <p>{result.notes || "Not available"}</p>
                            <p><strong>Confidence:</strong> {result.confidence || "Low"}</p>
                        </div>
                    </div>

                    <details>
                        <summary>Text preview</summary>
                        <p>{result.text_preview || "Preview unavailable."}</p>
                    </details>
                </article>
            )}
        </section>
    );
}

export default ResumeAnalysis;
