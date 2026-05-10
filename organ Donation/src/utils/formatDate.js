/**
 * Format an ISO date string to a readable format.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date e.g. "Oct 25, 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
