export const LOCATIONS = [
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Pune",
  "Mumbai",
  "Delhi",
  "Remote",
];

export const EXPERIENCES = [
  "0-1 years",
  "1-2 years",
  "2-4 years",
  "4-6 years",
  "6+ years",
];

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
];

export const JOB_STATUSES = ["Active", "Draft", "Archived"];

export function formatDate(value) {
  if (!value) {
    return "—";
  }
  // created_date is stored as "YYYY-MM-DD"; format it for display.
  const parts = String(value).split("-");
  if (parts.length !== 3) {
    return value;
  }
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function skillsToText(skills) {
  return Array.isArray(skills) ? skills.join(", ") : "";
}

export function textToSkills(value) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}
