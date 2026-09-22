import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Toast from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { archiveJob, getJobs } from "../services/api.js";
import { formatDate } from "../services/constants.js";

function JobTable({ jobs, onArchived }) {
  const [archivingId, setArchivingId] = useState(null);
  const [pendingArchive, setPendingArchive] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Auto-hide the toast after a few seconds.
  useEffect(() => {
    if (!toast.message) {
      return undefined;
    }
    const timer = setTimeout(() => setToast({ message: "", type: "success" }), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function requestArchive(job) {
    setPendingArchive(job);
  }

  async function confirmArchive() {
    const job = pendingArchive;
    if (!job) {
      return;
    }
    setArchivingId(job.id);
    try {
      const archived = await archiveJob(job.id);
      setToast({ message: "Job archived successfully.", type: "success" });
      onArchived(archived);
    } catch (err) {
      setToast({
        message:
          err.status === 404
            ? "This job no longer exists."
            : "Unable to archive this job. Please try again.",
        type: "error",
      });
    } finally {
      setArchivingId(null);
      setPendingArchive(null);
    }
  }

  return (
    <>
      <div className="job-table-wrap">
        <table className="job-table">
          <thead>
            <tr>
              <th scope="col">Job</th>
              <th scope="col">Company</th>
              <th scope="col">Location</th>
              <th scope="col">Experience</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td data-label="Job" className="job-title-cell">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </td>
                <td data-label="Company">{job.company}</td>
                <td data-label="Location">{job.location}</td>
                <td data-label="Experience">{job.experience}</td>
                <td data-label="Type">{job.employment_type}</td>
                <td data-label="Status">
                  <StatusBadge status={job.status} />
                </td>
                <td data-label="Created">{formatDate(job.created_date)}</td>
                <td data-label="Actions">
                  <div className="row-actions">
                    <Link className="btn btn-small" to={`/jobs/${job.id}`}>
                      View
                    </Link>
                    <Link className="btn btn-small" to={`/jobs/${job.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => requestArchive(job)}
                    >
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingArchive)}
        busy={Boolean(archivingId)}
        title="Archive job"
        message={
          pendingArchive
            ? `Are you sure you want to archive "${pendingArchive.title}"? It will stay in the system with status Archived.`
            : ""
        }
        confirmLabel="Archive job"
        onConfirm={confirmArchive}
        onCancel={() => setPendingArchive(null)}
      />
      <Toast message={toast.message} type={toast.type} />
    </>
  );
}

export default JobTable;
