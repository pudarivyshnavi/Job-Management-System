import { useState } from "react";
import { analyseResume } from "../services/api.js";

function ResumeAnalysis() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event) {
        event.preventDefault();
        if (!file) return;
        setLoading(true);
        setError("");
        setResult(null);
        try {
            setResult(await analyseResume(file));
        } catch (err) {
            setError(err.message || "Resume analysis failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="workspace-page">
            <div className="workspace-heading">
                <div>
                    <p className="eyebrow">Candidate intelligence</p>
                    <h1>Resume analysis</h1>
                    <p className="subheading">Extract structured signals from TXT, PDF, or DOCX resumes.</p>
                </div>
                <span className="demo-chip">Maximum 5 MB</span>
            </div>

            <form className="surface-card resume-form" onSubmit={submit}>
                <label htmlFor="resume">Resume file</label>
                <input
                    id="resume"
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
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
