export const Status = {
  LOCKED: "Locked",
  TODO: "Not started",
  DOING: "In progress",
  REVIEW: "Accepted / Submitted",
  DONE: "Done",
};

export const allUseCases = [
  "Certificate Management",
  "Digital Battery Passport",
  "PCF",
  "Traceability",
  "DCM",
];

export const phaseMeta = {
  1: { name: "Introduction", color: "blue" },
  2: { name: "Activation", color: "green" },
  3: { name: "Rollout (ConXify)", color: "amber" },
  4: { name: "Hypercare", color: "violet" },
};
