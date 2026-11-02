import api from "@/lib/axios";
import { GetSubmissionRequests } from "@/services/submissionRequestService";

/**
 * Fetch aggregated dashboard metrics for submission requests:
 *   { complete, pending, missing, overdue }
 */
export const GetDashboardMetrics = async () => {
    const [completedRes, requestedRes, acknowledgedRes, overdueRes, needsRevRes, awaitingRes, cancelledRes] =
        await Promise.all([
            GetSubmissionRequests({ page: 1, status: "Completed" }),
            GetSubmissionRequests({ page: 1, status: "Requested" }),
            GetSubmissionRequests({ page: 1, status: "Acknowledged" }),
            GetSubmissionRequests({ page: 1, status: "Overdue" }),
            GetSubmissionRequests({ page: 1, status: "Needs Revision" }),
            GetSubmissionRequests({ page: 1, status: "Awaiting Approval" }),
            GetSubmissionRequests({ page: 1, status: "Cancelled" }),
        ]);

    const total = (res) => res?.total ?? res?.data?.length ?? 0;

    const pending =
        total(requestedRes) +
        total(acknowledgedRes) +
        total(needsRevRes) +
        total(awaitingRes);

    return {
        complete: total(completedRes),
        pending,
        missing: total(cancelledRes),
        overdue: total(overdueRes),
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
