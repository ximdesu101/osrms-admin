import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Ellipsis,
    Loader,
    DatabaseX,
    SearchAlert,
    Send,
    Trash2
} from "lucide-react";
import {
    GetSubmissionRequests,
    UpdateSubmissionRequest,
    CancelSubmissionRequest,
} from "@/services/submissionRequestService";

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
};

const Draft = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sendTarget, setSendTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["submission-drafts", { page, search }],
        queryFn: () => GetSubmissionRequests({ page, search, status: "Draft" }),
        placeholderData: keepPreviousData,
    });

    const drafts = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;

    const sendMutation = useMutation({
        mutationFn: (draft) =>
            UpdateSubmissionRequest(draft.id, {
                isDraft: false,
                dueDate: draft.due_date,
                notes: draft.notes ?? undefined,
                documentCode: draft.document_code,
                teacherId: draft.teacher?.id,
            }),
        onSuccess: (res) => {
            toast.success(res?.message || "Submission request sent successfully.");
            setSendTarget(null);
            queryClient.invalidateQueries({ queryKey: ["submission-drafts"] });
            queryClient.invalidateQueries({ queryKey: ["submission-requests"] });
            queryClient.invalidateQueries({ queryKey: ["submission-request-metrics"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-calendar-events"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to send submission request."
            );
        },
    });

    const cancelMutation = useMutation({
        mutationFn: CancelSubmissionRequest,
        onSuccess: (res) => {
            toast.success(res?.message || "Draft cancelled successfully.");
            setCancelTarget(null);
            queryClient.invalidateQueries({ queryKey: ["submission-drafts"] });
            queryClient.invalidateQueries({ queryKey: ["submission-request-metrics"] });
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to cancel draft."
            );
        },
    });

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                {/* Search Section */}
                <div className="flex items-center justify-between">
                    <InputGroup className="w-80">
                        <InputGroupInput
                            id="search"
                            placeholder="Search drafts..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                {/* Table Section */}
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-[#00601c]">
                            <TableRow className="hover:bg-[#00601c]">
                                <TableHead className="text-white">Request ID</TableHead>
                                <TableHead className="text-white">Teacher</TableHead>
                                <TableHead className="text-white">Document</TableHead>
                                <TableHead className="text-white">Requested Date</TableHead>
                                <TableHead className="text-white">Due Date</TableHead>
                                <TableHead className="text-right text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground"
                                    >
                                        <Loader className="mx-auto animate-spin" />
                                        Loading drafts...
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-destructive"
                                    >
                                        <DatabaseX className="mx-auto" />
                                        Failed to load drafts.
                                    </TableCell>
                                </TableRow>
                            ) : drafts.length > 0 ? (
                                drafts.map((draft) => (
                                    <TableRow key={draft.id}>
                                        <TableCell>{draft.request_code}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{draft.teacher?.name ?? "—"}</span>
                                                {draft.teacher?.teacher_id && (
                                                    <span className="text-muted-foreground text-xs">
                                                        {draft.teacher.teacher_id}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{draft.document_name}</TableCell>
                                        <TableCell>{formatDate(draft.request_date)}</TableCell>
                                        <TableCell>{formatDate(draft.due_date)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => setSendTarget(draft)}
                                                    >
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Request
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setCancelTarget(draft)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Cancel Draft
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground"
                                    >
                                        <SearchAlert className="mx-auto" />
                                        No drafts found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Separator />

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                            <span className="font-medium text-foreground">{lastPage}</span>
                        </p>
                        <div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            className={
                                                currentPage <= 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                            onClick={() =>
                                                currentPage > 1 && setPage(currentPage - 1)
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: lastPage }, (_, i) => i + 1).map(
                                        (p) => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === currentPage}
                                                    className="cursor-pointer"
                                                    onClick={() => setPage(p)}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            className={
                                                currentPage >= lastPage
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                            onClick={() =>
                                                currentPage < lastPage &&
                                                setPage(currentPage + 1)
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send draft confirmation */}
            <AlertDialog
                open={!!sendTarget}
                onOpenChange={(open) => !open && setSendTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send submission request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will send draft{" "}
                            <strong>{sendTarget?.request_code}</strong> to{" "}
                            {sendTarget?.teacher?.name ?? "the teacher"} as a submission
                            request. A due date is required.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep as draft</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={sendMutation.isPending || !sendTarget?.due_date}
                            onClick={() => sendTarget && sendMutation.mutate(sendTarget)}
                        >
                            {sendMutation.isPending ? "Sending…" : "Send request"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel draft confirmation */}
            <AlertDialog
                open={!!cancelTarget}
                onOpenChange={(open) => !open && setCancelTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel draft?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will cancel draft{" "}
                            <strong>{cancelTarget?.request_code}</strong>. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep draft</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={cancelMutation.isPending}
                            onClick={() =>
                                cancelTarget && cancelMutation.mutate(cancelTarget.id)
                            }
                        >
                            {cancelMutation.isPending ? "Cancelling…" : "Cancel draft"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Draft;