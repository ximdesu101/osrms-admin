import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    DatabaseX,
    SearchAlert,
    CheckCircle2,
    AlertCircle,
    Upload,
    Download,
} from "lucide-react";
import {
    GetDocumentRequests,
    GetDocumentRequest,
    AcknowledgeDocumentRequest,
    MarkDocumentRequestProcessing,
    FulfillDocumentRequest,
    MarkDocumentRequestUnavailable,
    DownloadDocumentRequest,
} from "@/services/documentRequestService";

const statusClassName = {
    Pending:      "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Processing:   "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Fulfilled:    "bg-green-100 text-green-800 hover:bg-green-100",
    Unavailable:  "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled:    "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const STATUSES = ["All", "Pending", "Acknowledged", "Processing", "Fulfilled", "Unavailable"];

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
};

const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return format(new Date(value), "MMM d, yyyy h:mm a");
    } catch {
        return "—";
    }
};

const DocumentRequestTable = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    // Fulfill dialog state
    const [fulfillOpen, setFulfillOpen] = useState(false);
    const [fulfillFile, setFulfillFile] = useState(null);
    const [fulfillMessage, setFulfillMessage] = useState("");

    // Unavailable dialog state
    const [unavailableOpen, setUnavailableOpen] = useState(false);
    const [unavailableMessage, setUnavailableMessage] = useState("");

    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["document-requests", { page, search, status }],
        queryFn: () => GetDocumentRequests({ page, search, status }),
        placeholderData: keepPreviousData,
    });

    const { data: detailData, isLoading: detailLoading } = useQuery({
        queryKey: ["document-request", selectedId],
        queryFn: () => GetDocumentRequest(selectedId),
        enabled: !!selectedId,
    });

    const requests = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;
    const detail = detailData?.request;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["document-requests"] });
        queryClient.invalidateQueries({ queryKey: ["document-request-metrics"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
        if (selectedId) {
            queryClient.invalidateQueries({ queryKey: ["document-request", selectedId] });
        }
    };

    const acknowledgeMutation = useMutation({
        mutationFn: AcknowledgeDocumentRequest,
        onSuccess: (res) => { toast.success(res?.message || "Request acknowledged."); invalidate(); },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to acknowledge."),
    });

    const processingMutation = useMutation({
        mutationFn: MarkDocumentRequestProcessing,
        onSuccess: (res) => { toast.success(res?.message || "Marked as processing."); invalidate(); },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update status."),
    });

    const fulfillMutation = useMutation({
        mutationFn: ({ id, file, message }) => FulfillDocumentRequest(id, file, message),
        onSuccess: (res) => {
            toast.success(res?.message || "Request fulfilled.");
            setFulfillOpen(false);
            setFulfillFile(null);
            setFulfillMessage("");
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to fulfill request."),
    });

    const unavailableMutation = useMutation({
        mutationFn: ({ id, message }) => MarkDocumentRequestUnavailable(id, message),
        onSuccess: (res) => {
            toast.success(res?.message || "Marked as unavailable.");
            setUnavailableOpen(false);
            setUnavailableMessage("");
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to mark unavailable."),
    });

    const handleSearchChange = (value) => { setSearch(value); setPage(1); };
    const handleStatusChange = (value) => { setStatus(value); setPage(1); };

    const openDetail = (id) => setSelectedId(id);
    const closeDetail = () => { setSelectedId(null); setFulfillOpen(false); setUnavailableOpen(false); };

    const canProcess = detail && !["Fulfilled", "Cancelled"].includes(detail.status);

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Tabs value={status} onValueChange={handleStatusChange}>
                    <TabsList className="flex-wrap">
                        {STATUSES.map((s) => (
                            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <Field className="w-full max-w-sm">
                    <InputGroup>
                        <InputGroupInput
                            id="search"
                            placeholder="Search document requests..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </Field>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Request ID</TableHead>
                            <TableHead className="text-white">Teacher</TableHead>
                            <TableHead className="text-white">Document</TableHead>
                            <TableHead className="text-white">Requested Date</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading document requests...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-destructive">
                                    <DatabaseX className="mx-auto" />
                                    Failed to load document requests.
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.request_code}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{req.teacher?.name ?? "—"}</span>
                                            {req.teacher?.teacher_id && (
                                                <span className="text-muted-foreground text-xs">{req.teacher.teacher_id}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{req.document_name}</TableCell>
                                    <TableCell>{formatDate(req.request_date)}</TableCell>
                                    <TableCell>
                                        <Badge className={statusClassName[req.status] || ""}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Review Request"
                                                onClick={() => openDetail(req.id)}
                                            >
                                                <Eye />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    <SearchAlert className="mx-auto" />
                                    No document requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Separator />

                <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                        <span className="font-medium text-foreground">{lastPage}</span>
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink isActive={p === currentPage} className="cursor-pointer" onClick={() => setPage(p)}>
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className={currentPage >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => currentPage < lastPage && setPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Review Dialog */}
            <Dialog open={!!selectedId && !fulfillOpen && !unavailableOpen} onOpenChange={(open) => !open && closeDetail()}>
                <DialogContent className="!w-[90vw] !max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Review Document Request</DialogTitle>
                        <DialogDescription>
                            Review the teacher's request and take the appropriate action.
                        </DialogDescription>
                    </DialogHeader>

                    {detailLoading && (
                        <div className="flex justify-center">
                            <Loader className="animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {detail && (
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Badge className={statusClassName[detail.status] || ""}>
                                    {detail.status}
                                </Badge>
                                <span className="text-muted-foreground text-xs">{detail.request_code}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-muted-foreground">Teacher</p>
                                    <p className="font-medium">{detail.teacher?.name ?? "—"}</p>
                                    {detail.teacher?.teacher_id && (
                                        <p className="text-xs text-muted-foreground">{detail.teacher.teacher_id}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Document</p>
                                    <p className="font-medium">{detail.document_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Requested On</p>
                                    <p className="font-medium">{formatDateTime(detail.created_at)}</p>
                                </div>
                                {detail.acknowledged_at && (
                                    <div>
                                        <p className="text-muted-foreground">Acknowledged</p>
                                        <p className="font-medium">{formatDateTime(detail.acknowledged_at)}</p>
                                    </div>
                                )}
                                {detail.fulfilled_at && (
                                    <div>
                                        <p className="text-muted-foreground">Fulfilled</p>
                                        <p className="font-medium">{formatDateTime(detail.fulfilled_at)}</p>
                                    </div>
                                )}
                                {detail.purpose && (
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Purpose</p>
                                        <p className="font-medium whitespace-normal">{detail.purpose}</p>
                                    </div>
                                )}
                            </div>

                            {detail.admin_message && (
                                <div className="rounded-md border border-border bg-muted/30 p-3">
                                    <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-1">
                                        Previous Admin Message
                                    </p>
                                    <p className="whitespace-normal">{detail.admin_message}</p>
                                </div>
                            )}

                            {detail.status === "Fulfilled" && detail.file && (
                                <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                    <p className="text-xs uppercase tracking-wide font-medium text-green-700 mb-2">
                                        Fulfilled Document
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium truncate">{detail.file.original_name}</p>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={DownloadDocumentRequest(detail.id)} download={detail.file.original_name} target="_blank" rel="noreferrer">
                                                <Download className="h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {detail && canProcess && (
                        <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap">
                            {detail.status === "Pending" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={acknowledgeMutation.isPending}
                                    onClick={() => acknowledgeMutation.mutate(detail.id)}
                                >
                                    {acknowledgeMutation.isPending && <Loader2 className="animate-spin" />}
                                    Acknowledge
                                </Button>
                            )}
                            {(detail.status === "Pending" || detail.status === "Acknowledged") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={processingMutation.isPending}
                                    onClick={() => processingMutation.mutate(detail.id)}
                                >
                                    {processingMutation.isPending && <Loader2 className="animate-spin" />}
                                    Mark Processing
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                onClick={() => setUnavailableOpen(true)}
                            >
                                <AlertCircle className="h-4 w-4" />
                                Mark Unavailable
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setFulfillOpen(true)}
                            >
                                <Upload className="h-4 w-4" />
                                Fulfill Request
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Fulfill Dialog */}
            <Dialog open={fulfillOpen} onOpenChange={(open) => { if (!open) { setFulfillOpen(false); setFulfillFile(null); setFulfillMessage(""); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Fulfill Document Request</DialogTitle>
                        <DialogDescription>
                            Upload the requested document for{" "}
                            <strong>{detail?.teacher?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Field>
                            <Label htmlFor="fulfill-file">Document File <span className="text-destructive">*</span></Label>
                            <input
                                id="fulfill-file"
                                type="file"
                                accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
                                onChange={(e) => setFulfillFile(e.target.files?.[0] ?? null)}
                            />
                            <p className="text-xs text-muted-foreground">Allowed: PDF, Excel, Word, images. Max 10 MB.</p>
                        </Field>
                        <Field>
                            <Label htmlFor="fulfill-message">Message <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Textarea
                                id="fulfill-message"
                                placeholder="Add a note for the teacher..."
                                value={fulfillMessage}
                                onChange={(e) => setFulfillMessage(e.target.value)}
                                maxLength={1000}
                                rows={3}
                            />
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setFulfillOpen(false); setFulfillFile(null); setFulfillMessage(""); }} disabled={fulfillMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!fulfillFile || fulfillMutation.isPending}
                            onClick={() => fulfillMutation.mutate({ id: detail.id, file: fulfillFile, message: fulfillMessage.trim() || undefined })}
                        >
                            {fulfillMutation.isPending && <Loader2 className="animate-spin" />}
                            Send Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unavailable Dialog */}
            <Dialog open={unavailableOpen} onOpenChange={(open) => { if (!open) { setUnavailableOpen(false); setUnavailableMessage(""); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Mark as Unavailable</DialogTitle>
                        <DialogDescription>
                            Inform <strong>{detail?.teacher?.name}</strong> that the requested document is currently unavailable.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <Field>
                            <Label htmlFor="unavailable-message">Message <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="unavailable-message"
                                placeholder="The document you requested is currently unavailable. We will notify you once it becomes available."
                                value={unavailableMessage}
                                onChange={(e) => setUnavailableMessage(e.target.value)}
                                maxLength={1000}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground text-right">{unavailableMessage.length}/1000</p>
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setUnavailableOpen(false); setUnavailableMessage(""); }} disabled={unavailableMutation.isPending}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={unavailableMessage.trim().length < 5 || unavailableMutation.isPending}
                            onClick={() => unavailableMutation.mutate({ id: detail.id, message: unavailableMessage.trim() })}
                        >
                            {unavailableMutation.isPending && <Loader2 className="animate-spin" />}
                            Mark Unavailable
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocumentRequestTable;
