import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Toast from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { archiveJob, getJob } from "../services/api.js";
import { formatDate } from "../services/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

function JobDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setNotFound(false);
    getJob(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setJob(null);
          if (err.status === 404) {
            setNotFound(true);
          } else {
            setError(
              err.status === 0
                ? "Unable to connect to the server. Please make sure the backend is running."
                : err.message || "Unable to load this job. Please try again."
            );
          }
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
  }, [id]);

  async function handleArchive() {
    setArchiving(true);
    try {
      const archived = await archiveJob(id);
      setJob(archived);
      setNotice("Job archived successfully.");
      setConfirmOpen(false);
    } catch (err) {
      setNotice("");
      setError(
        err.status === 404
          ? "This job no longer exists."
          : "Unable to archive this job. Please try again."
      );
      setConfirmOpen(false);
    } finally {
      setArchiving(false);
    }
  }

  if (loading) {
    return <p className="state-message">Loading job...</p>;
  }

  if (notFound) {
    return (
      <section className="state-page">
        <div className="empty-state">
          <h1>Job Not Found</h1>
          <p>The job you are looking for does not exist or may have been removed.</p>
          <Link className="btn btn-primary" to="/jobs">
            Back to Jobs
          </Link>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="state-page">
        <div className="empty-state">
          <h1>Something went wrong</h1>
          <p>{error || "Unable to load this job."}</p>
          <Link className="btn btn-primary" to="/jobs">
            Back to Jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{job.company}</p>
          <h1>{job.title}</h1>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="detail-actions">
        <Link className="btn btn-secondary" to="/jobs">
          Back to Jobs
        </Link>
        {isAuthenticated ? <><Link className="btn btn-primary" to={`/jobs/${job.id}/edit`}>
          Edit Job
        </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Archive Job
          </button></> : <Link className="btn btn-primary" to="/login">Recruiter sign in</Link>}
      </div>

      <article className="detail-card">
        <dl className="detail-grid">
          <div>
            <dt>Company</dt>
            <dd>{job.company}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{job.location}</dd>
          </div>
          <div>
            <dt>Experience</dt>
            <dd>{job.experience}</dd>
          </div>
          <div>
            <dt>Employment type</dt>
            <dd>{job.employment_type}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge status={job.status} />
            </dd>
          </div>
          <div>
            <dt>Created date</dt>
            <dd>{formatDate(job.created_date)}</dd>
          </div>
        </dl>

        <div className="detail-block">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        <div className="detail-block">
          <h2>Required Skills</h2>
          <ul className="skill-list">
            {job.required_skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      </article>

      <ConfirmDialog
        open={confirmOpen}
        busy={archiving}
        title="Archive job"
        message={`Are you sure you want to archive "${job.title}"? It will stay in the system with status Archived.`}
        confirmLabel="Archive job"
        onConfirm={handleArchive}
        onCancel={() => setConfirmOpen(false)}
      />
      <Toast message={notice} type="success" />
      {notice ? null : <Toast message={error} type="error" />}
    </section>
  );
}

export default JobDetailsPage;
