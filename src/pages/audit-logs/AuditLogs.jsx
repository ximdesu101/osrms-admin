import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Field } from "@/components/ui/field";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Search,
    Loader,
    DatabaseX,
    SearchAlert,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import { GetAuditLogs, GetAuditLogMeta } from "@/services/auditLogService";

const CATEGORIES = [
    "All",
    "Authentication",
    "User Management",
    "Document Requests",
    "Submission Requests",
    "School Forms",
    "System",
];

function formatDate(iso) {
    if (!iso) return "—";
    try {
        return format(new Date(iso), "MMM d, yyyy h:mm a");
    } catch {
        return iso;
    }
}

function RoleBadge({ role }) {
    if (role === "Admin") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Admin
            </span>
        );
    }
    if (role === "Teacher") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                Teacher
            </span>
        );
    }
    return <span className="text-muted-foreground text-xs">—</span>;
}

function StatusBadge({ status }) {
    if (status === "success") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <ShieldCheck className="h-3 w-3" />
                Success
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
            <ShieldAlert className="h-3 w-3" />
            Failed
        </span>
    );
}

/* ─── main component ──────────────────────────────────────── */

const AuditLogs = () => {
    const [role, setRole] = useState("All");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["audit-logs", { role, search, category, status, page }],
        queryFn: () =>
            GetAuditLogs({ role, search, category, status, page, per_page: 20 }),
        staleTime: 15_000,
    });

    const logs = data?.data ?? [];
    const lastPage = Math.max(1, data?.last_page ?? 1);
    const currentPage = data?.current_page ?? page;
    const total = data?.total ?? 0;

    /* Reset to page 1 whenever a filter changes */
    const handleRoleChange = (value) => {
        setRole(value);
        setPage(1);
    };
    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };
    const handleCategoryChange = (value) => {
        setCategory(value);
        setPage(1);
    };
    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* ── Header row ─────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
                {/* Role tabs */}
                <Tabs value={role} onValueChange={handleRoleChange}>
                    <TabsList>
                        <TabsTrigger value="All">All Activities</TabsTrigger>
                        <TabsTrigger value="Admin">Admin</TabsTrigger>
                        <TabsTrigger value="Teacher">Teacher</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Filters + search */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Category filter */}
                    <Select value={category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="h-9 w-[180px] text-sm">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat === "All" ? "All Categories" : cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter */}
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-9 w-[140px] text-sm">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search */}
                    <Field className="w-full sm:w-auto">
                        <InputGroup>
                            <InputGroupInput
                                id="audit-search"
                                placeholder="Search by user…"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 text-sm"
                            />
                            <InputGroupAddon>
                                <Search className="h-4 w-4" />
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────── */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white whitespace-nowrap">Date & Time</TableHead>
                            <TableHead className="text-white">User</TableHead>
                            <TableHead className="text-white">Role</TableHead>
                            <TableHead className="text-white">Activity</TableHead>
                            <TableHead className="text-white">Category</TableHead>
                            <TableHead className="text-white">Reference</TableHead>
                            <TableHead className="text-white text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading audit logs…
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-destructive">
                                    <DatabaseX className="mx-auto mb-2" />
                                    Failed to load audit logs. Please try again.
                                </TableCell>
                            </TableRow>
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                        {formatDate(log.created_at)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {log.actor_name ?? (
                                            <span className="text-muted-foreground text-xs italic">
                                                Unknown
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadge role={log.actor_role} />
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="text-sm leading-snug truncate">{log.description}</p>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                            {log.category}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                        {log.subject_label ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={log.status} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    <SearchAlert className="mx-auto" />
                                    No audit log entries found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Separator />

                {/* ── Pagination ─────────────────────────────── */}
                <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {total > 0 ? (
                            <>
                                Page{" "}
                                <span className="font-medium text-foreground">{currentPage}</span>{" "}
                                of{" "}
                                <span className="font-medium text-foreground">{lastPage}</span>
                                {" "}·{" "}
                                <span className="font-medium text-foreground">{total}</span> entries
                            </>
                        ) : (
                            "No entries"
                        )}
                    </p>

                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={
                                        currentPage <= 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                    onClick={() => currentPage > 1 && setPage(currentPage - 1)}
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
                                    onClick={() => currentPage < lastPage && setPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
