import api from "@/lib/axios";

/**
 * Fetch report meta (types, statuses, presets, formats).
 */
export const GetReportMeta = async () => {
    const response = await api.get("/admin/reports/meta");
    return response.data;
};

/**
 * Fetch analytics summary + chart data.
 * @param {{ from?: string, to?: string, preset?: string, group_by?: string }} params
 */
export const GetReportAnalytics = async (params = {}) => {
    const response = await api.get("/admin/reports/analytics", { params });
    return response.data;
};

/**
 * Fetch paginated table for a report category.
 * @param {{ type: string, page?: number, per_page?: number, status?: string, search?: string, from?: string, to?: string, document_code?: string }} params
 */
export const GetReportTable = async (params = {}) => {
    const response = await api.get("/admin/reports/table", { params });
    return response.data;
};

/**
 * Export a report file (returns blob).
 * @param {object} payload
 */
export const ExportReport = async (payload) => {
    const response = await api.post("/admin/reports/export", payload, {
        responseType: "blob",
    });
    return response;
};