import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
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
    Plus,
    Send,
    IdCardLanyard,
    UserPen,
    UserStar,
    ArrowBigUpDash,
    GraduationCap,
    Loader2,
    CircleCheckBig,
    Copy,
    CopyCheck,
    MapPin,
    Phone,
} from 'lucide-react';
import { 
    input_class, 
    icon_class 
} from "@/components/common/constant";
import { CreateTeacher } from "@/services/teacherService";
import { capitalizeWords } from "@/lib/utils";
import {
    getRegions,
    getProvincesByRegion,
    getCitiesByProvince,
    getBarangaysByCity,
    getRegionName,
    getProvinceName,
    getCityName,
    getBarangayName,
} from "@/data/ph-address";

const required = (label) => ({ value }) => (!value ? `${label} is required` : undefined);

const AddAccountForm = ({ onCreated }) => {
    const [open, setOpen] = useState(false);
    const [createdData, setCreatedData] = useState(null); // holds response after success
    const [copied, setCopied] = useState(false);
    const [regionCode, setRegionCode] = useState("");
    const [provinceCode, setProvinceCode] = useState("");
    const [cityCode, setCityCode] = useState("");

    const handleCopy = () => {
        navigator.clipboard.writeText(createdData.activation_code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleClose = () => {
        setOpen(false);
        // reset after dialog close animation finishes
        setTimeout(() => {
            setCreatedData(null);
            setCopied(false);
            form.reset();
            setRegionCode("");
            setProvinceCode("");
            setCityCode("");
        }, 200);
    };

    const createTeacherMutation = useMutation({
        mutationFn: CreateTeacher,
        onSuccess: (data) => {
            setCreatedData(data);
            onCreated?.(data);
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
            toast.error(err.response?.data?.message || "Failed to create teacher account.");
        },
    });

    const form = useForm({
        defaultValues: {
            teacherId: "",
            firstName: "",
            middleName: "",
            lastName: "",
            suffix: "none",
            username: "",
            position: "",
            classAdvisory: "",
            region: "",
            province: "",
            cityMunicipality: "",
            barangay: "",
            contactNumber: "",
        },
        onSubmit: async ({ value }) => {
            await createTeacherMutation.mutateAsync(value);
        },
    });

    // Cascading address selection (codes drive options; names are stored in the form)
    const regions = useMemo(() => getRegions(), []);
    const provinces = useMemo(() => getProvincesByRegion(regionCode), [regionCode]);
    const cities = useMemo(() => getCitiesByProvince(provinceCode), [provinceCode]);
    const barangays = useMemo(() => getBarangaysByCity(cityCode), [cityCode]);

    const handleRegionChange = (code) => {
        setRegionCode(code);
        setProvinceCode("");
        setCityCode("");
        form.setFieldValue("region", getRegionName(code));
        form.setFieldValue("province", "");
        form.setFieldValue("cityMunicipality", "");
        form.setFieldValue("barangay", "");
    };

    const handleProvinceChange = (code) => {
        setProvinceCode(code);
        setCityCode("");
        form.setFieldValue("province", getProvinceName(code));
        form.setFieldValue("cityMunicipality", "");
        form.setFieldValue("barangay", "");
    };

    const handleCityChange = (code) => {
        setCityCode(code);
        form.setFieldValue("cityMunicipality", getCityName(code));
        form.setFieldValue("barangay", "");
    };

    const handleBarangayChange = (code) => {
        form.setFieldValue("barangay", getBarangayName(code));
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus />
                    Add Teacher Account
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[150vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
                {createdData ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Account Created</DialogTitle>
                        </DialogHeader>
                        <Separator />

                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <CircleCheckBig className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">
                                    {createdData.teacher.first_name} {createdData.teacher.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Teacher account created successfully.
                                </p>
                            </div>

                            {/* Activation code card */}
                            <div className="w-full rounded-lg border bg-muted/50 p-4">
                                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    One-Time Activation Code
                                </p>
                                <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-4 py-3">
                                    <span className="font-mono text-xl font-bold tracking-widest">
                                        {createdData.activation_code}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopy}
                                        className={copied ? "text-green-600" : "text-muted-foreground"}
                                        title={copied ? "Copied!" : "Copy code"}
                                    >
                                        {copied ? (
                                            <CopyCheck className="h-5 w-5" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Share this code with the teacher. It can only be used once.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="default"
                                onClick={handleClose}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    /* ── FORM VIEW ── */
                    <>
                        <DialogHeader>
                            <DialogTitle>Add Teacher Account</DialogTitle>
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
                                <form.Field name="teacherId" validators={{ onChange: required("Employee ID") }}>
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Employee ID</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="26-0001"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(capitalizeWords(e.target.value))}
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

                                <FieldGroup className="grid grid-cols-2">
                                    <form.Field name="firstName" validators={{ onChange: required("First name") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>First Name</FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        placeholder="Juan"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(capitalizeWords(e.target.value))}
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
                                                        onChange={(e) => field.handleChange(capitalizeWords(e.target.value))}
                                                        onBlur={field.handleBlur}
                                                    />
                                                    <InputGroupAddon><UserPen /></InputGroupAddon>
                                                </InputGroup>
                                            </Field>
                                        )}
                                    </form.Field>
                                </FieldGroup>

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
                                                            onChange={(e) => field.handleChange(capitalizeWords(e.target.value))}
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

                                <FieldGroup className="grid grid-cols-2">
                                    <form.Field name="position" validators={{ onChange: required("Position") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>Position</FieldLabel>
                                                <div className="relative">
                                                    <div className={icon_class}><ArrowBigUpDash className="w-4.5 h-4.5" /></div>
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
                                                    <div className={icon_class}><GraduationCap className="w-4.5 h-4.5" /></div>
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

                                <FieldGroup className="grid grid-cols-2">
                                    <form.Field name="region" validators={{ onChange: required("Region") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>Region</FieldLabel>
                                                <div className="relative">
                                                    <div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div>
                                                    <Select
                                                        value={regionCode || undefined}
                                                        onValueChange={handleRegionChange}
                                                    >
                                                        <SelectTrigger className={input_class}>
                                                            <SelectValue placeholder="Select Region" />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                {regions.map((r) => (
                                                                    <SelectItem key={r.region_code} value={r.region_code}>
                                                                        {r.region_name}
                                                                    </SelectItem>
                                                                ))}
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
                                    <form.Field name="province" validators={{ onChange: required("Province / District") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>Province / District</FieldLabel>
                                                <div className="relative">
                                                    <div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div>
                                                    <Select
                                                        value={provinceCode || undefined}
                                                        onValueChange={handleProvinceChange}
                                                        disabled={!regionCode}
                                                    >
                                                        <SelectTrigger className={input_class}>
                                                            <SelectValue placeholder={regionCode ? "Select Province / District" : "Select Region first"} />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                {provinces.map((p) => (
                                                                    <SelectItem key={p.province_code} value={p.province_code}>
                                                                        {p.province_name}
                                                                    </SelectItem>
                                                                ))}
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

                                <FieldGroup className="grid grid-cols-2">
                                    <form.Field name="cityMunicipality" validators={{ onChange: required("City / Municipality") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>City / Municipality</FieldLabel>
                                                <div className="relative">
                                                    <div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div>
                                                    <Select
                                                        value={cityCode || undefined}
                                                        onValueChange={handleCityChange}
                                                        disabled={!provinceCode}
                                                    >
                                                        <SelectTrigger className={input_class}>
                                                            <SelectValue placeholder={provinceCode ? "Select City / Municipality" : "Select Province first"} />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                {cities.map((c) => (
                                                                    <SelectItem key={c.city_code} value={c.city_code}>
                                                                        {c.city_name}
                                                                    </SelectItem>
                                                                ))}
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
                                    <form.Field name="barangay" validators={{ onChange: required("Barangay") }}>
                                        {(field) => (
                                            <Field>
                                                <FieldLabel>Barangay</FieldLabel>
                                                <div className="relative">
                                                    <div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div>
                                                    <Select
                                                        value={
                                                            // derive selected code from name for controlled display
                                                            barangays.find((b) => b.brgy_name === field.state.value)?.brgy_code || undefined
                                                        }
                                                        onValueChange={handleBarangayChange}
                                                        disabled={!cityCode}
                                                    >
                                                        <SelectTrigger className={input_class}>
                                                            <SelectValue placeholder={cityCode ? "Select Barangay" : "Select City first"} />
                                                        </SelectTrigger>
                                                        <SelectContent position="popper">
                                                            <SelectGroup>
                                                                {barangays.map((b) => (
                                                                    <SelectItem key={b.brgy_code} value={b.brgy_code}>
                                                                        {b.brgy_name}
                                                                    </SelectItem>
                                                                ))}
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

<form.Field
                                    name="contactNumber"
                                    validators={{
                                        onChange: ({ value }) => {
                                            if (!value) return "Contact number is required";
                                            if (!/^[\d\s\+\-\(\)]+$/.test(value)) {
                                                return "Contact number may only contain digits, spaces, +, -, and parentheses";
                                            }
                                            if (value.replace(/\D/g, "").length < 7) {
                                                return "Contact number must have at least 7 digits";
                                            }
                                            return undefined;
                                        },
                                    }}
                                >
                                    {(field) => (
                                        <Field>
                                            <FieldLabel>Contact Number</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    placeholder="09XXXXXXXXX"
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                />
                                                <InputGroupAddon><Phone /></InputGroupAddon>
                                            </InputGroup>
                                            {field.state.meta.errors.length > 0 && (
                                                <FieldDescription className="text-destructive">
                                                    {field.state.meta.errors[0]}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    )}
                                </form.Field>
                            </FieldGroup>

                            <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Close
                                    </Button>
                                </DialogClose>
                                <form.Subscribe selector={(state) => [state.canSubmit]}>
                                    {([canSubmit]) => (
                                        <Button
                                            type="submit"
                                            variant="default"
                                            disabled={!canSubmit || createTeacherMutation.isPending}
                                        >
                                            {createTeacherMutation.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 my-auto" />
                                                    Create Account
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </form.Subscribe>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddAccountForm;