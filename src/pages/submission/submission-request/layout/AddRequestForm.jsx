import * as React from "react";
import { cn, capitalizeFirstLetter } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";           
import { Skeleton } from "@/components/ui/skeleton";     
import { ScrollArea } from "@/components/ui/scroll-area";                               
import { toast } from "sonner";                                               
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
    FieldGroup,
} from "@/components/ui/field";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    InputGroup,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty";
import {
    Users,
    Loader2,
    Send,
    Save,
    X,
    CalendarIcon,
    FileText,
    UserX,
    AlertCircle,
} from "lucide-react";
import {
    CreateSubmissionRequest,
    GetActiveTeachers,
} from "@/services/submissionRequestService";

const schoolForms = [
    { value: "sf1", label: "School Form 1" },
    { value: "sf2", label: "School Form 2" },
    { value: "sf3", label: "School Form 3" },
    { value: "sf4", label: "School Form 4" },
    { value: "sf5", label: "School Form 5" },
    { value: "sf6", label: "School Form 6" },
    { value: "sf7", label: "School Form 7" },
    { value: "sf8", label: "School Form 8" },
    { value: "sf9", label: "School Form 9" },
    { value: "sf10", label: "School Form 10" },
];

const administrativeForms = [
    { value: "dtr", label: "Biometrics and DTR" },
    { value: "acr", label: "Activity Completion Report" },
    { value: "dpds", label: "DepEd Partnership Database System" },
    { value: "to", label: "Travel Order" },
    { value: "lf", label: "Leave Form" },
    { value: "so", label: "Special Order" },
    { value: "snsed", label: "National Simulation Earthquake Drill" },
    { value: "transmittal", label: "Transmittal" },
    { value: "sbfp", label: "SBFP – School-Based Feeding Program" },
];

const allDocuments = [...schoolForms, ...administrativeForms];

const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const AddRequestForm = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [date, setDate] = React.useState(undefined);
    const [document, setDocument] = useState("");
    const [note, setNote] = useState("");
    const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
    const [errors, setErrors] = useState({});

    const {
        data: teachersData,
        isLoading: teachersLoading,
        isError: teachersError,
        refetch: refetchTeachers,
    } = useQuery({
        queryKey: ["active-teachers"],
        queryFn: () => GetActiveTeachers(),
    });

    const teachers = teachersData?.data ?? [];

    const selectedTeachers = useMemo(
        () => teachers.filter((t) => selectedTeacherIds.includes(t.id)),
        [teachers, selectedTeacherIds]
    );

    const documentLabel =
        allDocuments.find((f) => f.value === document)?.label ?? "—";

    const toggleTeacher = (id) => {
        setSelectedTeacherIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
        setErrors((prev) => {
            if (!prev.teacherIds) return prev;
            const next = { ...prev };
            delete next.teacherIds;
            return next;
        });
    };

    const removeTeacher = (id) => {
        setSelectedTeacherIds((prev) => prev.filter((t) => t !== id));
    };

    const clearErrors = () => setErrors({});

    const validate = (isDraft) => {
        const next = {};
        if (selectedTeacherIds.length === 0) {
            next.teacherIds = "Select at least one teacher account.";
        }
        if (!document) {
            next.documentCode = "Select a document.";
        }
        if (!isDraft && !date) {
            next.dueDate = "Due date is required when sending a request.";
        }
        if (note && note.length > 300) {
            next.notes = "Notes must be 300 characters or fewer.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const buildPayload = (isDraft) => ({
        teacherIds: selectedTeacherIds,
        documentCode: document,
        dueDate: date ? format(date, "yyyy-MM-dd") : undefined,
        notes: note?.trim() ? note.trim() : null,
        isDraft,
    });

    const createMutation = useMutation({
        mutationFn: CreateSubmissionRequest,
        onSuccess: (res, variables) => {
            toast.success(res?.message || (variables.isDraft ? "Draft saved." : "Request sent."));
            queryClient.invalidateQueries({ queryKey: ["submission-requests"] });
            queryClient.invalidateQueries({ queryKey: ["submission-request-metrics"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-calendar-events"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
            navigate("/submission-requests");
        },
        onError: (err) => {
            const data = err.response?.data;
            if (err.response?.status === 422 && data?.errors) {
                const mapped = {};
                Object.entries(data.errors).forEach(([key, messages]) => {
                    const msg = Array.isArray(messages) ? messages[0] : messages;
                    if (key === "teacherIds" || key.startsWith("teacherIds.")) {
                        mapped.teacherIds = msg;
                    } else if (key === "documentCode") {
                        mapped.documentCode = msg;
                    } else if (key === "dueDate") {
                        mapped.dueDate = msg;
                    } else if (key === "notes") {
                        mapped.notes = msg;
                    }
                });
                setErrors((prev) => ({ ...prev, ...mapped }));
                toast.error(data.message || "Validation failed.");
                return;
            }
            toast.error(data?.message || "Failed to process request. Please try again.");
        },
    });

    const isSubmitting = createMutation.isPending;

    const handleSaveDraft = () => {
        clearErrors();
        if (!validate(true)) return;
        createMutation.mutate(buildPayload(true));
    };

    const handleSend = () => {
        clearErrors();
        if (!validate(false)) return;
        createMutation.mutate(buildPayload(false));
    };

    const canProceedDetails = selectedTeacherIds.length > 0;

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="bg-secondary">
                    <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                        {/* Step 1 — Select Teacher(s) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="size-4" />
                                    Who to send?
                                </CardTitle>
                                <CardDescription>
                                    Select one or more registered teacher accounts before continuing.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                {teachersLoading ? (
                                    <div className="grid gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3 rounded-md border p-3">
                                                <Skeleton className="size-10 rounded-full" />
                                                <div className="grid flex-1 gap-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : teachersError ? (
                                    <Empty className="border border-dashed py-8">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <AlertCircle className="text-destructive" />
                                            </EmptyMedia>
                                            <EmptyTitle>Failed to load teachers</EmptyTitle>
                                            <EmptyDescription>
                                                Could not fetch registered teacher accounts. Please try again.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <Button variant="outline" size="sm" onClick={() => refetchTeachers()}>
                                            Retry
                                        </Button>
                                    </Empty>
                                ) : teachers.length === 0 ? (
                                    <Empty className="border border-dashed py-8">
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <UserX />
                                            </EmptyMedia>
                                            <EmptyTitle>No registered teacher accounts</EmptyTitle>
                                            <EmptyDescription>
                                                There are currently no active registered teacher accounts available.
                                                Register a teacher account before creating a submission request.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <ScrollArea className="h-[320px] pr-2">
                                        <div className="grid gap-2">
                                            {teachers.map((teacher) => {
                                                const checked = selectedTeacherIds.includes(teacher.id);
                                                return (
                                                    <FieldLabel key={teacher.id} className="cursor-pointer">
                                                        <Field
                                                            orientation="horizontal"
                                                            className={cn(
                                                                "rounded-md border-2 border-transparent p-2 transition-colors",
                                                                "has-[[data-state=checked]]:border-green-500 has-[[data-state=checked]]:bg-green-50"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                id={`teacher-${teacher.id}`}
                                                                checked={checked}
                                                                onCheckedChange={() => toggleTeacher(teacher.id)}
                                                                className="hidden"
                                                            />
                                                            <Avatar className="my-auto">
                                                                <AvatarImage src={undefined} />
                                                                <AvatarFallback>
                                                                    {getInitials(teacher.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <FieldContent>
                                                                <FieldTitle>{teacher.name}</FieldTitle>
                                                                <FieldDescription className="text-xs">
                                                                    {teacher.teacher_id}
                                                                    {teacher.class_advisory
                                                                        ? ` • ${teacher.class_advisory}`
                                                                        : teacher.position
                                                                            ? ` • ${teacher.position}`
                                                                            : ""}
                                                                </FieldDescription>
                                                            </FieldContent>
                                                        </Field>
                                                    </FieldLabel>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                )}
                                {errors.teacherIds && (
                                    <p className="text-sm text-destructive">{errors.teacherIds}</p>
                                )}
                                {selectedTeachers.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {selectedTeachers.map((t) => (
                                            <Badge
                                                key={t.id}
                                                variant="secondary"
                                                className="gap-1 pr-1"
                                            >
                                                {t.name}
                                                <button
                                                    type="button"
                                                    className="rounded-full p-0.5 hover:bg-muted"
                                                    onClick={() => removeTeacher(t.id)}
                                                    aria-label={`Remove ${t.name}`}
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2 — Request Details */}
                        <Card className={cn(!canProceedDetails && "opacity-60")}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="size-4" />
                                    Request Details
                                </CardTitle>
                                <CardDescription>
                                    {canProceedDetails
                                        ? "Select the document and set the due date."
                                        : "Select at least one teacher to continue."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FieldGroup>
                                    <Field data-invalid={!!errors.documentCode}>
                                        <FieldLabel>Select Document</FieldLabel>
                                        <Select
                                            value={document}
                                            onValueChange={(v) => {
                                                setDocument(v);
                                                setErrors((prev) => {
                                                    if (!prev.documentCode) return prev;
                                                    const next = { ...prev };
                                                    delete next.documentCode;
                                                    return next;
                                                });
                                            }}
                                            disabled={!canProceedDetails || isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Document" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    <SelectLabel>School Forms</SelectLabel>
                                                    {schoolForms.map((form) => (
                                                        <SelectItem key={form.value} value={form.value}>
                                                            {form.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                                <SelectGroup>
                                                    <SelectLabel>Administrative Forms</SelectLabel>
                                                    {administrativeForms.map((form) => (
                                                        <SelectItem key={form.value} value={form.value}>
                                                            {form.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.documentCode && (
                                            <p className="text-sm text-destructive">{errors.documentCode}</p>
                                        )}
                                    </Field>
                                    <Field data-invalid={!!errors.dueDate}>
                                        <FieldLabel>Due Date</FieldLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    id="date-picker"
                                                    type="button"
                                                    disabled={!canProceedDetails || isSubmitting}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 size-4" />
                                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={(d) => {
                                                        setDate(d);
                                                        setErrors((prev) => {
                                                            if (!prev.dueDate) return prev;
                                                            const next = { ...prev };
                                                            delete next.dueDate;
                                                            return next;
                                                        });
                                                    }}
                                                    disabled={(d) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        return d < today;
                                                    }}
                                                    defaultMonth={date}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.dueDate && (
                                            <p className="text-sm text-destructive">{errors.dueDate}</p>
                                        )}
                                    </Field>
                                    <Field data-invalid={!!errors.notes}>
                                        <FieldLabel>Instructions / Notes</FieldLabel>
                                        <InputGroup>
                                            <InputGroupTextarea
                                                id="note"
                                                placeholder="Write request instructions or notes..."
                                                value={note}
                                                onChange={(e) => setNote(capitalizeFirstLetter(e.target.value))}
                                                disabled={!canProceedDetails || isSubmitting}
                                                maxLength={300}
                                            />
                                        </InputGroup>
                                        <FieldDescription className="text-xs">
                                            {note.length}/300 characters
                                        </FieldDescription>
                                        {errors.notes && (
                                            <p className="text-sm text-destructive">{errors.notes}</p>
                                        )}
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>

            {/* Step 3 — Request Breakdown */}
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle>Request Breakdown</CardTitle>
                    <CardDescription>
                        Review before saving sending the request.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <div className="grid gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Recipients
                        </span>
                        {selectedTeachers.length === 0 ? (
                            <span className="text-muted-foreground">None selected</span>
                        ) : (
                            <div className="grid gap-1">
                                <span className="font-medium">
                                    {selectedTeachers.length} teacher
                                    {selectedTeachers.length === 1 ? "" : "s"} selected
                                </span>
                                <ul className="max-h-28 space-y-0.5 overflow-y-auto text-muted-foreground">
                                    {selectedTeachers.map((t) => (
                                        <li key={t.id} className="truncate text-xs">
                                            {t.name}
                                            {t.teacher_id ? ` (${t.teacher_id})` : ""}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Document
                        </span>
                        <span>{documentLabel}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Due Date
                        </span>
                        <span>{date ? format(date, "PPP") : "—"}</span>
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Instructions
                        </span>
                        <span className={cn("whitespace-pre-wrap", !note && "text-muted-foreground")}>
                            {note?.trim() || "No instructions added."}
                        </span>
                    </div>
                    <div className="grid gap-2 pt-2">
                        <Button
                            className="w-full"
                            type="button"
                            onClick={handleSend}
                            disabled={isSubmitting || teachers.length === 0}
                        >
                            {isSubmitting && !createMutation.variables?.isDraft ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send />
                                    Send Request
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting || teachers.length === 0}
                        >
                            {isSubmitting && createMutation.variables?.isDraft ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save />
                                    Save Draft
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate("/submission-requests")}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddRequestForm;