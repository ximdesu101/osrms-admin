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

export const StaffLogin = async (credentials) => {
    const response = await api.post("/staff/login", credentials);
    return response.data;
};

export const StaffMe = async () => {
    const response = await api.get("/staff/me");
    return response.data;
};

export const StaffLogout = async () => {
    const response = await api.post("/staff/logout");
    return response.data;
};

export const StaffLookup = async (staffId) => {
    const response = await api.get(`/staff/lookup/${encodeURIComponent(staffId)}`);
    return response.data;
};

export const StaffActivate = async (payload) => {
    const response = await api.post("/staff/activate", payload);
    return response.data;
};

/**
 * Unified login: try Admin first, then Staff.
 * Returns { role: 'admin'|'staff', token, user }
 */
export const UnifiedLogin = async (credentials) => {
    try {
        const data = await AdminLogin(credentials);
        return {
            role: "admin",
            token: data.token,
            user: data.admin,
            raw: data,
        };
    } catch (adminErr) {
        // Only fall through to Staff on auth failure (401/403), not on network/server errors
        const status = adminErr.response?.status;
        if (status !== 401 && status !== 403) {
            throw adminErr;
        }
        try {
            const data = await StaffLogin(credentials);
            return {
                role: "staff",
                token: data.token,
                user: data.staff,
                raw: data,
            };
        } catch (staffErr) {
            // Prefer staff error message if both fail, otherwise admin
            throw staffErr.response ? staffErr : adminErr;
        }
    }
};