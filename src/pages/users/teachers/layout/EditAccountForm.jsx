import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, IdCardLanyard, UserPen, UserStar, BriefcaseBusiness, GraduationCap, SquarePen, Loader2, MapPin, Phone } from "lucide-react";
import { input_class, icon_class } from "@/components/common/constant";
import { UpdateTeacher } from "@/services/teacherService";
import { capitalizeWords } from "@/lib/utils";
import { getRegions, getProvincesByRegion, getCitiesByProvince, getBarangaysByCity, getRegionName, getProvinceName, getCityName, getBarangayName } from "@/data/ph-address";

const required = (label) => ({ value }) => (!value ? `${label} is required` : undefined);
const formatTIN = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};
const SEX_OPTIONS = ["Male", "Female"];
const FUND_SOURCE_OPTIONS = ["DepEd", "LGU", "National Fund", "School MOOE", "PTA", "Other"];
const NATURE_OF_APPOINTMENT_OPTIONS = ["Original", "Promotion", "Reemployment", "Reinstatement", "Transfer", "Demotion", "Reclassification"];
const HIRING_ARRANGEMENT_OPTIONS = ["Permanent", "Temporary", "Casual", "Contractual", "Substitute", "Job Order", "Contract of Service"];
const ITEM_STATUS_OPTIONS = ["Item", "Non-Item"];
const POSITIONS = ["Teacher I","Teacher II","Teacher III","Teacher IV","Teacher V","Teacher VI","Teacher VII","Master Teacher I","Master Teacher II","Master Teacher III","Master Teacher IV","Master Teacher V"];
const CLASS_ADVISORIES = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"];

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 pt-2"><Icon className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-semibold">{title}</p></div>
);

const EditAccountForm = ({ teacher }) => {
    const [open, setOpen] = useState(false);
    const [regionCode, setRegionCode] = useState("");
    const [provinceCode, setProvinceCode] = useState("");
    const [cityCode, setCityCode] = useState("");
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
                    form.setFieldMeta(key, (meta) => ({ ...meta, errorMap: { onSubmit: messages[0] } }));
                });
                return;
            }
            toast.error(err.response?.data?.message || "Failed to update teacher account.");
        },
    });

    const form = useForm({
        defaultValues: {
            firstName: teacher.first_name ?? "", middleName: teacher.middle_name ?? "", lastName: teacher.last_name ?? "",
            sex: teacher.sex ?? "", religion: teacher.religion ?? "", ethnicGroup: teacher.ethnic_group ?? "",
            region: teacher.region ?? "", province: teacher.province ?? "", cityMunicipality: teacher.city_municipality ?? "", barangay: teacher.barangay ?? "", contactNumber: teacher.contact_number ?? "",
            teacherId: teacher.teacher_id ?? "", tin: teacher.tin ?? "", fundSource: teacher.fund_source ?? "", position: teacher.position ?? "",
            natureOfAppointment: teacher.nature_of_appointment ?? "", hiringArrangement: teacher.hiring_arrangement ?? "", itemStatus: teacher.item_status ?? "", classAdvisory: teacher.class_advisory ?? "",
            degreeFinished: teacher.degree_finished ?? "", minor: teacher.minor ?? "", postGraduate: teacher.post_graduate ?? "", prcSpecialization: teacher.prc_specialization ?? "",
            username: teacher.username ?? "", suffix: teacher.suffix ?? "none",
        },
        onSubmit: async ({ value }) => { await updateMutation.mutateAsync({ id: teacher.id, ...value }); },
    });

    const regions = useMemo(() => getRegions(), []);
    const provinces = useMemo(() => getProvincesByRegion(regionCode), [regionCode]);
    const cities = useMemo(() => getCitiesByProvince(provinceCode), [provinceCode]);
    const barangays = useMemo(() => getBarangaysByCity(cityCode), [cityCode]);

    useEffect(() => {
        if (!open) return;
        const region = regions.find((r) => r.region_name === (teacher.region ?? ""));
        const rCode = region?.region_code ?? "";
        const provs = rCode ? getProvincesByRegion(rCode) : [];
        const province = provs.find((p) => p.province_name === (teacher.province ?? ""));
        const pCode = province?.province_code ?? "";
        const cits = pCode ? getCitiesByProvince(pCode) : [];
        const city = cits.find((c) => c.city_name === (teacher.city_municipality ?? ""));
        setRegionCode(rCode); setProvinceCode(pCode); setCityCode(city?.city_code ?? "");
    }, [open, teacher, regions]);

    const handleRegionChange = (code) => { setRegionCode(code); setProvinceCode(""); setCityCode(""); form.setFieldValue("region", getRegionName(code)); form.setFieldValue("province", ""); form.setFieldValue("cityMunicipality", ""); form.setFieldValue("barangay", ""); };
    const handleProvinceChange = (code) => { setProvinceCode(code); setCityCode(""); form.setFieldValue("province", getProvinceName(code)); form.setFieldValue("cityMunicipality", ""); form.setFieldValue("barangay", ""); };
    const handleCityChange = (code) => { setCityCode(code); form.setFieldValue("cityMunicipality", getCityName(code)); form.setFieldValue("barangay", ""); };
    const handleBarangayChange = (code) => { form.setFieldValue("barangay", getBarangayName(code)); };

    const TextField = ({ name, label, placeholder, required: isRequired, icon: Icon = UserPen, transform }) => (
        <form.Field name={name} validators={isRequired ? { onChange: required(label) } : undefined}>
            {(field) => (
                <Field><FieldLabel>{label}</FieldLabel><InputGroup><InputGroupInput placeholder={placeholder} value={field.state.value} onChange={(e) => field.handleChange(transform ? transform(e.target.value) : e.target.value)} onBlur={field.handleBlur} /><InputGroupAddon><Icon /></InputGroupAddon></InputGroup>
                {field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>
            )}
        </form.Field>
    );
    const SelectField = ({ name, label, placeholder, options, required: isRequired, icon: Icon = BriefcaseBusiness }) => (
        <form.Field name={name} validators={isRequired ? { onChange: required(label) } : undefined}>
            {(field) => (
                <Field><FieldLabel>{label}</FieldLabel><div className="relative"><div className={icon_class}><Icon className="w-4.5 h-4.5" /></div>
                <Select value={field.state.value} onValueChange={field.handleChange}><SelectTrigger className={input_class}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent position="popper"><SelectGroup>{options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
                {field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>
            )}
        </form.Field>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="ghost" size="icon"><SquarePen /></Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader><DialogTitle>Edit Teacher Account</DialogTitle></DialogHeader>
                <Separator />
                <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
                    <FieldGroup>
                        <SectionTitle icon={UserPen} title="Personal Information" />
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-4">
                            <TextField name="firstName" label="First Name" placeholder="Juan" required icon={UserPen} transform={capitalizeWords} />
                            <TextField name="middleName" label="Middle Name" placeholder="Middle Name" icon={UserPen} transform={capitalizeWords} />
                            <TextField name="lastName" label="Last Name" placeholder="Dela Cruz" required icon={UserPen} transform={capitalizeWords} />
                            <SelectField name="suffix" label="Suffix" placeholder="None" options={["none","Jr.","Sr.","II","III","IV","V"]} icon={UserPen} />
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
                            <SelectField name="sex" label="Sex" placeholder="Select Sex" options={SEX_OPTIONS} icon={UserPen} />
                            <TextField name="religion" label="Religion" placeholder="Religion" icon={UserPen} transform={capitalizeWords} />
                            <TextField name="ethnicGroup" label="Ethnic Group" placeholder="Ethnic Group" icon={UserPen} transform={capitalizeWords} />
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
                            <form.Field name="contactNumber" validators={{ onChange: ({ value }) => { if (!value) return "Contact number is required"; if (!/^[\d\s\+\-\(\)]+$/.test(value)) return "Contact number may only contain digits, spaces, +, -, and parentheses"; if (value.replace(/\D/g, "").length < 7) return "Contact number must have at least 7 digits"; return undefined; } }}>{(field) => (<Field><FieldLabel>Contact Number</FieldLabel><InputGroup><InputGroupInput placeholder="09XXXXXXXXX" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} /><InputGroupAddon><Phone /></InputGroupAddon></InputGroup>{field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>)}</form.Field>
                        </FieldGroup>

                        <Separator />
                        <SectionTitle icon={MapPin} title="Address" />
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
                            <form.Field name="region" validators={{ onChange: required("Region") }}>{(field) => (<Field><FieldLabel>Region</FieldLabel><div className="relative"><div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div><Select value={regionCode || undefined} onValueChange={handleRegionChange}><SelectTrigger className={input_class}><SelectValue placeholder="Select Region" /></SelectTrigger><SelectContent position="popper"><SelectGroup>{regions.map((r) => <SelectItem key={r.region_code} value={r.region_code}>{r.region_name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>{field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>)}</form.Field>
                            <form.Field name="province" validators={{ onChange: required("Province / District") }}>{(field) => (<Field><FieldLabel>Province / District</FieldLabel><div className="relative"><div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div><Select value={provinceCode || undefined} onValueChange={handleProvinceChange} disabled={!regionCode}><SelectTrigger className={input_class}><SelectValue placeholder={regionCode ? "Select Province / District" : "Select Region first"} /></SelectTrigger><SelectContent position="popper"><SelectGroup>{provinces.map((p) => <SelectItem key={p.province_code} value={p.province_code}>{p.province_name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>{field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>)}</form.Field>
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
                            <form.Field name="cityMunicipality" validators={{ onChange: required("City / Municipality") }}>{(field) => (<Field><FieldLabel>City / Municipality</FieldLabel><div className="relative"><div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div><Select value={cityCode || undefined} onValueChange={handleCityChange} disabled={!provinceCode}><SelectTrigger className={input_class}><SelectValue placeholder={provinceCode ? "Select City / Municipality" : "Select Province first"} /></SelectTrigger><SelectContent position="popper"><SelectGroup>{cities.map((c) => <SelectItem key={c.city_code} value={c.city_code}>{c.city_name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>{field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>)}</form.Field>
                            <form.Field name="barangay" validators={{ onChange: required("Barangay") }}>{(field) => (<Field><FieldLabel>Barangay</FieldLabel><div className="relative"><div className={icon_class}><MapPin className="w-4.5 h-4.5" /></div><Select value={barangays.find((b) => b.brgy_name === field.state.value)?.brgy_code || undefined} onValueChange={handleBarangayChange} disabled={!cityCode}><SelectTrigger className={input_class}><SelectValue placeholder={cityCode ? "Select Barangay" : "Select City first"} /></SelectTrigger><SelectContent position="popper"><SelectGroup>{barangays.map((b) => <SelectItem key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</SelectItem>)}</SelectGroup></SelectContent></Select></div>{field.state.meta.errors?.length > 0 && <FieldDescription className="text-destructive">{field.state.meta.errors[0]}</FieldDescription>}</Field>)}</form.Field>
                        </FieldGroup>

                        <Separator />
                        <SectionTitle icon={BriefcaseBusiness} title="Employment Information" />
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
                            <TextField name="teacherId" label="Employee ID" placeholder="26-0001" required icon={IdCardLanyard} />
                            <TextField name="tin" label="TIN" placeholder="123-456-789" icon={IdCardLanyard} transform={formatTIN} />
                            <SelectField name="fundSource" label="Fund Source" placeholder="Select Fund Source" options={FUND_SOURCE_OPTIONS} />
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
                            <SelectField name="position" label="Position Designation" placeholder="Select Position" options={POSITIONS} required icon={BriefcaseBusiness} />
                            <SelectField name="natureOfAppointment" label="Nature of Appointment" placeholder="Select Nature" options={NATURE_OF_APPOINTMENT_OPTIONS} />
                            <SelectField name="hiringArrangement" label="Hiring Arrangement" placeholder="Select Arrangement" options={HIRING_ARRANGEMENT_OPTIONS} />
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
                            <SelectField name="itemStatus" label="Status (ITEM)" placeholder="Select Status" options={ITEM_STATUS_OPTIONS} />
                            <SelectField name="classAdvisory" label="Class Advisory" placeholder="Select Class Advisory" options={CLASS_ADVISORIES} required icon={GraduationCap} />
                            <TextField name="username" label="Username" placeholder="Juan.DelaCruz" required icon={UserStar} />
                        </FieldGroup>

                        <Separator />
                        <SectionTitle icon={GraduationCap} title="Educational Background" />
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
                            <TextField name="degreeFinished" label="Degree Finished" placeholder="Degree Finished" icon={GraduationCap} transform={capitalizeWords} />
                            <TextField name="minor" label="Minor" placeholder="Minor" icon={GraduationCap} transform={capitalizeWords} />
                        </FieldGroup>
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
                            <TextField name="postGraduate" label="Post-Graduate" placeholder="Post-Graduate" icon={GraduationCap} transform={capitalizeWords} />
                            <TextField name="prcSpecialization" label="PRC Specialization" placeholder="PRC Specialization" icon={GraduationCap} transform={capitalizeWords} />
                        </FieldGroup>
                    </FieldGroup>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <form.Subscribe selector={(state) => [state.canSubmit]}>
                            {([canSubmit]) => (
                                <Button type="submit" variant="default" disabled={!canSubmit || updateMutation.isPending}>
                                    {updateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Send className="h-4 w-4 my-auto" /> Save Changes</>}
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
