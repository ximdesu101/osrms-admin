import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Loader,
    FileText,
    CalendarDays,
    User,
    MessageSquare,
    TriangleAlert,
    Ban,
    CheckCircle2,
    Clock,
    AlertCircle,
    Hash,
} from "lucide-react";
import { GetSubmissionRequest } from "@/services/submissionRequestService";

/* ─── document name → route + display label map ─────────────── */
const DOCUMENT_ROUTE_MAP = {
    // School Forms
    "School Form 1":  { path: "/school-forms/sf1",  label: "SF1 – School Register",            tab: "School Forms" },
    "School Form 2":  { path: "/school-forms/sf2",  label: "SF2 – Daily Attendance Register",  tab: "School Forms" },
    "School Form 3":  { path: "/school-forms/sf3",  label: "SF3 – Books Issued",               tab: "School Forms" },
    "School Form 4":  { path: "/school-forms/sf4",  label: "SF4 – Monthly Learner Movement",   tab: "School Forms" },
    "School Form 5":  { path: "/school-forms/sf5",  label: "SF5 – Report on Promotion",        tab: "School Forms" },
    "School Form 6":  { path: "/school-forms/sf6",  label: "SF6 – Summarized Promotion",       tab: "School Forms" },
    "School Form 7":  { path: "/school-forms/sf7",  label: "SF7 – School Personnel",           tab: "School Forms" },
    "School Form 8":  { path: "/school-forms/sf8",  label: "SF8 – Health and Nutrition",       tab: "School Forms" },
    "School Form 9":  { path: "/school-forms/sf9",  label: "SF9 – Progress Report Card",       tab: "School Forms" },
    "School Form 10": { path: "/school-forms/sf10", label: "SF10 – Learner's Academic Record", tab: "School Forms" },
    // Administrative Forms
    "Biometrics and DTR":                     { path: "/admin-forms/dtr",         label: "Biometrics and DTR",                      tab: "Administrative Forms" },
    "Activity Completion Report":             { path: "/admin-forms/acr",         label: "Activity Completion Report",              tab: "Administrative Forms" },
    "DepEd Partnership Database System":      { path: "/admin-forms/dpds",        label: "DepEd Partnership Database System",       tab: "Administrative Forms" },
    "Travel Order":                           { path: "/admin-forms/to",          label: "Travel Order",                            tab: "Administrative Forms" },
    "Leave Form":                             { path: "/admin-forms/lf",          label: "Leave Form",                              tab: "Administrative Forms" },
    "Special Order":                          { path: "/admin-forms/so",          label: "Special Order",                           tab: "Administrative Forms" },
    "National Simulation Earthquake Drill":   { path: "/admin-forms/snsed",       label: "National Simulation Earthquake Drill",    tab: "Administrative Forms" },
    "Transmittal":                            { path: "/admin-forms/transmittal",  label: "Transmittal",                             tab: "Administrative Forms" },
    "SBFP – School-Based Feeding Program":    { path: "/admin-forms/sbfp",        label: "SBFP – School-Based Feeding Program",     tab: "Administrative Forms" },
};

/* ─── status style maps ──────────────────────────────────────── */
const statusClass = {
    Draft:        "bg-slate-100 text-slate-700",
    Requested:    "bg-blue-100 text-blue-800",
    Acknowledged: "bg-yellow-100 text-yellow-800",
    Submitted:    "bg-green-100 text-green-800",
    Overdue:      "bg-red-100 text-red-800",
    Cancelled:    "bg-gray-100 text-gray-600",
};

const submissionStatusClass = {
    Submitted:             "bg-sky-100 text-sky-800",
    "Under Review":        "bg-yellow-100 text-yellow-800",
    "Revision Required":   "bg-orange-100 text-orange-800",
    Resubmitted:           "bg-blue-100 text-blue-800",
    Approved:              "bg-green-100 text-green-800",
};

/* ─── helpers ────────────────────────────────────────────────── */
function fmt(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            year: "numeric", month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

function fmtDate(str) {
    if (!str) return "—";
    try {
        return new Date(str).toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch {
        return str;
    }
}

function isOverdueDate(dueDateStr) {
    if (!dueDateStr) return false;
    try {
        const d = new Date(dueDateStr + "T23:59:59");
        return d < new Date();
    } catch {
        return false;
    }
}

/* ─── detail row ─────────────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`font-medium ${highlight ? "text-red-600" : ""}`}>{value || "—"}</p>
            </div>
        </div>
    );
}

/* ─── submission status section ──────────────────────────────── */
function SubmissionSection({ req }) {
    const navigate = useNavigate();
    const sub = req.submission;

    if (!sub) {
        if (req.status === "Cancelled") return null;

        if (req.status === "Submitted") {
            const route = DOCUMENT_ROUTE_MAP[req.document_name];

            return (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                        <p className="text-green-700 text-sm">
                            The teacher's document has been approved and filed. You can find it in the{" "}
                            <strong>{route ? route.label : req.document_name}</strong> section
                            {route ? (
                                <>
                                    {" "}under <strong>{route.tab}</strong>
                                </>
                            ) : null}
                            .
                        </p>
                    </div>
                    {route && (
                        <button
                            type="button"
                            onClick={() => navigate(route.path)}
                            className="ml-6 text-xs font-medium text-green-700 underline underline-offset-2 hover:text-green-900"
                        >
                            Go to {route.label} →
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="rounded-md border border-border bg-muted/40 p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                    No document has been submitted yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm">Submitted Document</p>
                <Badge className={submissionStatusClass[sub.status] || "bg-muted"}>
                    {sub.status}
                </Badge>
            </div>

            <div className="rounded-md border border-border bg-muted/40 p-3 space-y-1">
                <p className="text-sm font-medium truncate">{sub.original_name}</p>
                <p className="text-xs text-muted-foreground">
                    Submitted: {fmt(sub.submitted_at)}
                </p>
                {sub.formatted_size && (
                    <p className="text-xs text-muted-foreground">Size: {sub.formatted_size}</p>
                )}
            </div>

            {sub.status === "Revision Required" && sub.revision_note && (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-orange-700 uppercase tracking-wide mb-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Revision Note
                    </p>
                    <p className="text-orange-800 whitespace-pre-wrap text-xs">{sub.revision_note}</p>
                </div>
            )}

            {sub.status === "Approved" && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Document Approved
                    </p>
                    {sub.approved_at && (
                        <p className="text-green-600 text-xs">Approved on {fmt(sub.approved_at)}.</p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── main dialog ────────────────────────────────────────────── */
const SubmissionRequestDetailDialog = ({ requestId, onClose }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["submission-request-detail", requestId],
        queryFn: () => GetSubmissionRequest(requestId),
        enabled: !!requestId,
    });

    const req = data?.request ?? data?.data ?? data;

    return (
        <Dialog open={!!requestId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submission Request Details</DialogTitle>
                    <DialogDescription>
                        View the full details and submission status for this request.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin text-muted-foreground" />
                    </div>
                )}

                {req && (
                    <div className="space-y-4 text-sm">

                        {/* Status + Code */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={statusClass[req.status] || "bg-muted text-muted-foreground"}>
                                {req.status}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                                {req.request_code}
                            </span>
                        </div>

                        <hr className="border-border" />

                        {/* Core details */}
                        <div className="grid grid-cols-2 gap-3">
                            <DetailRow icon={FileText} label="Document" value={req.document_name} />
                            <DetailRow
                                icon={User}
                                label="Teacher"
                                value={req.teacher?.name ?? "—"}
                            />
                            <DetailRow
                                icon={Hash}
                                label="Teacher ID"
                                value={req.teacher?.teacher_id ?? "—"}
                            />
                            <DetailRow
                                icon={CalendarDays}
                                label="Request Date"
                                value={fmtDate(req.request_date)}
                            />
                            <DetailRow
                                icon={CalendarDays}
                                label="Due Date"
                                value={fmtDate(req.due_date)}
                                highlight={
                                    req.status !== "Submitted" &&
                                    req.status !== "Cancelled" &&
                                    isOverdueDate(req.due_date)
                                }
                            />
                        </div>

                        {/* Notes / instructions */}
                        {req.notes && (
                            <div className="rounded-md border border-border bg-muted/40 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Instructions / Notes
                                </p>
                                <p className="whitespace-pre-wrap leading-relaxed">{req.notes}</p>
                            </div>
                        )}

                        {/* Overdue warning */}
                        {req.status === "Overdue" && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                                <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                                <p className="text-red-700 text-xs">
                                    This request is past its due date and the teacher has not yet submitted.
                                </p>
                            </div>
                        )}

                        {/* Cancelled notice */}
                        {req.status === "Cancelled" && (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 flex items-start gap-2">
                                <Ban className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                                <p className="text-gray-600 text-xs">
                                    This request has been cancelled.
                                </p>
                            </div>
                        )}

                        <hr className="border-border" />

                        {/* Submission status */}
                        <SubmissionSection req={req} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SubmissionRequestDetailDialog;
