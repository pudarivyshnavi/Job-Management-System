import { Link } from "react-router-dom";
import JobWizard from "../components/JobWizard.jsx";

function CreateJobPage() {
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">New opening</p>
          <h1>Create Job</h1>
        </div>
        <Link className="btn btn-secondary" to="/jobs">
          Back to Jobs
        </Link>
      </div>

      <JobWizard />
    </section>
  );
}

export default CreateJobPage;
