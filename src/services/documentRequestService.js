import api from "@/lib/axios";

export const GetDocumentRequests = async ({ page = 1, search = "", status = "All" } = {}) => {
    const response = await api.get("/admin/document-requests", {
        params: { page, search, status },
    });
    return response.data;
};

export const GetDocumentRequestMetrics = async () => {
    const response = await api.get("/admin/document-requests/metrics");
    return response.data;
};

export const GetDocumentRequest = async (id) => {
    const response = await api.get(`/admin/document-requests/${id}`);
    return response.data;
};

export const AcknowledgeDocumentRequest = async (id) => {
    const response = await api.post(`/admin/document-requests/${id}/acknowledge`);
    return response.data;
};

export const MarkDocumentRequestProcessing = async (id) => {
    const response = await api.post(`/admin/document-requests/${id}/processing`);
    return response.data;
};

export const FulfillDocumentRequest = async (id, file, adminMessage) => {
    const formData = new FormData();
    formData.append("file", file);
    if (adminMessage) formData.append("admin_message", adminMessage);
    const response = await api.post(`/admin/document-requests/${id}/fulfill`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const MarkDocumentRequestUnavailable = async (id, adminMessage) => {
    const response = await api.post(`/admin/document-requests/${id}/unavailable`, {
        admin_message: adminMessage,
    });
    return response.data;
};

export const CancelDocumentRequest = async (id) => {
    const response = await api.post(`/admin/document-requests/${id}/cancel`);
    return response.data;
};

export const DownloadDocumentRequest = (id) =>
    `${api.defaults.baseURL}/admin/document-requests/${id}/download`;

// Admin notifications
export const GetAdminNotifications = async ({ page = 1, filter = "all" } = {}) => {
    const response = await api.get("/admin/notifications", { params: { page, filter } });
    return response.data;
};

export const GetAdminNotificationUnreadCount = async () => {
    const response = await api.get("/admin/notifications/unread-count");
    return response.data;
};

export const MarkAdminNotificationAsRead = async (id) => {
    const response = await api.post(`/admin/notifications/${id}/read`);
    return response.data;
};

export const MarkAllAdminNotificationsAsRead = async () => {
    const response = await api.post("/admin/notifications/mark-all-read");
    return response.data;
};
