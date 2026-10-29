import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Send,
    IdCardLanyard,
    UserPen,
    UserStar,
    ArrowBigUpDash,
    GraduationCap,
    SquarePen,
    Loader2,
} from "lucide-react";
import { 
    input_class, 
    icon_class 
} from "@/components/common/constant";
import { UpdateStaff } from "@/services/staffService";

const required = (label) => ({ value }) => (!value ? `${label} is required` : undefined);

const EditAccountForm = ({ staff }) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: UpdateStaff,
        onSuccess: () => {
            toast.success("Staff account updated successfully.");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["staffs"] });
            queryClient.invalidateQueries({ queryKey: ["staff-metrics"] });
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
            toast.error(err.response?.data?.message || "Failed to update staff account.");
        },
    });

    const form = useForm({
        defaultValues: {
            staffId:     staff.staff_id    ?? "",
            firstName:     staff.first_name    ?? "",
            middleName:    staff.middle_name   ?? "",
            lastName:      staff.last_name     ?? "",
            suffix:        staff.suffix        ?? "none",
            username:      staff.username      ?? "",
            position:      staff.position      ?? "",
            position: staff.class_advisory ?? "",
        },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync({ id: staff.id, ...value });
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <SquarePen />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Staff Account</DialogTitle>
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
                        {/* Employee ID */}
                        <form.Field name="staffId" validators={{ onChange: required("Employee ID") }}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>Employee ID</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="26-0001"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        <InputGroupAddon><IdCardLanyard /></InputGroupAddon>
                                    </InputGroup>
                                    {field.state.meta.errors.length > 0 && (
                                        <FieldDescription className="text-destructive">
                                            {field.state.meta.errors[0]}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>

                        {/* First + Middle Name */}
                        <FieldGroup className="grid grid-cols-2">
                            <form.Field name="firstName" validators={{ onChange: required("First name") }}>
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
                                            <InputGroupAddon><UserPen /></InputGroupAddon>
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
                                                placeholder="Ted (Optional)"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><UserPen /></InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        {/* Last Name + Suffix */}
                        <FieldGroup className="grid grid-cols-3">
                            <div className="col-span-2">
                                <form.Field name="lastName" validators={{ onChange: required("Last name") }}>
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Last Name</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="Dela Cruz"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                />
                                                <InputGroupAddon><UserPen /></InputGroupAddon>
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
                                        <div className="relative">
                                            <div className={icon_class}>
                                                <UserPen className="w-4.5 h-4.5" />
                                            </div>
                                            <Select value={field.state.value} onValueChange={field.handleChange}>
                                                <SelectTrigger className={input_class}>
                                                    <SelectValue placeholder="Select Suffix" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    <SelectGroup>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                                        <SelectItem value="II">II</SelectItem>
                                                        <SelectItem value="III">III</SelectItem>
                                                        <SelectItem value="IV">IV</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        {/* Username */}
                        <form.Field name="username" validators={{ onChange: required("Username") }}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>Username</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="Juan.DelaCruz"
                                            autoComplete="off"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        <InputGroupAddon><UserStar /></InputGroupAddon>
                                    </InputGroup>
                                    {field.state.meta.errors.length > 0 && (
                                        <FieldDescription className="text-destructive">
                                            {field.state.meta.errors[0]}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>

                        {/* Position + Position */}
                        <FieldGroup className="grid grid-cols-2">
                            <form.Field name="position" validators={{ onChange: required("Position") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Position</FieldLabel>
                                        <div className="relative">
                                            <div className={icon_class}>
                                                <ArrowBigUpDash className="w-4.5 h-4.5" />
                                            </div>
                                            <Select value={field.state.value} onValueChange={field.handleChange}>
                                                <SelectTrigger className={input_class}>
                                                    <SelectValue placeholder="Select Position" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    <SelectGroup>
                                                        <SelectItem value="Staff I">Staff I</SelectItem>
                                                        <SelectItem value="Staff II">Staff II</SelectItem>
                                                        <SelectItem value="Staff III">Staff III</SelectItem>
                                                        <SelectItem value="Staff IV">Staff IV</SelectItem>
                                                        <SelectItem value="Staff V">Staff V</SelectItem>
                                                        <SelectItem value="Staff VI">Staff VI</SelectItem>
                                                        <SelectItem value="Staff VII">Staff VII</SelectItem>
                                                        <SelectItem value="Master Staff I">Master Staff I</SelectItem>
                                                        <SelectItem value="Master Staff II">Master Staff II</SelectItem>
                                                        <SelectItem value="Master Staff III">Master Staff III</SelectItem>
                                                        <SelectItem value="Master Staff IV">Master Staff IV</SelectItem>
                                                        <SelectItem value="Master Staff V">Master Staff V</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {field.state.meta.errors.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                            <form.Field name="position" validators={{ onChange: required("Class advisory") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Position</FieldLabel>
                                        <div className="relative">
                                            <div className={icon_class}>
                                                <GraduationCap className="w-4.5 h-4.5" />
                                            </div>
                                            <Select value={field.state.value} onValueChange={field.handleChange}>
                                                <SelectTrigger className={input_class}>
                                                    <SelectValue placeholder="Select Position" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    <SelectGroup>
                                                        <SelectItem value="Grade 1">Grade 1</SelectItem>
                                                        <SelectItem value="Grade 2">Grade 2</SelectItem>
                                                        <SelectItem value="Grade 3">Grade 3</SelectItem>
                                                        <SelectItem value="Grade 4">Grade 4</SelectItem>
                                                        <SelectItem value="Grade 5">Grade 5</SelectItem>
                                                        <SelectItem value="Grade 6">Grade 6</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {field.state.meta.errors.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <form.Subscribe selector={(state) => [state.canSubmit]}>
                            {([canSubmit]) => (
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={!canSubmit || updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 my-auto" />
                                            Save Changes
                                        </>
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

export default EditAccountForm;