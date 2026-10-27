
import api from "@/lib/axios";

/**
 * Fetch template metadata for a school form (SF1–SF10).
 * Returns the current (active) template, or null if none (404).
 */
export const GetTemplate = async (formCode) => {
    try {
        const response = await api.get(
            `/admin/school-forms/${encodeURIComponent(formCode)}/template`
        );
        return response.data.template ?? null;
    } catch (err) {
        if (err.response?.status === 404) {
            return null;
        }
        throw err;
    }
};

/**
 * List all templates (current + archived) for a form.
 */
export const GetTemplates = async (formCode) => {
    const response = await api.get(
        `/admin/school-forms/${encodeURIComponent(formCode)}/templates`
    );
    return response.data.templates ?? [];
};

/**
 * Upload a new template; it becomes Current and archives the previous current.
 * @param {string} formCode
 * @param {File} file
 */
export const UploadTemplate = async (formCode, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
        `/admin/school-forms/${encodeURIComponent(formCode)}/template`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

/**
 * Activate an archived template (makes it Current, archives the previous current).
 */
export const ActivateTemplate = async (formCode, templateId) => {
    const response = await api.post(
        `/admin/school-forms/${encodeURIComponent(formCode)}/templates/${templateId}/activate`
    );
    return response.data;
};

/**
 * Delete a template by id.
 */
export const DeleteTemplate = async (formCode, templateId) => {
    const response = await api.delete(
        `/admin/school-forms/${encodeURIComponent(formCode)}/templates/${templateId}`
    );
    return response.data;
};

/**
 * Download URL for the current template (requires auth header when fetched as blob).
 */
export const getTemplateDownloadUrl = (formCode) =>
    `/admin/school-forms/${encodeURIComponent(formCode)}/template/download`;

/**
 * Download template as a blob (authenticated).
 */
export const DownloadTemplate = async (formCode) => {
    const response = await api.get(
        `/admin/school-forms/${encodeURIComponent(formCode)}/template/download`,
        { responseType: "blob" }
    );
    return response;
};

/**
 * Fetch styled preview data (values + formatting) for a form's current template.
 * Used to render the spreadsheet in its original visual form.
 * @param {string} formCode
 */
export const GetTemplatePreview = async (formCode) => {
    const response = await api.get(
        `/admin/school-forms/${encodeURIComponent(formCode)}/template/preview`
    );
    return response.data;
};

/**
 * Summary metrics for all school forms (approved file counts + template info).
 * Used by the School Forms listing cards.
 */
export const GetSchoolFormsSummary = async () => {
    const response = await api.get("/admin/school-forms/summary");
    return response.data;
};

/**
 * Summary metrics for administrative forms (approved file counts + template info).
 * Used by the Administrative Forms listing cards.
 */
export const GetAdminFormsSummary = async () => {
    const response = await api.get("/admin/admin-forms/summary");
    return response.data;
};