import { useEffect, useState } from "react";
import {
  EMPLOYMENT_TYPES,
  EXPERIENCES,
  JOB_STATUSES,
  LOCATIONS,
  skillsToText,
  textToSkills,
} from "../services/constants.js";

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  description: "",
  required_skills: "",
  experience: "",
  employment_type: "",
  status: "",
};

function isBlank(value) {
  return !String(value || "").trim();
}

function JobForm({ initialJob, submitLabel, onSubmit, busy }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialJob) {
      setForm(EMPTY_FORM);
      return;
    }
    setForm({
      title: initialJob.title || "",
      company: initialJob.company || "",
      location: initialJob.location || "",
      description: initialJob.description || "",
      required_skills: skillsToText(initialJob.required_skills),
      experience: initialJob.experience || "",
      employment_type: initialJob.employment_type || "",
      status: initialJob.status || "",
    });
  }, [initialJob]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const required = [
      ["title", "Job title"],
      ["company", "Company"],
      ["location", "Location"],
      ["description", "Job description"],
      ["required_skills", "Required skills"],
      ["experience", "Experience"],
      ["employment_type", "Employment type"],
      ["status", "Job status"],
    ];

    required.forEach(([name, label]) => {
      if (isBlank(form[name])) {
        nextErrors[name] = `${label} is required.`;
      }
    });

    if (!isBlank(form.required_skills) && textToSkills(form.required_skills).length === 0) {
      nextErrors.required_skills =
        "Enter at least one skill, separated by commas.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    await onSubmit({
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      required_skills: textToSkills(form.required_skills),
      experience: form.experience,
      employment_type: form.employment_type,
      status: form.status,
    });
  }

  const skillPreview = textToSkills(form.required_skills);

  return (
    <form className="job-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="title">
            Job title <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className={errors.title ? "input-error" : ""}
          />
          {errors.title ? (
            <p className="field-error" id="title-error">{errors.title}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="company">
            Company <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="company"
            name="company"
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? "company-error" : undefined}
            className={errors.company ? "input-error" : ""}
          />
          {errors.company ? (
            <p className="field-error" id="company-error">{errors.company}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="location">
            Location <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <select
            id="location"
            name="location"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.location)}
            aria-describedby={errors.location ? "location-error" : undefined}
            className={errors.location ? "input-error" : ""}
          >
            <option value="">Select location</option>
            {LOCATIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.location ? (
            <p className="field-error" id="location-error">{errors.location}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="experience">
            Experience <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <select
            id="experience"
            name="experience"
            value={form.experience}
            onChange={(event) => updateField("experience", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.experience)}
            aria-describedby={errors.experience ? "experience-error" : undefined}
            className={errors.experience ? "input-error" : ""}
          >
            <option value="">Select experience</option>
            {EXPERIENCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.experience ? (
            <p className="field-error" id="experience-error">{errors.experience}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="employment_type">
            Employment type <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <select
            id="employment_type"
            name="employment_type"
            value={form.employment_type}
            onChange={(event) => updateField("employment_type", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.employment_type)}
            aria-describedby={errors.employment_type ? "employment-type-error" : undefined}
            className={errors.employment_type ? "input-error" : ""}
          >
            <option value="">Select type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.employment_type ? (
            <p className="field-error" id="employment-type-error">
              {errors.employment_type}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="status">
            Job status <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "status-error" : undefined}
            className={errors.status ? "input-error" : ""}
          >
            <option value="">Select status</option>
            {JOB_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.status ? (
            <p className="field-error" id="status-error">{errors.status}</p>
          ) : null}
        </div>

        <div className="field field-full">
          <label htmlFor="required_skills">
            Required skills <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            id="required_skills"
            name="required_skills"
            placeholder="Comma-separated, for example: Python, FastAPI, SQL"
            value={form.required_skills}
            onChange={(event) => updateField("required_skills", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.required_skills)}
            aria-describedby={
              errors.required_skills ? "required-skills-error" : "required-skills-hint"
            }
            className={errors.required_skills ? "input-error" : ""}
          />
          {errors.required_skills ? (
            <p className="field-error" id="required-skills-error">
              {errors.required_skills}
            </p>
          ) : (
            <p className="field-hint" id="required-skills-hint">
              Separate skills with commas.
            </p>
          )}
          {skillPreview.length > 0 ? (
            <ul className="skill-list" aria-label="Skills preview">
              {skillPreview.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="field field-full">
          <label htmlFor="description">
            Job description <span className="required-mark" aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows="6"
            placeholder="Describe the role, responsibilities, and what the team is looking for..."
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            className={errors.description ? "input-error" : ""}
          />
          {errors.description ? (
            <p className="field-error" id="description-error">{errors.description}</p>
          ) : null}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default JobForm;
