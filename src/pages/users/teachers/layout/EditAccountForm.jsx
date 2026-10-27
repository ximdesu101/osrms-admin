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
import { UpdateTeacher } from "@/services/teacherService";

const required = (label) => ({ value }) => (!value ? `${label} is required` : undefined);

const EditAccountForm = ({ teacher }) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: UpdateTeacher,
        onSuccess: () => {
            toast.success("Teacher account updated successfully.");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-metrics"] });
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
            toast.error(err.response?.data?.message || "Failed to update teacher account.");
        },
    });

    const form = useForm({
        defaultValues: {
            teacherId:     teacher.teacher_id    ?? "",
            firstName:     teacher.first_name    ?? "",
            middleName:    teacher.middle_name   ?? "",
            lastName:      teacher.last_name     ?? "",
            suffix:        teacher.suffix        ?? "none",
            username:      teacher.username      ?? "",
            position:      teacher.position      ?? "",
            classAdvisory: teacher.class_advisory ?? "",
        },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync({ id: teacher.id, ...value });
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
                    <DialogTitle>Edit Teacher Account</DialogTitle>
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
                        <form.Field name="teacherId" validators={{ onChange: required("Employee ID") }}>
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

                        {/* Position + Class Advisory */}
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
                                                        <SelectItem value="Teacher I">Teacher I</SelectItem>
                                                        <SelectItem value="Teacher II">Teacher II</SelectItem>
                                                        <SelectItem value="Teacher III">Teacher III</SelectItem>
                                                        <SelectItem value="Teacher IV">Teacher IV</SelectItem>
                                                        <SelectItem value="Teacher V">Teacher V</SelectItem>
                                                        <SelectItem value="Teacher VI">Teacher VI</SelectItem>
                                                        <SelectItem value="Teacher VII">Teacher VII</SelectItem>
                                                        <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                                                        <SelectItem value="Master Teacher II">Master Teacher II</SelectItem>
                                                        <SelectItem value="Master Teacher III">Master Teacher III</SelectItem>
                                                        <SelectItem value="Master Teacher IV">Master Teacher IV</SelectItem>
                                                        <SelectItem value="Master Teacher V">Master Teacher V</SelectItem>
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
                            <form.Field name="classAdvisory" validators={{ onChange: required("Class advisory") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Class Advisory</FieldLabel>
                                        <div className="relative">
                                            <div className={icon_class}>
                                                <GraduationCap className="w-4.5 h-4.5" />
                                            </div>
                                            <Select value={field.state.value} onValueChange={field.handleChange}>
                                                <SelectTrigger className={input_class}>
                                                    <SelectValue placeholder="Select Class Advisory" />
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
