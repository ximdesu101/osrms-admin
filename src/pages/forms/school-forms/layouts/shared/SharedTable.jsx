import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    GetApprovedDocumentsByForm,
    DownloadDocumentSubmission,
} from "@/services/documentSubmissionService";
import {              
    Search,           
    SearchX,          
    Download,         
    Loader,          
    FileText,         
    MoreHorizontal,   
    RotateCcw,        
    Trash2,           
} from "lucide-react";
import {
    GetTemplates,
    ActivateTemplate,
    DeleteTemplate,
} from "@/services/templateService";

const SharedTable = ({
    formCode,
    formName,
    onCountChange,
    onTemplateCountChange,
    onTemplateActivated,
}) => {
    const [activeTab, setActiveTab] = useState("approved");

    // --- Approved documents state ---
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10,
    });

    // --- Templates state ---
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [activatingId, setActivatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadDocuments = useCallback(async () => {
        if (!formCode) {
            setLoading(false);
            setDocuments([]);
            onCountChange?.(0);
            return;
        }

        setLoading(true);
        try {
            const data = await GetApprovedDocumentsByForm({
                formCode,
                page,
                search: search.trim(),
            });

            const items = Array.isArray(data?.data) ? data.data : [];
            setDocuments(items);
            setMeta({
                current_page: data?.current_page ?? 1,
                last_page: data?.last_page ?? 1,
                total: data?.total ?? 0,
                per_page: data?.per_page ?? 10,
            });
            onCountChange?.(data?.total ?? 0);
        } catch (err) {
            console.error("Failed to load approved documents:", err);
            toast.error("Failed to load approved documents.");
            setDocuments([]);
            onCountChange?.(0);
        } finally {
            setLoading(false);
        }
    }, [formCode, page, search, onCountChange]);

    const loadTemplates = useCallback(async () => {
        if (!formCode) {
            setTemplates([]);
            onTemplateCountChange?.(0);
            return;
        }
        setTemplatesLoading(true);
        try {
            const list = await GetTemplates(formCode);
            const arr = Array.isArray(list) ? list : [];
            setTemplates(arr);
            onTemplateCountChange?.(arr.length);
        } catch (err) {
            console.error("Failed to load templates:", err);
            toast.error("Failed to load templates.");
            setTemplates([]);
            onTemplateCountChange?.(0);
        } finally {
            setTemplatesLoading(false);
        }
    }, [formCode, onTemplateCountChange]);

    useEffect(() => {
        if (activeTab === "approved") {
            loadDocuments();
        }
    }, [loadDocuments, activeTab]);

    // Always load templates so the Templates count card stays accurate
    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // Debounce search (approved only)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleDownload = async (doc) => {
        if (!doc?.id || downloadingId) return;
        setDownloadingId(doc.id);
        try {
            const response = await DownloadDocumentSubmission(doc.id);
            const blob = new Blob([response.data], {
                type:
                    response.headers?.["content-type"] ||
                    "application/octet-stream",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = doc.original_name || `${formCode}_document`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Download started.");
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Failed to download document.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleActivate = async (template) => {
        if (!template?.id || activatingId || template.status === "current") {
            return;
        }
        setActivatingId(template.id);
        try {
            const result = await ActivateTemplate(formCode, template.id);
            toast.success(result?.message || "Template set as current.");
            await loadTemplates();
            if (result?.template) {
                onTemplateActivated?.(result.template);
            }
        } catch (err) {
            console.error("Activate failed:", err);
            toast.error(
                err.response?.data?.message || "Failed to activate template."
            );
        } finally {
            setActivatingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget?.id || deletingId) return;
        const id = deleteTarget.id;
        setDeletingId(id);
        try {
            await DeleteTemplate(formCode, id);
            toast.success("Template deleted successfully.");
            setDeleteTarget(null);
            await loadTemplates();
            const list = await GetTemplates(formCode);
            const current =
                (Array.isArray(list) ? list : []).find(
                    (t) => t.status === "current"
                ) || null;
            onTemplateActivated?.(current);
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(
                err.response?.data?.message || "Failed to delete template."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const totalPages = Math.max(1, meta.last_page || 1);
    const pageNumbers = [];
    const start = Math.max(1, meta.current_page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                {/* Search / Tabs Section */}
                <div className="flex items-center justify-between">
                    <Field>
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <TabsList>
                                <TabsTrigger
                                    value="approved"
                                    className="data-[state=active]:bg-[#3e963f] data-[state=active]:text-white"
                                >
                                    Approved File
                                </TabsTrigger>
                                <TabsTrigger
                                    value="templates"
                                    className="data-[state=active]:bg-[#3e963f] data-[state=active]:text-white"
                                >
                                    Templates
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </Field>
                    {activeTab === "approved" && (
                        <InputGroup className="w-80">
                            <InputGroupInput
                                id="search"
                                placeholder="Search approved documents..."
                                value={searchInput}
                                onChange={(e) =>
                                    setSearchInput(e.target.value)
                                }
                            />
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>
                    )}
                </div>

                {/* Approved Files Tab Content */}
                {activeTab === "approved" && (
                    <>
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader className="bg-[#00601c]">
                                    <TableRow className="hover:bg-[#00601c]">
                                        <TableHead className="text-white">Document Name</TableHead>
                                        <TableHead className="text-white">Teacher</TableHead>
                                        <TableHead className="text-white">Submission Code</TableHead>
                                        <TableHead className="text-white">Submitted</TableHead>
                                        <TableHead className="text-white">Approved</TableHead>
                                        <TableHead className="text-white">File Size</TableHead>
                                        <TableHead className="text-white">Status</TableHead>
                                        <TableHead className="text-white text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground"
                                            >
                                                <Loader className="mx-auto animate-spin" />
                                                Loading approved documents...
                                            </TableCell>
                                        </TableRow>
                                    ) : documents.length > 0 ? (
                                        documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="truncate max-w-[220px]" title={doc.original_name}>
                                                            {doc.original_name || "—"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {doc.teacher?.name || "—"}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {doc.submission_code || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(doc.submitted_at) || doc.submitted_date || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(doc.approved_at)}
                                                </TableCell>
                                                <TableCell>
                                                    {doc.formatted_size || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                                                        {doc.status || "Approved"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={downloadingId === doc.id}
                                                        onClick={() => handleDownload(doc)}
                                                    >
                                                        {downloadingId === doc.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                        <span className="ml-1.5">Download</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground"
                                            >
                                                <SearchX className="mx-auto" />
                                                No approved documents found for
                                                this form.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Separator />

                            <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {meta.total > 0
                                        ? `Page ${meta.current_page} of ${totalPages}`
                                        : "No results"}
                                </div>
                                <div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        setPage((p) =>
                                                            Math.max(1, p - 1)
                                                        )
                                                    }
                                                    className={
                                                        meta.current_page <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                            {pageNumbers.map((n) => (
                                                <PaginationItem key={n}>
                                                    <PaginationLink
                                                        isActive={
                                                            n ===
                                                            meta.current_page
                                                        }
                                                        onClick={() =>
                                                            setPage(n)
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        {n}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        setPage((p) =>
                                                            Math.min(
                                                                totalPages,
                                                                p + 1
                                                            )
                                                        )
                                                    }
                                                    className={
                                                        meta.current_page >=
                                                        totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Templates Tab Content */}
                {activeTab === "templates" && (
                    <div className="overflow-hidden rounded-md border">
                        <Table>
                            <TableHeader className="bg-[#00601c]">
                                <TableRow className="hover:bg-[#00601c]">
                                    <TableHead className="text-white">
                                        Template Name
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Document Type
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Upload Date
                                    </TableHead>
                                    <TableHead className="text-white">
                                        File Size
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-white text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templatesLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            <Loader className="mx-auto animate-spin" />
                                            Loading templates...
                                        </TableCell>
                                    </TableRow>
                                ) : templates.length > 0 ? (
                                    templates.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    {t.original_name || "—"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                Excel Spreadsheet
                                            </TableCell>
                                            <TableCell>
                                                {t.upload_date ||
                                                    formatDate(t.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {t.file_size_formatted || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {t.status === "current" ? (
                                                    <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                                                        Current
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                                                        Archived
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            aria-label={`Actions for ${t.original_name || "template"}`}
                                                            disabled={
                                                                activatingId === t.id ||
                                                                deletingId === t.id
                                                            }
                                                        >
                                                            {(activatingId === t.id ||
                                                                deletingId === t.id) ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="z-50 min-w-[180px]"
                                                    >
                                                        {t.status === "archived" && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleActivate(t)
                                                                }
                                                                disabled={activatingId === t.id}
                                                            >
                                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                                Use as Template
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setDeleteTarget(t)
                                                            }
                                                            disabled={deletingId === t.id}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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
                                            <SearchX className="mx-auto" />
                                            No templates uploaded for this form
                                            yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <AlertDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !deletingId) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget
                                ? `This will permanently delete "${deleteTarget.original_name || "this template"}". This action cannot be undone.`
                                : "This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={Boolean(deletingId)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteConfirm();
                            }}
                            disabled={Boolean(deletingId)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SharedTable;