import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import JobTable from "../components/JobTable.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import { getJobs } from "../services/api.js";

const EMPTY_FILTERS = {
  search: "",
  location: "",
  experience: "",
  employment_type: "",
  status: "",
};

function JobsListPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, draft: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Bumped after archive/create so dependent effects refetch from the backend.
  const [version, setVersion] = useState(0);

  // Search input is debounced into the actual `filters.search` value.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) =>
        current.search === searchInput ? current : { ...current, search: searchInput }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getJobs(filters)
      .then((data) => {
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setJobs([]);
          setError(
            err.status === 0
              ? "Unable to connect to the server. Please make sure the backend is running."
              : err.message || "Unable to load jobs. Please try again."
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
  }, [filters, version]);

  // Summary cards are based on backend data, not on the current filtered view.
  useEffect(() => {
    let cancelled = false;
    getJobs()
      .then((allJobs) => {
        if (cancelled || !Array.isArray(allJobs)) {
          return;
        }
        setCounts({
          total: allJobs.length,
          active: allJobs.filter((job) => job.status === "Active").length,
          draft: allJobs.filter((job) => job.status === "Draft").length,
          archived: allJobs.filter((job) => job.status === "Archived").length,
        });
      })
      .catch(() => {
        /* The main list fetch reports the user-facing error. */
      });
  }, [version]);

  const filtersActive = useMemo(
    () => Object.values(filters).some((value) => String(value).trim() !== ""),
    [filters]
  );

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function resetFilters() {
    setSearchInput("");
    setFilters(EMPTY_FILTERS);
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Recruiter workspace</p>
          <h1>Job Management</h1>
        </div>
        <Link className="btn btn-primary btn-create" to="/jobs/new">
          + Create Job
        </Link>
      </div>

      <Banner type="error">{error}</Banner>

      <div className="summary-grid">
        <article className="summary-card">
          <p className="summary-value">{counts.total}</p>
          <p className="summary-label">Total Jobs</p>
        </article>
        <article className="summary-card">
          <p className="summary-value">{counts.active}</p>
          <p className="summary-label">Active Jobs</p>
        </article>
        <article className="summary-card">
          <p className="summary-value">{counts.draft}</p>
          <p className="summary-label">Draft Jobs</p>
        </article>
        <article className="summary-card">
          <p className="summary-value">{counts.archived}</p>
          <p className="summary-label">Archived Jobs</p>
        </article>
      </div>

      <SearchFilters
        search={searchInput}
        location={filters.location}
        experience={filters.experience}
        employmentType={filters.employment_type}
        status={filters.status}
        onSearchChange={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {loading ? <p className="state-message">Loading jobs...</p> : null}

      {!loading && !error && jobs.length === 0 ? (
        filtersActive ? (
          <EmptyState
            title="No jobs found matching your criteria."
            message="Try changing the search text or picking different filters."
          >
            <button type="button" className="btn btn-primary" onClick={resetFilters}>
              Clear Filters
            </button>
          </EmptyState>
        ) : (
          <EmptyState
            title="No jobs available."
            message="Get started by posting your first job opening."
          >
            <Link className="btn btn-primary" to="/jobs/new">
              + Create Job
            </Link>
          </EmptyState>
        )
      ) : null}

      {!loading && !error && jobs.length > 0 ? (
        <JobTable jobs={jobs} onArchived={() => setVersion((v) => v + 1)} />
      ) : null}
    </section>
  );
}

export default JobsListPage;
