import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import JobForm from "../components/JobForm.jsx";
import Toast from "../components/Toast.jsx";
import { getJob, updateJob } from "../services/api.js";

function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

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

  async function handleSubmit(payload) {
    setBusy(true);
    setError("");
    try {
      await updateJob(id, payload);
      navigate(`/jobs/${id}`, {
        state: { notice: "Job updated successfully." },
      });
    } catch (err) {
      setError(
        err.status === 404
          ? "This job no longer exists."
          : err.message || "Unable to update this job. Please try again."
      );
      setBusy(false);
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
          <p>The job you are trying to edit does not exist or may have been removed.</p>
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
          <p className="eyebrow">Update opening</p>
          <h1>Edit Job</h1>
        </div>
        <Link className="btn btn-secondary" to={`/jobs/${id}`}>
          Back to details
        </Link>
      </div>

      <Toast message={error} type="error" />

      <JobForm
        initialJob={job}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        busy={busy}
      />
    </section>
  );
}

export default EditJobPage;
