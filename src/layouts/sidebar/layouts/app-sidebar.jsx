"use client"

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { NavMain } from "@/layouts/sidebar/layouts/nav-main";
import { NavUser } from "@/layouts/sidebar/layouts/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Users,
    FileText,
    FilePlusCorner,
    Send,
    FileBox,
    Bell,
    ChartNoAxesCombined,
    Logs,
} from "lucide-react";
import { AdminLogout, StaffLogout } from "@/services/AuthService";

const adminNavMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
        title: "User Management",
        url: "#",
        icon: Users,
        items: [
            { title: "Staff Account", url: "/staff-account" },
            { title: "Teacher Accounts", url: "/teacher-account" },
        ],
    },
    { title: "Forms", url: "/forms", icon: FileText },
    { title: "Document Requests", url: "/document-requests", icon: FilePlusCorner },
    {
        title: "Document Submission",
        url: "#",
        icon: Send,
        items: [
            { title: "Submission Request", url: "/submission-requests" },
            { title: "Submission Approval", url: "/submission-approvals" },
        ],
    },
    { title: "Drafts", url: "/drafts", icon: FileBox },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Reports", url: "#", icon: ChartNoAxesCombined },
    { title: "Audit Logs", url: "/audit-logs", icon: Logs },
];

// Staff: same operational pages, without Admin-exclusive items
const staffNavMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Forms", url: "/forms", icon: FileText },
    { title: "Document Requests", url: "/document-requests", icon: FilePlusCorner },
    {
        title: "Document Submission",
        url: "#",
        icon: Send,
        items: [
            { title: "Submission Request", url: "/submission-requests" },
            { title: "Submission Approval", url: "/submission-approvals" },
        ],
    },
    { title: "Drafts", url: "/drafts", icon: FileBox },
    { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar({ ...props }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const role = React.useMemo(() => localStorage.getItem("auth_role") || "admin", []);

    const stored = React.useMemo(() => {
        try {
            if (role === "staff") {
                return JSON.parse(localStorage.getItem("staff") || "{}");
            }
            return JSON.parse(localStorage.getItem("admin") || "{}");
        } catch {
            return {};
        }
    }, [role]);

    const user = React.useMemo(() => {
        if (role === "staff") {
            const fullName = [stored.first_name, stored.last_name].filter(Boolean).join(" ") || "Staff";
            return {
                name: fullName,
                username: stored.username ?? "staff",
                avatar: "",
            };
        }
        return {
            name: "System Administrator",
            username: stored.username ?? "admin",
            avatar: "",
        };
    }, [role, stored]);

    const navItems = role === "staff" ? staffNavMain : adminNavMain;

    const handleLogout = async () => {
        try {
            if (role === "staff") {
                await StaffLogout();
            } else {
                await AdminLogout();
            }
        } catch {
            // Token may already be invalid — continue with local cleanup
        }
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff");
        localStorage.removeItem("auth_role");
        queryClient.clear();
        navigate("/", { replace: true });
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <div className="flex aspect-square -ml-2 size-8 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground">
                                <img
                                    src="/favicon-96x96.png"
                                    alt="OSRMS Logo"
                                    className="size-8 object-contain"
                                />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Tagnao Elementary School</span>
                                <span className="truncate text-xs">Records Management System</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} onLogout={handleLogout} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}