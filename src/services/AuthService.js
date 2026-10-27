import api from "@/lib/axios";

export const AdminLogin = async (credentials) => {
    const response = await api.post("/admin/login", credentials);
    return response.data;
};

export const AdminMe = async () => {
    const response = await api.get("/admin/me");
    return response.data;
};

export const AdminLogout = async () => {
    const response = await api.post("/admin/logout");
    return response.data;
};