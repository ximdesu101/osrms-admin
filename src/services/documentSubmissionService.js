import api from "@/lib/axios";

export const GetDocumentSubmissions = async ({ page = 1, search = "", status = "All", documentCode = "" } = {}) => {
    const params = { page, search, status };
    if (documentCode) {
        params.document_code = documentCode;
    }
    const response = await api.get("/admin/document-submissions", {
        params,
    });
    return response.data;
};

/**
 * Fetch approved document submissions for a specific form category (e.g. SF1).
 */
export const GetApprovedDocumentsByForm = async ({ formCode, page = 1, search = "" } = {}) => {
    return GetDocumentSubmissions({
        page,
        search,
        status: "Approved",
        documentCode: formCode,
    });
};

export const GetDocumentSubmissionMetrics = async () => {
    const response = await api.get("/admin/document-submissions/metrics");
    return response.data;
};

export const GetDocumentSubmission = async (id) => {
    const response = await api.get(`/admin/document-submissions/${id}`);
    return response.data;
};

export const ApproveDocumentSubmission = async (id) => {
    const response = await api.post(`/admin/document-submissions/${id}/approve`);
    return response.data;
};

export const RequestRevision = async (id, revisionNote) => {
    const response = await api.post(`/admin/document-submissions/${id}/request-revision`, {
        revisionNote,
    });
    return response.data;
};

export const DownloadDocumentSubmission = async (id) => {
    return api.get(`/admin/document-submissions/${id}/download`, {
        responseType: "blob",
    });
};