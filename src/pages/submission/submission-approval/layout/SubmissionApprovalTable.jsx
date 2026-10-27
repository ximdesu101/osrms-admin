import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Eye,
    Loader,
    Loader2,
    CheckCircle2,
    RotateCcw,
    SearchX,
    FileText,
    User,
    Hash,
    CalendarDays,
    Download,
    AlertCircle,
    RefreshCw,
    Clock,
} from "lucide-react";
import {
    GetDocumentSubmissions,
    GetDocumentSubmission,
    ApproveDocumentSubmission,
    RequestRevision,
    DownloadDocumentSubmission,
} from "@/services/documentSubmissionService";

/* ─── helpers ────────────────────────────────────────────────── */

const statusClass = {
    Submitted:           "bg-blue-100 text-blue-800 hover:bg-blue-100",
    "Under Review":      "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "Revision Required": "bg-amber-100 text-amber-800 hover:bg-amber-100",
    Resubmitted:         "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Approved:            "bg-green-100 text-green-800 hover:bg-green-100",
};

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

/* ─── detail row (matches teacher dialog style) ─────────────── */
function DetailRow({ icon: Icon, label, value, highlight = false, children }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground leading-none mb-0.5">{label}</p>
                {children ?? (
                    <p className={`font-medium leading-snug ${highlight ? "text-red-600" : ""}`}>
                        {value || "—"}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─── main component ─────────────────────────────────────────── */
const SubmissionApprovalTable = () => {
    const [search, setSearch]         = useState("");
    const [status, setStatus]         = useState("All");
    const [page, setPage]             = useState(1);
    const [reviewId, setReviewId]     = useState(null);
    const [revisionOpen, setRevisionOpen] = useState(false);
    const [revisionNote, setRevisionNote] = useState("");
    const [downloading, setDownloading]   = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["document-submissions", search, status, page],
        queryFn: () => GetDocumentSubmissions({ page, search, status }),
        keepPreviousData: true,
    });

    const { data: detailData, isLoading: detailLoading } = useQuery({
        queryKey: ["document-submission", reviewId],
        queryFn: () => GetDocumentSubmission(reviewId),
        enabled: !!reviewId,
    });

    const detail = detailData?.submission;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["document-submissions"] });
        queryClient.invalidateQueries({ queryKey: ["document-submission-metrics"] });
        if (reviewId) {
            queryClient.invalidateQueries({ queryKey: ["document-submission", reviewId] });
        }
    };

    const approveMutation = useMutation({
        mutationFn: ApproveDocumentSubmission,
        onSuccess: (res) => {
            toast.success(res?.message || "Document approved.");
            setReviewId(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to approve."),
    });

    const revisionMutation = useMutation({
        mutationFn: ({ id, note }) => RequestRevision(id, note),
        onSuccess: (res) => {
            toast.success(res?.message || "Revision requested.");
            setRevisionOpen(false);
            setRevisionNote("");
            setReviewId(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to request revision."),
    });

    const submissions = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;

    const canReview = detail &&
        ["Submitted", "Under Review", "Resubmitted"].includes(detail.status);

    const handleDownload = async () => {
        if (!detail) return;
        setDownloading(true);
        try {
            const response = await DownloadDocumentSubmission(detail.id);
            const url = URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = detail.original_name || `submission-${detail.submission_code}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to download file. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const closeDialog = () => {
        setReviewId(null);
        setRevisionOpen(false);
        setRevisionNote("");
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                        <TabsList className="flex-wrap">
                            <TabsTrigger value="All">All</TabsTrigger>
                            <TabsTrigger value="Submitted">Submitted</TabsTrigger>
                            <TabsTrigger value="Resubmitted">Resubmitted</TabsTrigger>
                            <TabsTrigger value="Revision Required">Revision</TabsTrigger>
                            <TabsTrigger value="Approved">Approved</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Field className="w-full sm:w-72">
                        <InputGroup>
                            <InputGroupAddon>
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="search"
                                placeholder="Search submissions..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </InputGroup>
                    </Field>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-[#00601c]">
                            <TableRow className="hover:bg-[#00601c]">
                                <TableHead className="text-white">Submission ID</TableHead>
                                <TableHead className="text-white">Teacher</TableHead>
                                <TableHead className="text-white">Request ID</TableHead>
                                <TableHead className="text-white">Document</TableHead>
                                <TableHead className="text-white">Submitted Date</TableHead>
                                <TableHead className="text-white">Revision</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-right text-white">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        <Loader className="mx-auto animate-spin" />
                                        Loading submissions...
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && isError && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-destructive">
                                        Failed to load submissions.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && !isError && submissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        <SearchX className="mx-auto" />
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && !isError && submissions.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium font-mono text-xs">
                                        {s.submission_code}
                                    </TableCell>
                                    <TableCell>{s.teacher?.name ?? "—"}</TableCell>
                                    <TableCell className="font-mono text-xs">{s.request_code}</TableCell>
                                    <TableCell>{s.document_name}</TableCell>
                                    <TableCell className="whitespace-nowrap">{s.submitted_date ?? "—"}</TableCell>
                                    <TableCell className="text-center">{s.revision_count}</TableCell>
                                    <TableCell>
                                        <Badge className={statusClass[s.status] || "bg-gray-100"}>
                                            {s.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setReviewId(s.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Separator />

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page <span className="font-medium text-foreground">{page}</span> of{" "}
                            <span className="font-medium text-foreground">{lastPage}</span>
                        </p>
                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink isActive>{page}</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                                        className={page >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>

            {/* ── Review / View Dialog ──────────────────────────────────── */}
            <Dialog open={!!reviewId && !revisionOpen} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {canReview ? "Review Submission" : "Submission Details"}
                        </DialogTitle>
                        <DialogDescription>
                            {canReview
                                ? "Review the submitted document and approve or request a revision."
                                : "View the submission details"}
                        </DialogDescription>
                    </DialogHeader>

                    {detailLoading && (
                        <div className="flex justify-center py-10">
                            <Loader className="animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {detail && (
                        <div className="space-y-4 text-sm">
                            {/* Status + code */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={statusClass[detail.status] || "bg-gray-100"}>
                                    {detail.status}
                                </Badge>
                                <span className="font-mono text-xs text-muted-foreground">
                                    {detail.submission_code}
                                </span>
                            </div>

                            <Separator />

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <DetailRow icon={FileText} label="Document" value={detail.document_name} />
                                <DetailRow icon={User}     label="Teacher"  value={detail.teacher?.name} />
                                <DetailRow icon={Hash}     label="Request Code" value={detail.request_code} />
                                <DetailRow icon={Clock}    label="Submitted"    value={fmt(detail.submitted_at)} />
                                {detail.reviewed_at && (
                                    <DetailRow icon={CalendarDays} label="Reviewed" value={fmt(detail.reviewed_at)} />
                                )}
                                {detail.approved_at && (
                                    <DetailRow icon={CheckCircle2} label="Approved" value={fmt(detail.approved_at)} />
                                )}
                                <DetailRow
                                    icon={RefreshCw}
                                    label="Revisions"
                                    value={String(detail.revision_count ?? 0)}
                                />
                            </div>

                            {/* Revision note */}
                            {detail.revision_note && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                    <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Last Revision Note
                                    </p>
                                    <p className="text-amber-800 whitespace-pre-wrap text-xs">
                                        {detail.revision_note}
                                    </p>
                                </div>
                            )}

                            {/* Attached file */}
                            {detail.original_name ? (
                                <div className="rounded-md border border-border bg-muted/30 p-3">
                                    <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-2">
                                        Submitted Document
                                    </p>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{detail.original_name}</p>
                                            {detail.formatted_size && (
                                                <p className="text-xs text-muted-foreground">{detail.formatted_size}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                                    No document attached to this submission.
                                </div>
                            )}

                            {/* Version history */}
                            {detail.versions?.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Submission History
                                    </p>
                                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                                        {detail.versions.map((v) => (
                                            <li key={v.version_number} className="flex items-start gap-1.5">
                                                <span className="shrink-0 font-medium text-foreground">
                                                    v{v.version_number}
                                                </span>
                                                <span>— {v.status}</span>
                                                {v.submitted_at && (
                                                    <span>· {fmt(v.submitted_at)}</span>
                                                )}
                                                {v.revision_note && (
                                                    <span className="italic">— "{v.revision_note}"</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer actions — only for reviewable statuses */}
                    {detail && canReview && (
                        <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap">
                            <Button
                                variant="outline"
                                onClick={() => setRevisionOpen(true)}
                                disabled={revisionMutation.isPending}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Request Revision
                            </Button>
                            <Button
                                onClick={() => approveMutation.mutate(detail.id)}
                                disabled={approveMutation.isPending}
                            >
                                {approveMutation.isPending
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <CheckCircle2 className="h-4 w-4" />
                                }
                                Approve
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Revision Note Dialog ──────────────────────────────────── */}
            <Dialog open={revisionOpen} onOpenChange={(open) => { if (!open) { setRevisionOpen(false); setRevisionNote(""); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Request Revision</DialogTitle>
                        <DialogDescription>
                            Provide a clear note explaining what the teacher needs to correct.
                        </DialogDescription>
                    </DialogHeader>
                    <Field>
                        <Textarea
                            placeholder="Please correct the learner's date of birth information on page 2 and resubmit."
                            value={revisionNote}
                            onChange={(e) => setRevisionNote(e.target.value)}
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                            {revisionNote.length}/1000
                        </p>
                    </Field>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => { setRevisionOpen(false); setRevisionNote(""); }}
                            disabled={revisionMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={revisionNote.trim().length < 5 || revisionMutation.isPending}
                            onClick={() => revisionMutation.mutate({ id: reviewId, note: revisionNote.trim() })}
                        >
                            {revisionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Send Revision Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubmissionApprovalTable;
