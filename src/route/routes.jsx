import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/auth/Login";
import AuthProtector from "./protector/AuthProtector";
import Sidebar from "@/layouts/sidebar/Sidebar";
import Dashboard from "@/pages/dashboard/Dashboard";
import TeacherAccount from "@/pages/users/teachers/TeacherAccount";
import Forms from "@/pages/forms/Forms";
import SF1 from "@/pages/forms/school-forms/layouts/sf1/SF1";
import SF2 from "@/pages/forms/school-forms/layouts/sf2/SF2";
import SF3 from "@/pages/forms/school-forms/layouts/sf3/SF3";
import SF4 from "@/pages/forms/school-forms/layouts/sf4/SF4";
import SF5 from "@/pages/forms/school-forms/layouts/sf5/SF5";
import SF6 from "@/pages/forms/school-forms/layouts/sf6/SF6";
import SF7 from "@/pages/forms/school-forms/layouts/sf7/SF7";
import SF8 from "@/pages/forms/school-forms/layouts/sf8/SF8";
import SF9 from "@/pages/forms/school-forms/layouts/sf9/SF9";
import SF10 from "@/pages/forms/school-forms/layouts/sf10/SF10";
import AdminDTR from "@/pages/forms/administrative-forms/layout/dtr/dtr";
import AdminACR from "@/pages/forms/administrative-forms/layout/acr/acr";
import AdminDPDS from "@/pages/forms/administrative-forms/layout/dpds/dpds";
import AdminTO from "@/pages/forms/administrative-forms/layout/to/to";
import AdminLF from "@/pages/forms/administrative-forms/layout/lf/lf";
import AdminSO from "@/pages/forms/administrative-forms/layout/so/so";
import AdminSNSED from "@/pages/forms/administrative-forms/layout/snsed/snsed";
import AdminTransmittal from "@/pages/forms/administrative-forms/layout/transmittal/transmittal";
import SubmissionRequests from "@/pages/submission/submission-request/SubmissionRequest";
import AddRequestForm from "@/pages/submission/submission-request/layout/AddRequestForm";
import SubmissionApprovals from "@/pages/submission/submission-approval/SubmissionApproval";
import Notifications from "@/pages/notifications/Notifications";
import AuditLogs from "@/pages/audit-logs/AuditLogs";
import Draft from "@/pages/draft/Draft";
import DocumentRequests from "@/pages/document-requests/DocumentRequests";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Login />
            },
        ],
    },
    {
        element: <AuthProtector />,
        children: [
            {
                element: <Sidebar />,
                children: [
                    { path: "dashboard", element: <Dashboard />, handle: { crumb: () => "Dashboard" } },
                    { path: "teacher-account", element: <TeacherAccount />, handle: { crumb: () => "Teacher Account" } },
                    { path: "forms", element: <Forms />, handle: { crumb: () => "School Forms" } },
                    { path: "school-forms/sf1", element: <SF1 />, handle: { crumb: () => "School Register" } },
                    { path: "school-forms/sf2", element: <SF2 />, handle: { crumb: () => "SF2 – Daily Attendance" } },
                    { path: "school-forms/sf3", element: <SF3 />, handle: { crumb: () => "SF3 – Books Issued" } },
                    { path: "school-forms/sf4", element: <SF4 />, handle: { crumb: () => "SF4 – Monthly Movement" } },
                    { path: "school-forms/sf5", element: <SF5 />, handle: { crumb: () => "SF5 – Promotion Report" } },
                    { path: "school-forms/sf6", element: <SF6 />, handle: { crumb: () => "SF6 – Summarized Promotion" } },
                    { path: "school-forms/sf7", element: <SF7 />, handle: { crumb: () => "SF7 – School Personnel" } },
                    { path: "school-forms/sf8", element: <SF8 />, handle: { crumb: () => "SF8 – Health Profile" } },
                    { path: "school-forms/sf9", element: <SF9 />, handle: { crumb: () => "SF9 – Progress Report Card" } },
                    { path: "school-forms/sf10", element: <SF10 />, handle: { crumb: () => "SF10 – Academic Record" } },
                    { path: "admin-forms/dtr", element: <AdminDTR />, handle: { crumb: () => "Biometrics and DTR" } },
                    { path: "admin-forms/acr", element: <AdminACR />, handle: { crumb: () => "Activity Completion Report" } },
                    { path: "admin-forms/dpds", element: <AdminDPDS />, handle: { crumb: () => "DPDS" } },
                    { path: "admin-forms/to", element: <AdminTO />, handle: { crumb: () => "Travel Order" } },
                    { path: "admin-forms/lf", element: <AdminLF />, handle: { crumb: () => "Leave Form" } },
                    { path: "admin-forms/so", element: <AdminSO />, handle: { crumb: () => "Special Order" } },
                    { path: "admin-forms/snsed", element: <AdminSNSED />, handle: { crumb: () => "NSED" } },
                    { path: "admin-forms/transmittal", element: <AdminTransmittal />, handle: { crumb: () => "Transmittal" } },
                    { path: "submission-requests", element: <SubmissionRequests />, handle: { crumb: () => "Submission Requests" } },
                    {
                        path: "submission-requests/create",
                        element: <AddRequestForm />,
                        handle: {
                            crumb: () => "Create Request",
                            parentCrumb: {
                                label: "Submission Requests",
                                href: "/submission-requests",
                            },
                        },
                    },
                    { path: "submission-approvals", element: <SubmissionApprovals />, handle: { crumb: () => "Submission Approvals" } },
                    { path: "document-requests", element: <DocumentRequests />, handle: { crumb: () => "Document Requests" } },
                    { path: "drafts", element: <Draft />, handle: { crumb: () => "Drafts" } },
                    { path: "notifications", element: <Notifications />, handle: { crumb: () => "Notifications" } },
                    { path: "audit-logs", element: <AuditLogs />, handle: { crumb: () => "Audit Logs" } },
                ],
            },
        ],
    },
]);