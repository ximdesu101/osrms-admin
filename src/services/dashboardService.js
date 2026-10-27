import api from "@/lib/axios";

/**
 * Fetch aggregated dashboard metrics:
 *   { teachers, submissions, documents }
 */
export const GetDashboardMetrics = async () => {
    const response = await api.get("/admin/dashboard/metrics");
    return response.data;
};

/**
 * Fetch monthly request/submission counts for the current year.
 * Returns { year, data: [{ month, document_requests, submission_requests }] }
 */
export const GetMonthlyStats = async () => {
    const response = await api.get("/admin/dashboard/monthly-stats");
    return response.data;
};

/**
 * Fetch calendar events (submission requests with due dates).
 * @param {string} [from]  YYYY-MM-DD start of range (optional)
 * @param {string} [to]    YYYY-MM-DD end of range (optional)
 * Returns { events: [...] }
 */
export const GetCalendarEvents = async ({ from, to } = {}) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await api.get("/admin/dashboard/calendar-events", { params });
    return response.data;
};
