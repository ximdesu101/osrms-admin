import { useEffect, useState, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminMe, StaffMe } from "@/services/AuthService";

const AuthProtector = () => {
    const [status, setStatus] = useState("checking");
    const validatingRef = useRef(false);

    const clearSession = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff");
        localStorage.removeItem("auth_role");
    };

    const validateAuth = async () => {
        if (validatingRef.current) return;
        validatingRef.current = true;

        const role = localStorage.getItem("auth_role");
        const adminToken = localStorage.getItem("admin_token");
        const staffToken = localStorage.getItem("staff_token");

        if (!adminToken && !staffToken) {
            setStatus("invalid");
            validatingRef.current = false;
            return;
        }

        try {
            if (role === "staff" || (!role && staffToken && !adminToken)) {
                await StaffMe();
                if (!localStorage.getItem("auth_role")) {
                    localStorage.setItem("auth_role", "staff");
                }
            } else {
                await AdminMe();
                if (!localStorage.getItem("auth_role")) {
                    localStorage.setItem("auth_role", "admin");
                }
            }
            setStatus("valid");
        } catch {
            clearSession();
            setStatus("invalid");
        } finally {
            validatingRef.current = false;
        }
    };

    useEffect(() => {
        validateAuth();

        const handlePageShow = (event) => {
            if (event.persisted) {
                validateAuth();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    if (status === "checking") {
        return null;
    }

    if (status === "invalid") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthProtector;