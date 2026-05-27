/**
 * Formats a UTC date string into a user-friendly relative last active time.
 * @param {string} dateString - The UTC date string to format
 * @returns {string} Relative time string (e.g. "just now", "5m ago", "3h ago", "2d ago", or "May 27")
 */
export function formatLastSeen(dateString) {
  if (!dateString) return "some time ago";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "some time ago";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Fallback for minor clock drift
    if (diffMs < 0) return "just now";

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    // Otherwise, return standard month day format, e.g. "May 27"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (error) {
    return "some time ago";
  }
}
