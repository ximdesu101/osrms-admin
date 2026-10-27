import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
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
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Eye,
    Loader,
    DatabaseX,
    SearchAlert,
    Ban,
    Plus
} from "lucide-react";
import {
    GetSubmissionRequests,
    CancelSubmissionRequest,
} from "@/services/submissionRequestService";

const statusVariant = {
    Draft: "outline",
    Requested: "secondary",
    Acknowledged: "default",
    Submitted: "default",
    Overdue: "destructive",
    Cancelled: "outline",
};

const statusClassName = {
    Draft: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    Requested: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Submitted: "bg-green-100 text-green-800 hover:bg-green-100",
    Overdue: "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
};

const SubmissionRequestTable = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["submission-requests", { page, search, status }],
        queryFn: () => GetSubmissionRequests({ page, search, status }),
        placeholderData: keepPreviousData,
    });

    const requests = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;

    const cancelMutation = useMutation({
        mutationFn: CancelSubmissionRequest,
        onSuccess: (res) => {
            toast.success(res?.message || "Submission request cancelled successfully.");
            queryClient.invalidateQueries({ queryKey: ["submission-requests"] });
            queryClient.invalidateQueries({ queryKey: ["submission-request-metrics"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-calendar-events"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to cancel submission request."
            );
        },
    });

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="grid gap-2">
            {/* Tabs and Search */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Tabs value={status} onValueChange={handleStatusChange}>
                    <TabsList>
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Requested">Requested</TabsTrigger>
                        <TabsTrigger value="Acknowledged">Acknowledged</TabsTrigger>
                        <TabsTrigger value="Submitted">Submitted</TabsTrigger>
                        <TabsTrigger value="Overdue">Overdue</TabsTrigger>
                        <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex gap-4">
                    <Field className="w-full max-w-sm">
                        <InputGroup>
                            <InputGroupInput
                                id="search"
                                placeholder="Search submission requests"
                                value={search}
                                onChange={(event) =>
                                    handleSearchChange(event.target.value)
                                }
                            />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                    <Button onClick={() => navigate("/submission-requests/create")}>
                        <Plus />
                        Create Request
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Request ID</TableHead>
                            <TableHead className="text-white">Teacher</TableHead>
                            <TableHead className="text-white">Requested Documents</TableHead>
                            <TableHead className="text-white">Requested Date</TableHead>
                            <TableHead className="text-white">Due Date</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading submission requests...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-destructive">
                                    <DatabaseX className="mx-auto" />
                                    Failed to load submission requests.
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.request_code}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{request.teacher?.name ?? "—"}</span>
                                            {request.teacher?.teacher_id && (
                                                <span className="text-muted-foreground text-xs">
                                                    {request.teacher.teacher_id}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.document_name}</TableCell>
                                    <TableCell>{formatDate(request.request_date)}</TableCell>
                                    <TableCell>{formatDate(request.due_date)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={statusVariant[request.status] || "secondary"}
                                            className={statusClassName[request.status] || ""}
                                        >
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {(request.status === "Requested" ||
                                                request.status === "Acknowledged" ||
                                                request.status === "Overdue") && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Cancel Request"
                                                                disabled={cancelMutation.isPending}
                                                            >
                                                                <Ban className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Cancel submission request?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will mark request{" "}
                                                                    <strong>{request.request_code}</strong> as
                                                                    Cancelled. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Keep request</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        cancelMutation.mutate(request.id)
                                                                    }
                                                                >
                                                                    Cancel request
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="View Submission Request"
                                            >
                                                <Eye />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground"
                                >
                                    <SearchAlert className="mx-auto" />
                                    No submission requests found.
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

                                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            isActive={p === currentPage}
                                            className="cursor-pointer"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        className={
                                            currentPage >= lastPage
                                                ? "pointer-events-none opacity-50"
                                                : "cursor-pointer"
                                        }
                                        onClick={() =>
                                            currentPage < lastPage && setPage(currentPage + 1)
                                        }
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionRequestTable;