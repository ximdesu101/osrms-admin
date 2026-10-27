"use client"

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { AdminLogout } from "@/services/AuthService";

const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    {
        title: "User Management",
        url: "#",
        icon: Users,
        items: [
            { title: "Staff Account", url: "#" },
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

export function AppSidebar({ ...props }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Read the authenticated admin's data from localStorage
    const stored = React.useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("admin") || "{}");
        } catch {
            return {};
        }
    }, []);

    const user = {
        name: "System Administrator",
        username: stored.username ?? "admin",
        avatar: "",
    };

    const handleLogout = async () => {
        try {
            await AdminLogout();
        } catch {
            // Token may already be invalid — continue with local cleanup
        }
        // Clear all local admin session data
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin");
        // Clear all cached queries so the next user starts fresh
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
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} onLogout={handleLogout} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
