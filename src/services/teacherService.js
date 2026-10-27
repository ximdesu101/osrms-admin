import api from "@/lib/axios";

export const CreateTeacher = async (payload) => {
    const response = await api.post("/admin/teachers", payload);
    return response.data;
};

export const GetTeachers = async ({ page = 1, search = "" } = {}) => {
    const response = await api.get("/admin/teachers", {
        params: { page, search },
    });
    return response.data;
};

export const GetTeacherMetrics = async () => {
    const response = await api.get("/admin/teachers/metrics");
    return response.data;
};

export const UpdateTeacher = async ({ id, ...payload }) => {
    const response = await api.put(`/admin/teachers/${id}`, payload);
    return response.data;
};

export const DeleteTeacher = async (id) => {
    const response = await api.delete(`/admin/teachers/${id}`);
    return response.data;
};
