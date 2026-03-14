export function formatMongoDate(dateObj) {
  if (!dateObj) return "N/A";

  const dateStr = dateObj.$date || dateObj;
  return new Date(dateStr).toLocaleString();
}
