import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getAnalytics,
    getApplications,
    getCandidates,
    getInterviews,
    getJobs,
    getNotifications,
} from "../services/api.js";

const stageOrder = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];

function Dashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [activities, setActivities] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            getJobs(),
            getApplications(),
            getCandidates(),
            getInterviews(),
            getNotifications(),
            getAnalytics(),
        ])
            .then(([jobData, appData, candidateData, interviewData, activityData, analyticsData]) => {
                if (cancelled) return;
                setJobs(Array.isArray(jobData) ? jobData : []);
                setApplications(Array.isArray(appData) ? appData : []);
                setCandidates(Array.isArray(candidateData) ? candidateData : []);
                setInterviews(Array.isArray(interviewData) ? interviewData : []);
                setActivities(Array.isArray(activityData) ? activityData : []);
                setAnalytics(analyticsData || null);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err?.status === 0
                            ? "Unable to connect to the server. Please make sure the backend is running."
                            : err?.message || "Unable to load the dashboard."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const activeJobs = jobs.filter((job) => job.status === "Active").length;
    const draftJobs = jobs.filter((job) => job.status === "Draft").length;
    const jobsClosingSoon = jobs.filter((job) => Number(job.id) <= 3 || job.status === "Draft").length;
    const stageCounts = useMemo(() => {
        const counts = Object.fromEntries(stageOrder.map((stage) => [stage, 0]));
        applications.forEach((item) => {
            if (item.stage && counts[item.stage] !== undefined) {
                counts[item.stage] += 1;
            }
        });
        return counts;
    }, [applications]);

    const cards = [
        { value: jobs.length, label: "Total Jobs", tone: "ink" },
        { value: activeJobs, label: "Active Jobs", tone: "green" },
        { value: draftJobs, label: "Draft Jobs", tone: "amber" },
        { value: applications.length, label: "Applications", tone: "ink" },
        { value: candidates.length, label: "Candidates", tone: "coral" },
        { value: interviews.length, label: "Interviews", tone: "green" },
        { value: jobsClosingSoon, label: "Jobs Closing Soon", tone: "amber" },
    ];

    const maxStage = Math.max(...stageOrder.map((stage) => stageCounts[stage] || 0), 1);
    const greeting = new Date().getHours() < 12 ? "Good morning" : "Good afternoon";
    const welcomeName = user?.name || "Recruiter";

    return (
        <section className="workspace-page">
            <div className="workspace-heading">
                <div>
                    <p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                    <h1>{greeting}, {welcomeName}.</h1>
                    <p className="subheading">Here is the real status of your recruitment pipeline today.</p>
                </div>
                <Link className="btn btn-primary" to="/jobs/new">+ Create Job</Link>
            </div>

            {error ? <p className="error-state">{error}</p> : null}

            <div className="metric-grid">
                {cards.map((card) => (
                    <article className={`metric-card ${card.tone}`} key={card.label}>
                        <span>{card.label}</span>
                        <strong>{card.value}</strong>
                        <small>Live workspace data</small>
                    </article>
                ))}
            </div>

            <div className="dashboard-grid">
                <article className="surface-card chart-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Pipeline</p>
                            <h2>Application funnel</h2>
                        </div>
                        <span className="small-label">Current records</span>
                    </div>
                    <div className="bars">
                        {stageOrder.map((stage) => (
                            <div className="bar-column" key={stage}>
                                <i style={{ height: `${Math.max((stageCounts[stage] / maxStage) * 100, stageCounts[stage] ? 10 : 2)}%` }} />
                                <span>{stage}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="surface-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Action needed</p>
                            <h2>Recent applications</h2>
                        </div>
                        <Link to="/applications" className="text-link">View all</Link>
                    </div>
                    <div className="activity-list">
                        {applications.length === 0 ? <p className="state-message">No applications yet.</p> : applications.slice(0, 5).map((item) => (
                            <div className="activity-row" key={item.id}>
                                <span className="avatar">{String(item.candidate || "?").charAt(0).toUpperCase()}</span>
                                <div>
                                    <b>{item.candidate || "Unknown candidate"}</b>
                                    <span>{item.job || "Unknown role"}</span>
                                </div>
                                <span className="status-pill">{item.stage || "Applied"}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>

            <div className="dashboard-grid">
                <article className="surface-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Schedule</p>
                            <h2>Upcoming interviews</h2>
                        </div>
                        <Link to="/interviews" className="text-link">Open calendar</Link>
                    </div>
                    <div className="activity-list">
                        {interviews.length === 0 ? <p className="state-message">No interviews scheduled.</p> : interviews.slice(0, 4).map((interview) => (
                            <div className="activity-row" key={interview.id}>
                                <span className="avatar">{String(interview.candidate || "?").charAt(0).toUpperCase()}</span>
                                <div>
                                    <b>{interview.candidate}</b>
                                    <span>{interview.job} · {interview.date} · {interview.time}</span>
                                </div>
                                <span className="status-pill">{interview.status}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="surface-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Recruitment pulse</p>
                            <h2>Recent activity</h2>
                        </div>
                        <Link to="/activity" className="text-link">View activity</Link>
                    </div>
                    <div className="activity-list">
                        {activities.length === 0 ? <p className="state-message">No recent activity.</p> : activities.slice(0, 4).map((activity) => (
                            <div className="activity-row" key={activity.id}>
                                <span className="avatar">•</span>
                                <div>
                                    <b>{activity.event || activity.title}</b>
                                    <span>{activity.subject || activity.message}</span>
                                </div>
                                <span className="small-label">{activity.time || "Today"}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </div>

            <article className="surface-card recent-jobs">
                <div className="card-heading">
                    <div>
                        <p className="eyebrow">Your catalogue</p>
                        <h2>Recent jobs</h2>
                    </div>
                    <Link to="/jobs" className="text-link">Manage jobs</Link>
                </div>
                {jobs.length === 0 ? <p className="state-message">No jobs available.</p> : (
                    <div className="job-preview-grid">
                        {jobs.slice(0, 3).map((job) => (
                            <Link className="job-preview" to={`/jobs/${job.id}`} key={job.id}>
                                <span className="job-company">{job.company}</span>
                                <h3>{job.title}</h3>
                                <span>{job.location} · {job.employment_type}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </article>

            <div className="dashboard-grid">
                <article className="surface-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Priority</p>
                            <h2>Jobs requiring attention</h2>
                        </div>
                    </div>
                    <div className="activity-list">
                        {jobs.filter((job) => job.status === "Draft" || job.status === "Archived").slice(0, 4).map((job) => (
                            <div className="activity-row" key={job.id}>
                                <span className="avatar">{job.status === "Draft" ? "D" : "A"}</span>
                                <div>
                                    <b>{job.title}</b>
                                    <span>{job.company} · {job.status}</span>
                                </div>
                                <span className="status-pill">{job.status}</span>
                            </div>
                        ))}
                        {jobs.filter((job) => job.status === "Draft" || job.status === "Archived").length === 0 ? <p className="state-message">No jobs require action.</p> : null}
                    </div>
                </article>

                <article className="surface-card">
                    <div className="card-heading">
                        <div>
                            <p className="eyebrow">Next steps</p>
                            <h2>Quick actions</h2>
                        </div>
                    </div>
                    <div className="quick-actions">
                        <Link className="btn btn-primary" to="/jobs/new">Create Job</Link>
                        <Link className="btn" to="/jobs">Search Jobs</Link>
                        <Link className="btn" to="/applications">Review Applications</Link>
                        <Link className="btn" to="/resume-analysis">Analyze Resume</Link>
                        <Link className="btn" to="/ai-matching">Match Candidate</Link>
                        <Link className="btn" to="/interviews">Schedule Interview</Link>
                    </div>
                </article>
            </div>

            {loading ? <p className="state-message">Loading dashboard metrics…</p> : null}
        </section>
    );
}

export default Dashboard;
