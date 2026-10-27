import api from "@/lib/axios";

/**
 * Fetch a paginated list of audit log entries.
 *
 * @param {object} params
 * @param {string} [params.role]      'All' | 'Admin' | 'Teacher'
 * @param {string} [params.search]    Filter by actor name / username
 * @param {string} [params.category]  Filter by category
 * @param {string} [params.status]    'All' | 'success' | 'failed'
 * @param {number} [params.page]      Page number (default 1)
 * @param {number} [params.per_page]  Rows per page (default 20)
 */
export const GetAuditLogs = async ({
    role = "All",
    search = "",
    category = "",
    status = "All",
    page = 1,
    per_page = 20,
} = {}) => {
    const response = await api.get("/admin/audit-logs", {
        params: { role, search, category, status, page, per_page },
    });
    return response.data;
};

/**
 * Fetch available filter options (distinct categories, roles, statuses).
 */
export const GetAuditLogMeta = async () => {
    const response = await api.get("/admin/audit-logs/meta");
    return response.data;
};
