import {
  EMPLOYMENT_TYPES,
  EXPERIENCES,
  JOB_STATUSES,
  LOCATIONS,
} from "../services/constants.js";

function SearchFilters({
  search,
  location,
  experience,
  employmentType,
  status,
  onSearchChange,
  onFilterChange,
  onReset,
}) {
  const hasActiveFilters = Boolean(
    search || location || experience || employmentType || status
  );

  return (
    <section className="filters-panel" aria-label="Search and filters">
      <div className="filter-grid">
        <div className="field field-search">
          <label htmlFor="job-search">Search</label>
          <input
            id="job-search"
            type="search"
            placeholder="Search jobs by title or company..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="filter-location">Location</label>
          <select
            id="filter-location"
            value={location}
            onChange={(event) => onFilterChange("location", event.target.value)}
          >
            <option value="">All locations</option>
            {LOCATIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-experience">Experience</label>
          <select
            id="filter-experience"
            value={experience}
            onChange={(event) => onFilterChange("experience", event.target.value)}
          >
            <option value="">All experience</option>
            {EXPERIENCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-employment">Employment type</label>
          <select
            id="filter-employment"
            value={employmentType}
            onChange={(event) =>
              onFilterChange("employment_type", event.target.value)
            }
          >
            <option value="">All types</option>
            {EMPLOYMENT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={status}
            onChange={(event) => onFilterChange("status", event.target.value)}
          >
            <option value="">All statuses</option>
            {JOB_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}

export default SearchFilters;
