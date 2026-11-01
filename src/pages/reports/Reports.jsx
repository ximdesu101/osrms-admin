import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Field, FieldLabel } from "@/components/ui/field";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    UserCog,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    RefreshCw,
    Search,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
} from "recharts";
import { toast } from "sonner";
import {
    GetReportAnalytics,
    GetReportTable,
    GetReportMeta,
    ExportReport,
} from "@/services/reportService";
import { format } from "date-fns";

const STATUS_COLORS = {
    Pending: "#f59e0b",
    Acknowledged: "#3b82f6",
    Processing: "#8b5cf6",
    Fulfilled: "#22c55e",
    Unavailable: "#ef4444",
    Cancelled: "#6b7280",
};

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const Reports = () => {
    const [preset, setPreset] = useState("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [reportType, setReportType] = useState("document_requests");
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportType, setExportType] = useState("document_requests");
    const [exportFormat, setExportFormat] = useState("xlsx");
    const [exporting, setExporting] = useState(false);

    const dateParams = useMemo(() => {
        const p = { preset };
        if (preset === "custom") {
            if (from) p.from = from;
            if (to) p.to = to;
        }
        return p;
    }, [preset, from, to]);

    const { data: meta } = useQuery({
        queryKey: ["report-meta"],
        queryFn: GetReportMeta,
        staleTime: 300_000,
    });

    const {
        data: analytics,
        isLoading: analyticsLoading,
        isError: analyticsError,
        refetch: refetchAnalytics,
    } = useQuery({
        queryKey: ["report-analytics", dateParams],
        queryFn: () => GetReportAnalytics(dateParams),
        staleTime: 30_000,
    });

    const tableParams = useMemo(
        () => ({
            type: reportType,
            page,
            per_page: 15,
            status: statusFilter !== "All" ? statusFilter : undefined,
            search: search || undefined,
            ...dateParams,
        }),
        [reportType, page, statusFilter, search, dateParams]
    );

    const {
        data: tableData,
        isLoading: tableLoading,
        isError: tableError,
        refetch: refetchTable,
    } = useQuery({
        queryKey: ["report-table", tableParams],
        queryFn: () => GetReportTable(tableParams),
        staleTime: 20_000,
        enabled: reportType !== "summary",
    });

    const metrics = analytics?.metrics;
    const charts = analytics?.charts;

    const periodLabel = useMemo(() => {
        if (preset === "all") return "All Time";
        if (preset === "custom" && (from || to)) {
            return `${from || "…"} – ${to || "…"}`;
        }
        return meta?.presets?.find((p) => p.id === preset)?.label || preset;
    }, [preset, from, to, meta]);

    const handleRefresh = useCallback(() => {
        refetchAnalytics();
        refetchTable();
        toast.success("Report data refreshed");
    }, [refetchAnalytics, refetchTable]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const payload = {
                report_type: exportType,
                format: exportFormat,
                include_summary: true,
                ...dateParams,
                status: statusFilter !== "All" ? statusFilter : undefined,
                search: search || undefined,
            };
            const response = await ExportReport(payload);
            const contentType = response.headers["content-type"] || "";
            let ext = exportFormat;
            if (contentType.includes("pdf")) ext = "pdf";
            else if (contentType.includes("word") || contentType.includes("document")) ext = "docx";
            else if (contentType.includes("sheet") || contentType.includes("excel")) ext = "xlsx";

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Tagnao_Report_${exportType}_${format(new Date(), "yyyyMMdd_HHmmss")}.${ext}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Report downloaded successfully");
            setExportOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to generate report. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    const summaryCards = [
        {
            title: "Total Teachers",
            value: metrics?.teachers?.total ?? 0,
            sub: `${metrics?.teachers?.active ?? 0} active`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/40",
        },
        {
            title: "Total Staff",
            value: metrics?.staff?.total ?? 0,
            sub: `${metrics?.staff?.active ?? 0} active`,
            icon: UserCog,
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-950/40",
        },
        {
            title: "School Records",
            value: metrics?.school_records?.total ?? 0,
            sub: `${metrics?.school_records?.current ?? 0} current`,
            icon: FileText,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
        },
        {
            title: "Pending Requests",
            value: metrics?.document_requests?.pending ?? 0,
            sub: "Awaiting action",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/40",
        },
        {
            title: "Completed",
            value: metrics?.document_requests?.fulfilled ?? 0,
            sub: "Fulfilled",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/40",
        },
        {
            title: "Unavailable",
            value: metrics?.document_requests?.unavailable ?? 0,
            sub: "Not available",
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-950/40",
        },
    ];

    const tableColumns = useMemo(() => {
        const map = {
            teachers: ["employee_id", "full_name", "username", "position", "status", "created_at"],
            staff: ["employee_id", "full_name", "username", "position", "status", "created_at"],
            school_records: ["form_code", "original_name", "status", "file_size", "created_at"],
            document_requests: ["request_code", "document_name", "teacher_name", "status", "created_at", "fulfilled_at"],
            pending_unavailable: ["request_code", "document_name", "teacher_name", "status", "created_at"],
            fulfillment: ["request_code", "document_name", "teacher_name", "created_at", "fulfilled_at", "duration_hours"],
            activity: ["actor_name", "actor_role", "action", "category", "status", "created_at"],
        };
        return map[reportType] || map.document_requests;
    }, [reportType]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Period: <strong className="text-foreground">{periodLabel}</strong></span>
                        {analytics?.generated_at && (
                            <span className="hidden sm:inline">
                                · Updated {format(new Date(analytics.generated_at), "MMM d, yyyy h:mm a")}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setExportOpen(true)}>
                        <Download className="h-4 w-4 mr-1.5" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-3 justify-between">
                        <div className="flex gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Reporting Period</Label>
                                <Select value={preset} onValueChange={(v) => { setPreset(v); setPage(1); }}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {(meta?.presets || []).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {preset === "custom" && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">From</Label>
                                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">To</Label>
                                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
                                    </div>
                                </>
                            )}
                            <div className="space-y-1.5">
                                <Label className="text-xs">Report Category</Label>
                                <Select value={reportType} onValueChange={(v) => { setReportType(v); setPage(1); setStatusFilter("All"); }}>
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        {(meta?.report_types || [])
                                            .filter((t) => t.id !== "summary")
                                            .map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {(reportType === "document_requests" || reportType === "pending_unavailable") && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Status</Label>
                                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="All">All</SelectItem>
                                            {(meta?.document_statuses || []).map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Search</Label>
                            <InputGroup>
                                <InputGroupInput
                                    placeholder="Search…"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                                <InputGroupAddon><Search /></InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {analyticsLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="p-4">
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-8 w-12" />
                        </Card>
                    ))
                    : summaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                                        <p className="text-2xl font-bold mt-1 tabular-nums">{card.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                                    </div>
                                    <div className={`rounded-lg p-2 ${card.bg}`}>
                                        <Icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4" />
                            Request Status Distribution
                        </CardTitle>
                        <CardDescription>Document request statuses for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <Skeleton className="h-[260px] w-full" />
                        ) : charts?.status_distribution?.some((d) => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={charts.status_distribution.filter((d) => d.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {charts.status_distribution.map((entry, i) => (
                                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                                No request data for this period
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Most Requested Documents
                        </CardTitle>
                        <CardDescription>Top document types by request volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <Skeleton className="h-[260px] w-full" />
                        ) : charts?.most_requested?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={charts.most_requested} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                                No request data for this period
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Document Request Trends</CardTitle>
                        <CardDescription>Request volume over the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analyticsLoading ? (
                            <Skeleton className="h-[240px] w-full" />
                        ) : charts?.request_trends?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={charts.request_trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Requests" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                                No trend data for this period
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Report Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                        {(meta?.report_types || []).find((t) => t.id === reportType)?.label || "Report"}
                    </CardTitle>
                    <CardDescription>
                        {tableData?.total != null
                            ? `${tableData.total} record${tableData.total === 1 ? "" : "s"} found`
                            : "Detailed records matching current filters"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tableLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : tableError || analyticsError ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Failed to load report data. Please try refreshing.
                        </div>
                    ) : !tableData?.data?.length ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No records match the selected filters. Try adjusting the period or search.
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {tableColumns.map((col) => (
                                                <TableHead key={col} className="whitespace-nowrap">
                                                    {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tableData.data.map((row) => (
                                            <TableRow key={row.id}>
                                                {tableColumns.map((col) => (
                                                    <TableCell key={col} className="whitespace-nowrap text-sm">
                                                        {col === "status" ? (
                                                            <Badge variant="outline" className="font-normal">
                                                                {row[col]}
                                                            </Badge>
                                                        ) : (
                                                            row[col] ?? "—"
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination */}
                            {tableData.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4 text-sm">
                                    <span className="text-muted-foreground">
                                        Page {tableData.current_page} of {tableData.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={tableData.current_page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={tableData.current_page >= tableData.last_page}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Export Dialog */}
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Report</DialogTitle>
                        <DialogDescription>
                            Choose the report type and file format. The current period and filters will be applied.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Select value={exportType} onValueChange={setExportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(meta?.report_types || []).map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>File Format</Label>
                            <div className="grid gap-2">
                                {(meta?.export_formats || [
                                    { id: "pdf", label: "PDF", extension: ".pdf", description: "Print-ready document" },
                                    { id: "docx", label: "Word", extension: ".docx", description: "Editable Microsoft Word document" },
                                    { id: "xlsx", label: "Excel", extension: ".xlsx", description: "Spreadsheet with filters" },
                                ]).map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setExportFormat(f.id)}
                                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${exportFormat === f.id
                                            ? "border-primary bg-primary/5"
                                            : "hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center">
                                            {exportFormat === f.id && (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">
                                                {f.label} <span className="text-muted-foreground font-normal">{f.extension}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{f.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Period: <strong>{periodLabel}</strong>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportOpen(false)} disabled={exporting}>
                            Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={exporting}>
                            {exporting ? "Generating…" : "Download"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Reports;