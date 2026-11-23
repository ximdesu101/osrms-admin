import api from "@/lib/axios";
import { GetSubmissionRequestMetrics } from "@/services/submissionRequestService";

/**
 * Fetch aggregated dashboard metrics for submission requests:
 *   { complete, pending, missing, overdue }
 */
export const GetDashboardMetrics = async () => {
    const metrics = await GetSubmissionRequestMetrics();

    const requested = metrics?.requested ?? 0;
    const acknowledged = metrics?.acknowledged ?? 0;
    const submitted = metrics?.submitted ?? 0;
    const overdue = metrics?.overdue ?? 0;
    const cancelled = metrics?.cancelled ?? 0;

    return {
        complete: submitted,
        pending: requested + acknowledged,
        missing: cancelled,
        overdue,
    };
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
