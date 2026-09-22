import { useMemo, useState } from "react";

const faq = [
    {
        category: "Getting started",
        items: [
            {
                question: "What is Jobboard?",
                answer:
                    "Jobboard is a recruiter workspace for reviewing public roles, managing hiring workflow, and evaluating candidate information with transparent decision support. It keeps the public job catalogue separate from the recruiter-only operations workspace.",
            },
            {
                question: "Who is this platform for?",
                answer:
                    "The platform is designed for recruiters and hiring teams who need to review openings, assess candidates, and maintain a simple hiring workflow. It is a fictional demo system and does not replace a production ATS.",
            },
            {
                question: "How do I create an account?",
                answer:
                    "Open the Recruiter login page and choose Sign up. Enter your name, work email, password, and company name. After account creation, sign in to access the recruiter workspace.",
            },
            {
                question: "How do I log in?",
                answer:
                    "Use the Recruiter login link in the public header. Enter the email and password you used during signup. If the session is valid, the dashboard opens automatically.",
            },
            {
                question: "How do I log out?",
                answer:
                    "Use the Log out button in the recruiter header. The token is cleared from local storage and the app redirects you away from protected pages.",
            },
        ],
    },
    {
        category: "Jobs",
        items: [
            {
                question: "How do I create a job?",
                answer:
                    "Open the recruiter workspace, go to Jobs, then choose + Create Job. Complete the required fields and save the role. You can then publish or keep it as a draft.",
            },
            {
                question: "How do I save a draft?",
                answer:
                    "When creating or editing a role, leave the job status as Draft. Draft roles remain stored in the system and are visible in the jobs dashboard under Draft filters.",
            },
            {
                question: "How do I publish a job?",
                answer:
                    "Use the job workflow controls to set the role to Active. Published jobs are available in the public catalogue and count toward active hiring work.",
            },
            {
                question: "How do I edit a job?",
                answer:
                    "Open the job detail or list view and use the Edit action. Update the required fields and save your changes. The backend preserves the original created date when you update the record.",
            },
            {
                question: "How do I duplicate a job?",
                answer:
                    "From the job list or job page, choose Duplicate. The system creates a new job record with a copy of the original details and sets the new record to Draft status.",
            },
            {
                question: "How do I close a job?",
                answer:
                    "Use the Close action from the job workflow. The record is marked as Closed and can later be reopened if the role becomes active again.",
            },
            {
                question: "How do I reopen a job?",
                answer:
                    "Open the closed role from the jobs workspace and use the Reopen action. This sets the workflow back to Open and restores the job to Active status.",
            },
            {
                question: "How do I archive or restore a job?",
                answer:
                    "Archive a role from the job workflow to keep it out of the active list. Restore returns it to Active status so it appears again in the live recruitment pipeline.",
            },
            {
                question: "How do I search and filter jobs?",
                answer:
                    "Use the Job Management search and filter controls for location, experience, employment type, and status. The list updates from the backend data set in real time.",
            },
        ],
    },
    {
        category: "AI assistant",
        items: [
            {
                question: "What does AI Assistant do?",
                answer:
                    "The AI Assistant helps draft job titles, descriptions, summaries, improvement suggestions, skill extraction, and a simple quality check. It supports recruiter drafting and is not the final hiring decision.",
            },
            {
                question: "How do I generate a job description?",
                answer:
                    "Open AI Assistant, choose Generate job description, write the role brief, and run the assistant. The backend calls the AI service and falls back to a deterministic local response if Ollama is unavailable.",
            },
            {
                question: "How do I generate job title suggestions?",
                answer:
                    "Choose Suggest job titles from the assistant action menu and provide a brief for the role. The assistant returns a small set of title options for recruiting review.",
            },
            {
                question: "How does skill extraction work?",
                answer:
                    "The AI service extracts likely skills from the text you provide and returns an explicit list of required and preferred skills in the local fallback response, which is intended for drafting support.",
            },
            {
                question: "What happens if Ollama is unavailable?",
                answer:
                    "The app stays usable. The backend attempts Ollama first, but if it is offline or misconfigured it returns a deterministic local fallback with a clear message explaining the service is unavailable.",
            },
            {
                question: "Is Ollama required?",
                answer:
                    "No. Ollama is optional. The local fallback keeps the job creation and AI drafting workflow working without a remote AI dependency.",
            },
        ],
    },
    {
        category: "Candidates",
        items: [
            {
                question: "How do I view candidates?",
                answer:
                    "Open the Candidates module from the recruiter sidebar. The list includes names, roles, locations, experience, and status based on the JSON-backed data set.",
            },
            {
                question: "How do I view candidate information?",
                answer:
                    "Select a candidate from the list or use the matching workflow to compare that candidate with an open role. This gives you a quick view of skills, experience, and candidate profile details.",
            },
            {
                question: "How are candidates related to jobs?",
                answer:
                    "Candidates appear in the application pipeline and can be matched against open jobs. Matching compares candidate skills and experience against the job requirements to support recruiter review.",
            },
        ],
    },
    {
        category: "Resume analysis",
        items: [
            {
                question: "What file types are supported?",
                answer:
                    "The backend accepts TXT, PDF, and DOCX files up to 5 MB. Unsupported extensions, empty files, or malformed content are rejected with a clear error message.",
            },
            {
                question: "What is the file size limit?",
                answer:
                    "Resume uploads are limited to 5 MB. Files larger than that are rejected before the extraction step begins.",
            },
            {
                question: "How do I upload a resume?",
                answer:
                    "Open Resume Analysis, choose a TXT, PDF, or DOCX file, and submit it. The backend validates the file and returns structured extraction details.",
            },
            {
                question: "What information is extracted?",
                answer:
                    "The system extracts candidate name, email, phone, skills, experience, education snippets, relevant keywords, a brief summary, and extraction notes based on the text found in the document.",
            },
            {
                question: "How are skills extracted?",
                answer:
                    "Skills are detected from a curated list of common role keywords such as Python, FastAPI, React, SQL, Docker, and similar technologies. Matching is based on exact text patterns and may require recruiter verification.",
            },
            {
                question: "How is experience extracted?",
                answer:
                    "Experience is detected from patterns such as 3 years, 2-4 years, or 5+ years. If the document does not mention experience clearly, the result is displayed as Not detected.",
            },
            {
                question: "How is education extracted?",
                answer:
                    "Education lines are detected when the resume mentions university, college, bachelor's, master's, or degree-related wording. If no education details are present, the field is shown as Not detected.",
            },
            {
                question: "What happens if the resume cannot be parsed?",
                answer:
                    "The backend validates the format and file content. If the file is empty, oversized, invalid, or a scanned PDF without extractable text, it returns a user-friendly error and a clear explanation.",
            },
            {
                question: "What happens if the file is invalid?",
                answer:
                    "The app rejects unsupported file types and malformed content with an error such as Resume format must be PDF, DOCX, or TXT. The user can correct the file and try again.",
            },
            {
                question: "What is Resume Analysis?",
                answer:
                    "Resume Analysis is the step where the app reads a candidate file, extracts structured information, and surfaces useful recruiter-facing signals such as skills, experience, and a short summary without making a hiring decision.",
            },
        ],
    },
    {
        category: "AI matching",
        items: [
            {
                question: "What does candidate matching do?",
                answer:
                    "Candidate matching compares a selected candidate against a chosen job, looks at matching and missing skills, and compares the candidate's experience to the role requirement. The result is a transparent score for recruiter decision support.",
            },
            {
                question: "How is the match score calculated?",
                answer:
                    "The score is calculated from required skills, preferred skills, and experience overlap. The backend explains the exact formula in the response: 60% required skills, 20% preferred skills, and 20% experience.",
            },
            {
                question: "What are matching skills?",
                answer:
                    "Matching skills are the job requirements that the candidate already has in their profile or resume. These appear in the matching skills list in the result panel.",
            },
            {
                question: "What are missing skills?",
                answer:
                    "Missing skills are the requirements the candidate does not yet meet. They are shown clearly so recruiters can decide whether the gap is acceptable or whether another candidate is more suitable.",
            },
            {
                question: "How is experience compared?",
                answer:
                    "The system compares candidate experience against the required experience in the job. It checks whether the candidate meets or falls short of the stated requirement without making a final hiring decision.",
            },
            {
                question: "What does required vs preferred skill mean?",
                answer:
                    "Required skills are the needs the job must have. Preferred skills are useful extras that add context but are not necessarily a blocker if missing. The score weights required skills more heavily.",
            },
            {
                question: "Is this an automatic hiring decision?",
                answer:
                    "No. The platform clearly labels match results as decision support only. Recruiters remain responsible for reviewing the candidate and making the final call.",
            },
            {
                question: "How do I match a candidate to a job?",
                answer:
                    "Open AI Matching, choose a job and a candidate, then run the comparison. Review the score, matching skills, missing skills, and experience comparison before deciding whether to advance the candidate.",
            },
        ],
    },
    {
        category: "Applications and interviews",
        items: [
            {
                question: "How do I review applications?",
                answer:
                    "Open Applications and review the candidate pipeline. Each record includes the candidate, job, applied date, and current stage so the hiring team can decide the next action.",
            },
            {
                question: "How do I change application status?",
                answer:
                    "Use the status controls in the application workflow to move a candidate from Applied to Under Review, Shortlisted, Interview, or Selected. The application history is updated as the status changes.",
            },
            {
                question: "What does each status mean?",
                answer:
                    "The statuses are Applied, Under Review, Shortlisted, Interview, Selected, and Rejected. They reflect the candidate's place in the hiring process and are meant to help the team coordinate next steps.",
            },
            {
                question: "How does application history work?",
                answer:
                    "Each application tracks the status timeline so recruiters can see how the candidate moved through the journey. This history helps explain decisions and keeps the workflow auditable.",
            },
            {
                question: "How do I schedule an interview?",
                answer:
                    "Open Interviews, add the candidate, job, date, time, type, and schedule status. The system stores the interview and shows it in the upcoming schedule.",
            },
            {
                question: "How do I update interview status?",
                answer:
                    "Interview records include status values such as Scheduled, Completed, or Cancelled, and can be reviewed from the interviews list. Recruiters can keep the schedule current and transparent.",
            },
            {
                question: "How is interview feedback handled?",
                answer:
                    "Interview records include a feedback field if needed. The system stores the record and keeps the status and notes visible in the recruiter workspace.",
            },
        ],
    },
    {
        category: "Analytics and notifications",
        items: [
            {
                question: "What does the dashboard show?",
                answer:
                    "The dashboard summarizes job counts, active work, draft roles, candidates, applications, interviews, and a stage-based funnel. It is designed to answer what is happening in the recruitment workspace today.",
            },
            {
                question: "How are analytics calculated?",
                answer:
                    "The metrics are computed from the live JSON-backed records in the backend. They reflect the current count of jobs, candidate records, applications, and interviews rather than static demo numbers.",
            },
            {
                question: "What do the recruitment funnel numbers mean?",
                answer:
                    "The funnel shows how applications are distributed across the pipeline from Applied through Selected. It helps highlight where candidates are stalling or moving forward.",
            },
            {
                question: "What notifications are shown?",
                answer:
                    "Notifications show meaningful recruiter moments such as interview scheduling, application updates, and job publication events.",
            },
            {
                question: "How do I manage notifications?",
                answer:
                    "The notifications module shows the current feed. The app is designed as a simple operational inbox and does not implement production-level message management beyond the existing data set.",
            },
        ],
    },
    {
        category: "Users and roles",
        items: [
            {
                question: "What is the purpose of Users & Roles?",
                answer:
                    "The user and role area organizes recruiter access and the authentication model for the demo application. It supports the sign-in workflow and the protected recruiter workspace.",
            },
            {
                question: "What does the current demo authentication support?",
                answer:
                    "The demo supports signup, login, session-based authentication, and logout. It checks the user token on protected endpoints and blocks access when no valid session is available.",
            },
            {
                question: "What are the production limitations?",
                answer:
                    "This is a local demo system backed by JSON files. It is suitable for exploring the recruitment workflow, but it does not replace a full production identity, SSO, RBAC, or data-store solution.",
            },
        ],
    },
    {
        category: "Settings",
        items: [
            {
                question: "What settings are available?",
                answer:
                    "The workspace includes the current configuration and operational settings used by the demo environment. The main environment variables for AI are OLLAMA_URL, OLLAMA_MODEL, and OLLAMA_TIMEOUT_SECONDS.",
            },
            {
                question: "What environment configuration is required?",
                answer:
                    "To enable Ollama-powered generation, set OLLAMA_URL and OLLAMA_MODEL on the backend. If those are not configured or the service is unavailable, the app falls back to the built-in deterministic assistant.",
            },
        ],
    },
];

const finder = (item, query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return (
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized)
    );
};

function HelpPage() {
    const [query, setQuery] = useState("");

    const visibleFaq = useMemo(
        () =>
            faq
                .map((category) => ({
                    ...category,
                    items: category.items.filter((item) => finder(item, query)),
                }))
                .filter((category) => category.items.length > 0),
        [query]
    );

    return (
        <section className="workspace-page help-page">
            <div className="workspace-heading">
                <div>
                    <p className="eyebrow">Knowledge base</p>
                    <h1>Help center</h1>
                    <p className="subheading">
                        Search the steps, workflows, and AI features used in this recruitment platform.
                    </p>
                </div>
            </div>

            <div className="surface-card help-search">
                <label htmlFor="help-search">Search help</label>
                <input
                    id="help-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try: How do I match a candidate to a job?"
                />
            </div>

            {visibleFaq.length === 0 ? (
                <div className="surface-card help-empty">
                    <h2>No matching help found.</h2>
                    <p>Try a broader request such as resume analysis, AI matching, or creating a job.</p>
                </div>
            ) : null}

            {visibleFaq.map((category) => (
                <div className="help-category" key={category.category}>
                    <h2>{category.category}</h2>
                    <div className="help-list">
                        {category.items.map((item) => (
                            <article className="surface-card help-item" key={item.question}>
                                <h3>{item.question}</h3>
                                <p>{item.answer}</p>
                            </article>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default HelpPage;
