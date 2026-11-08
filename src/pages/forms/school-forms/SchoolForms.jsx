import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {
    BadgeCheck,
    CalendarDays,
    File,
    FileStack,
    Loader2,
    MoreVertical,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Hash,
    Type,
} from "lucide-react";

import campus from "@/assets/sf-icons/campus.png";
import attendance from "@/assets/sf-icons/attendance.png";
import book from "@/assets/sf-icons/book.png";
import calendar from "@/assets/sf-icons/calendar.png";
import promotion from "@/assets/sf-icons/promotion.png";
import summary from "@/assets/sf-icons/summary.png";
import users from "@/assets/sf-icons/users.png";
import health from "@/assets/sf-icons/health.png";
import clipboard from "@/assets/sf-icons/clipboard.png";
import academic from "@/assets/sf-icons/academic.png";

import {
    GetSchoolFormsSummary,
    GetFormCards,
    CreateFormCard,
    UpdateFormCard,
    CheckFormCardDeletion,
    DeleteFormCard,
} from "@/services/templateService";

// ─── Icon lookup ──────────────────────────────────────────────────────────────
const SF_ICON_MAP = {
    campus, attendance, book, calendar, promotion,
    summary, users, health, clipboard, academic,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isAdmin = () => localStorage.getItem("auth_role") === "admin";

// ─── Card ─────────────────────────────────────────────────────────────────────
function SchoolFormCard({ card, onOpen, metrics, loading, onEdit, onDelete }) {
    const fileCount     = metrics?.approved_count ?? 0;
    const templateCount = metrics?.template_count ?? 0;
    const dateLabel     = metrics?.last_updated   || null;
    const iconSrc       = SF_ICON_MAP[card.icon_name] ?? null;
    const adminMode     = isAdmin();

    const handleCardClick = (e) => {
        if (e.target.closest("[data-slot='dropdown-menu-trigger']")) return;
        onOpen(card.code.toLowerCase());
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(card.code.toLowerCase()); }
    };

    return (
        <Card
            role="button"
            tabIndex={0}
            className="relative cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e963f]"
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
        >
            {adminMode && (
                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Card options">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(card); }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(card); }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <CardHeader className={`flex flex-row items-start gap-3 space-y-0 ${adminMode ? "pr-10" : ""}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    {iconSrc
                        ? <img src={iconSrc} alt="" className="h-7 w-7 object-contain" />
                        : <FileStack className="h-6 w-6 text-[#3e963f]" />
                    }
                </div>
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold">{card.code}</CardTitle>
                    <CardDescription>{card.name}</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {card.description || "No description provided."}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <File className="h-4 w-4" />
                        {loading ? "…" : `${fileCount} file${fileCount !== 1 ? "s" : ""}`}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileStack className="h-4 w-4" />
                        {loading ? "…" : `${templateCount} template${templateCount !== 1 ? "s" : ""}`}
                    </span>
                    <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {loading ? "…" : dateLabel || "No template"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Add / Edit Dialog ────────────────────────────────────────────────────────
const EMPTY_FORM = { code: "", name: "", description: "" };

function FormCardDialog({ open, onOpenChange, initial, onSave }) {
    const [form, setForm]     = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const isEditing           = !!initial;

    useEffect(() => {
        if (open) {
            setForm(initial
                ? { code: initial.code, name: initial.name, description: initial.description || "" }
                : EMPTY_FORM
            );
            setErrors({});
        }
    }, [open, initial]);

    const validate = () => {
        const e = {};
        if (!form.code.trim()) e.code = "Code is required.";
        else if (!/^[A-Za-z0-9_-]+$/.test(form.code))
            e.code = "Only letters, numbers, hyphens, and underscores allowed.";
        if (!form.name.trim()) e.name = "Name is required.";
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try {
            await onSave({
                code:        form.code.trim().toUpperCase(),
                name:        form.name.trim(),
                description: form.description.trim(),
                category:    "school_forms",
            });
            onOpenChange(false);
        } catch (err) {
            const apiErrors = err.response?.data?.errors ?? {};
            const mapped = {};
            if (apiErrors.code) mapped.code = apiErrors.code[0];
            if (apiErrors.name) mapped.name = apiErrors.name[0];
            if (Object.keys(mapped).length) {
                setErrors(mapped);
            } else {
                const msg = err.response?.data?.message;
                if (msg) setErrors({ code: msg });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit School Form Card" : "Add School Form Card"}
                    </DialogTitle>
                </DialogHeader>

                <FieldGroup>
                    {/* Form Code */}
                    <Field>
                        <FieldLabel>
                            Form Code <span className="text-destructive">*</span>
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                value={form.code}
                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                placeholder="e.g. SF11"
                                disabled={isEditing}
                                aria-invalid={!!errors.code}
                            />
                            <InputGroupAddon align="inline-end">
                                <Hash />
                            </InputGroupAddon>
                        </InputGroup>
                        {errors.code
                            ? <FieldError>{errors.code}</FieldError>
                            : isEditing && <FieldDescription>Form code cannot be changed after creation.</FieldDescription>
                        }
                    </Field>

                    {/* Name */}
                    <Field>
                        <FieldLabel>
                            Name <span className="text-destructive">*</span>
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Supplementary Record"
                                aria-invalid={!!errors.name}
                            />
                            <InputGroupAddon align="inline-end">
                                <Type />
                            </InputGroupAddon>
                        </InputGroup>
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>

                    {/* Description */}
                    <Field>
                        <FieldLabel>Description</FieldLabel>
                        <InputGroup>
                            <InputGroupTextarea
                                value={form.description}
                                onChange={(e) => {
                                    if (e.target.value.length <= 300)
                                        setForm((f) => ({ ...f, description: e.target.value }));
                                }}
                                placeholder="Brief description of this form (optional)"
                                maxLength={300}
                                rows={3}
                            />
                        </InputGroup>
                        <FieldDescription className="text-right">
                            {form.description.length}/300
                        </FieldDescription>
                    </Field>
                </FieldGroup>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Save Changes" : "Add Card"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
const SchoolForms = () => {
    const navigate = useNavigate();

    const [summaryMap,     setSummaryMap]     = useState({});
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [cards,          setCards]          = useState([]);
    const [cardsLoading,   setCardsLoading]   = useState(true);

    const [dialogOpen,   setDialogOpen]   = useState(false);
    const [editingCard,  setEditingCard]  = useState(null);

    const [deleteTarget,   setDeleteTarget]   = useState(null);
    const [deleteCheck,    setDeleteCheck]    = useState(null);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [blockAlertOpen,  setBlockAlertOpen]  = useState(false);
    const [deleting,       setDeleting]       = useState(false);

    const loadSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const data = await GetSchoolFormsSummary();
            const map  = {};
            (data?.forms || []).forEach((item) => { map[item.form_code] = item; });
            setSummaryMap(map);
        } catch (err) {
            console.error("Failed to load school forms summary:", err);
        } finally {
            setSummaryLoading(false);
        }
    }, []);

    const loadCards = useCallback(async () => {
        setCardsLoading(true);
        try {
            const data = await GetFormCards("school_forms");
            setCards(data);
        } catch (err) {
            console.error("Failed to load school form cards:", err);
            setCards([]);
        } finally {
            setCardsLoading(false);
        }
    }, []);

    useEffect(() => { loadSummary(); loadCards(); }, [loadSummary, loadCards]);

    const openForm = (path) => navigate(`/school-forms/${path}`);

    const handleAddNew = () => { setEditingCard(null); setDialogOpen(true); };
    const handleEdit   = (card) => { setEditingCard(card); setDialogOpen(true); };

    const handleSave = async (payload) => {
        if (editingCard) {
            const result = await UpdateFormCard(editingCard.id, payload);
            setCards((prev) => prev.map((c) => (c.id === editingCard.id ? result.form_card : c)));
        } else {
            const result = await CreateFormCard(payload);
            setCards((prev) => [...prev, result.form_card]);
        }
        loadSummary();
    };

    const handleDeleteRequest = async (card) => {
        setDeleteTarget(card);
        try {
            const check = await CheckFormCardDeletion(card.id);
            setDeleteCheck(check);
            check.can_delete ? setDeleteAlertOpen(true) : setBlockAlertOpen(true);
        } catch (err) {
            console.error("Deletion check failed:", err);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await DeleteFormCard(deleteTarget.id);
            setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            setDeleteAlertOpen(false);
            setDeleteTarget(null);
            setDeleteCheck(null);
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteAlertOpen(false);
        setBlockAlertOpen(false);
        setDeleteTarget(null);
        setDeleteCheck(null);
    };

    const adminMode = isAdmin();

    return (
        <div className="grid gap-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-semibold tracking-tight">School Forms</h2>
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            <BadgeCheck className="mr-1 h-3 w-3" />
                            Official
                        </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Official DepEd Form of Tagnao Elementary School
                    </p>
                </div>
                {adminMode && (
                    <Button size="sm" onClick={handleAddNew}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add New
                    </Button>
                )}
            </div>

            {/* Cards */}
            {cardsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading forms…
                </div>
            ) : cards.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No forms found.</p>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <SchoolFormCard
                            key={card.id}
                            card={card}
                            onOpen={openForm}
                            metrics={summaryMap[card.code]}
                            loading={summaryLoading}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                        />
                    ))}
                </div>
            )}

            {summaryLoading && !cardsLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading form metrics…
                </div>
            )}

            {/* Add / Edit dialog */}
            <FormCardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initial={editingCard}
                onSave={handleSave}
            />

            {/* Confirm delete */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form Card</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the <strong>{deleteTarget?.code}</strong> card?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete} disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Block delete */}
            <AlertDialog open={blockAlertOpen} onOpenChange={setBlockAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <AlertTriangle className="text-destructive" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Cannot Delete Card</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div>
                                <p>Cannot delete this card because it still contains associated content.</p>
                                <ul className="mt-3 space-y-1 text-sm">
                                    <li><span className="font-medium">Files:</span> {deleteCheck?.file_count ?? 0}</li>
                                    <li><span className="font-medium">Templates:</span> {deleteCheck?.template_count ?? 0}</li>
                                </ul>
                                <p className="mt-3">
                                    Please manually delete all associated files and templates before deleting this card.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete}>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SchoolForms;
