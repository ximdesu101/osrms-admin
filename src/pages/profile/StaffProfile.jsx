import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
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
    UserRound,
    IdCardLanyard,
    UserStar,
    SquarePen,
    Loader2,
    CircleCheck,
} from "lucide-react";
import api from "@/lib/axios";

const SUFFIXES = ["none", "Jr.", "Sr.", "II", "III", "IV", "V"];

const required = (label) => ({ value }) =>
    !value ? `${label} is required` : undefined;

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-2 py-1.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
            {value || <span className="text-muted-foreground italic">—</span>}
        </span>
    </div>
);

const UpdateStaffProfile = async (payload) => {
    const response = await api.put("/staff/profile", payload);
    return response.data;
};

/* ── Edit Profile Dialog ─────────────────────────────────────────── */
const EditProfileDialog = ({ user, onSaved }) => {
    const [open, setOpen] = useState(false);

    const updateMutation = useMutation({
        mutationFn: UpdateStaffProfile,
        onSuccess: (data) => {
            const updated = data.staff;
            localStorage.setItem("staff", JSON.stringify(updated));
            toast.success("Profile updated successfully.");
            setOpen(false);
            if (onSaved) onSaved(updated);
        },
        onError: (err) => {
            if (err.response?.status === 422 && err.response.data?.errors) {
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    form.setFieldMeta(key, (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: messages[0] },
                    }));
                });
                return;
            }
            toast.error(err.response?.data?.message || "Failed to update profile.");
        },
    });

    const form = useForm({
        defaultValues: {
            firstName:  user?.first_name  ?? "",
            middleName: user?.middle_name ?? "",
            lastName:   user?.last_name   ?? "",
            suffix:     user?.suffix      ?? "none",
        },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync(value);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <SquarePen className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Separator />
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        {/* First + Middle Name */}
                        <FieldGroup className="grid grid-cols-2">
                            <form.Field
                                name="firstName"
                                validators={{ onChange: required("First name") }}
                            >
                                {(field) => (
                                    <Field>
                                        <FieldLabel>First Name</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Juan"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon>
                                                <UserRound />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {field.state.meta.errors.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                            <form.Field name="middleName">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Optional"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon>
                                                <UserRound />
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        {/* Last Name + Suffix */}
                        <FieldGroup className="grid grid-cols-3">
                            <div className="col-span-2">
                                <form.Field
                                    name="lastName"
                                    validators={{ onChange: required("Last name") }}
                                >
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Last Name</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="Dela Cruz"
                                                    value={field.state.value}
                                                    onChange={(e) =>
                                                        field.handleChange(e.target.value)
                                                    }
                                                    onBlur={field.handleBlur}
                                                />
                                                <InputGroupAddon>
                                                    <UserRound />
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {field.state.meta.errors.length > 0 && (
                                                <FieldDescription className="text-destructive">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )}
                                </form.Field>
                            </div>
                            <form.Field name="suffix">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Suffix</FieldLabel>
                                        <Select
                                            value={field.state.value || "none"}
                                            onValueChange={(v) => field.handleChange(v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {SUFFIXES.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {s === "none" ? "None" : s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <form.Subscribe
                            selector={(state) => [state.canSubmit, state.isSubmitting]}
                        >
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={
                                        !canSubmit ||
                                        isSubmitting ||
                                        updateMutation.isPending
                                    }
                                >
                                    {isSubmitting || updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

/* ── Staff Profile Page ───────────────────────────────────────────── */
const StaffProfile = () => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("staff") || "null");
        } catch {
            return null;
        }
    });

    const handleSaved = (updated) => {
        setUser(updated);
    };

    if (!user) {
        return (
            <div className="text-sm text-muted-foreground">
                Unable to load profile. Please refresh.
            </div>
        );
    }

    const fullName = [user.first_name, user.middle_name, user.last_name, user.suffix]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="grid gap-6 max-w-2xl">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-lg font-semibold">My Profile</h1>
                    <p className="text-sm text-muted-foreground">
                        View and update your personal information.
                    </p>
                </div>
                <EditProfileDialog user={user} onSaved={handleSaved} />
            </div>

            <Separator />

            {/* Personal Information */}
            <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <UserRound className="h-3 w-3" /> Personal Information
                </p>
                <div className="rounded-md border px-4">
                    <InfoRow label="Full Name"   value={fullName} />
                    <Separator />
                    <InfoRow label="First Name"  value={user.first_name} />
                    <Separator />
                    <InfoRow label="Middle Name" value={user.middle_name} />
                    <Separator />
                    <InfoRow label="Last Name"   value={user.last_name} />
                    <Separator />
                    <InfoRow label="Suffix"      value={user.suffix} />
                </div>
            </div>

            {/* Account Information */}
            <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <IdCardLanyard className="h-3 w-3" /> Account Information
                </p>
                <div className="rounded-md border px-4">
                    <InfoRow label="Staff ID"  value={user.staff_id} />
                    <Separator />
                    <InfoRow label="Username"  value={user.username} />
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 py-1.5 text-sm">
                        <span className="text-muted-foreground">Account Status</span>
                        <span className="flex items-center gap-1.5 font-medium capitalize">
                            <CircleCheck
                                className={
                                    user.status === "active"
                                        ? "h-4 w-4 text-green-600"
                                        : "h-4 w-4 text-muted-foreground"
                                }
                            />
                            {user.status}
                        </span>
                    </div>
                    <Separator />
                    <InfoRow
                        label="Activated"
                        value={
                            user.activated_at
                                ? new Date(user.activated_at).toLocaleDateString()
                                : null
                        }
                    />
                </div>
            </div>

            {/* Employment Information */}
            <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <UserStar className="h-3 w-3" /> Employment
                </p>
                <div className="rounded-md border px-4">
                    <InfoRow label="Position" value={user.position} />
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
