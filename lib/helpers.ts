export const formatDate = (dateString?: string) => {
  if (!dateString) return "No Due Date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};
