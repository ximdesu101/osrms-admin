import api from "@/lib/axios";

export const CreateStaff = async (payload) => {
    const response = await api.post("/admin/staffs", payload);
    return response.data;
};

export const GetStaffs = async ({ page = 1, search = "" } = {}) => {
    const response = await api.get("/admin/staffs", {
        params: { page, search },
    });
    return response.data;
};

export const GetStaffMetrics = async () => {
    const response = await api.get("/admin/staffs/metrics");
    return response.data;
};

export const GetStaff = async (id) => {
    const response = await api.get(`/admin/staffs/${id}`);
    return response.data;
};

export const UpdateStaff = async ({ id, ...payload }) => {
    const response = await api.put(`/admin/staffs/${id}`, payload);
    return response.data;
};

export const ToggleStaffStatus = async (id) => {
    const response = await api.patch(`/admin/staffs/${id}/toggle-status`);
    return response.data;
};

export const DeleteStaff = async (id) => {
    const response = await api.delete(`/admin/staffs/${id}`);
    return response.data;
};
