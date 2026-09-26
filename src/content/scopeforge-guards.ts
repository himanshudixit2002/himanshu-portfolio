/**
 * The checks ScopeForge makes before a request exists, in order, from its
 * README. `label` is the short form the scene draws; `question` the full
 * one the diagram lists.
 */
export const SCOPE_GUARDS = [
  { label: "Exact origin", question: "Is the origin exactly one the program authorized?" },
  { label: "Path not excluded", question: "Is the path outside every excluded prefix?" },
  { label: "Authorization valid", question: "Is the authorization still valid — not expired or revoked?" },
  { label: "Public address", question: "Does the host resolve to a public address? Pin that connection." },
  { label: "One GET, verified TLS", question: "Verified TLS, one GET, no redirects." },
] as const;
