import api from "@/lib/axios";

export const GetSubmissionRequests = async ({ page = 1, search = "", status = "All" } = {}) => {
    const response = await api.get("/admin/submission-requests", {
        params: { page, search, status },
    });
    return response.data;
};

export const GetSubmissionRequestMetrics = async () => {
    const response = await api.get("/admin/submission-requests/metrics");
    return response.data;
};

export const GetActiveTeachers = async ({ search = "" } = {}) => {
    const response = await api.get("/admin/submission-requests/active-teachers", {
        params: { search },
    });
    return response.data;
};

export const CreateSubmissionRequest = async (payload) => {
    const response = await api.post("/admin/submission-requests", payload);
    return response.data;
};

export const UpdateSubmissionRequest = async (id, payload) => {
    const response = await api.put(`/admin/submission-requests/${id}`, payload);
    return response.data;
};

export const CancelSubmissionRequest = async (id) => {
    const response = await api.post(`/admin/submission-requests/${id}/cancel`);
    return response.data;
};

export const GetSubmissionRequest = async (id) => {
    const response = await api.get(`/admin/submission-requests/${id}`);
    return response.data;
};