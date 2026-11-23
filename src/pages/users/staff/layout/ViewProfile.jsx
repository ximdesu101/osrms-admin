import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Eye,
    Loader2,
    UserRound,
    IdCardLanyard,
    BriefcaseBusiness,
    GraduationCap,
    CircleCheck,
    CircleX,
    Clock3,
    MapPin,
} from "lucide-react";
import { GetStaff } from "@/services/staffService";

const statusConfig = {
    active:   { label: "Active",             icon: CircleCheck, className: "text-green-600" },
    inactive: { label: "Inactive",           icon: CircleX,     className: "text-destructive" },
    pending:  { label: "Pending Activation", icon: Clock3,      className: "text-yellow-600" },
};

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-2 py-1.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value || <span className="text-muted-foreground italic">—</span>}</span>
    </div>
);

const ViewProfile = ({ staff }) => {
    const [open, setOpen] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["staff-profile", staff.id],
        queryFn: () => GetStaff(staff.id),
        enabled: open,
    });

    const profile = data?.staff;
    const statusMeta = statusConfig[profile?.status] ?? statusConfig.pending;
    const StatusIcon = statusMeta.icon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="View Profile">
                    <Eye />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Staff Profile</DialogTitle>
                </DialogHeader>
                <Separator />

                {isLoading && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading profile…
                    </div>
                )}

                {isError && (
                    <p className="py-4 text-center text-sm text-destructive">
                        Failed to load profile. Please try again.
                    </p>
                )}

                {profile && (
                    <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${statusMeta.className}`} />
                            <span className={`text-sm font-medium ${statusMeta.className}`}>
                                {statusMeta.label}
                            </span>
                        </div>

                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <UserRound className="h-3 w-3" /> Personal Information
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="First Name" value={profile.first_name} />
                                <Separator />
                                <InfoRow label="Middle Name" value={profile.middle_name} />
                                <Separator />
                                <InfoRow label="Last Name" value={profile.last_name} />
                                <Separator />
                                <InfoRow label="Sex" value={profile.sex} />
                                <Separator />
                                <InfoRow label="Religion" value={profile.religion} />
                                <Separator />
                                <InfoRow label="Ethnic Group" value={profile.ethnic_group} />
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <MapPin className="h-3 w-3" /> Address
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="Region" value={profile.region} />
                                <Separator />
                                <InfoRow label="Province / District" value={profile.province} />
                                <Separator />
                                <InfoRow label="City / Municipality" value={profile.city_municipality} />
                                <Separator />
                                <InfoRow label="Barangay" value={profile.barangay} />
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <BriefcaseBusiness className="h-3 w-3" /> Employment Information
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="Employee ID" value={profile.staff_id} />
                                <Separator />
                                <InfoRow label="TIN" value={profile.tin} />
                                <Separator />
                                <InfoRow label="Fund Source" value={profile.fund_source} />
                                <Separator />
                                <InfoRow label="Position Designation" value={profile.position} />
                                <Separator />
                                <InfoRow label="Nature of Appointment" value={profile.nature_of_appointment} />
                                <Separator />
                                <InfoRow label="Hiring Arrangement" value={profile.hiring_arrangement} />
                                <Separator />
                                <InfoRow label="Status (ITEM)" value={profile.item_status} />
                                <Separator />
                                <InfoRow label="Username" value={profile.username} />
                                <Separator />
                                <InfoRow
                                    label="Activated"
                                    value={profile.activated_at ? new Date(profile.activated_at).toLocaleDateString() : null}
                                />
                                <Separator />
                                <InfoRow
                                    label="Date Added"
                                    value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : null}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <GraduationCap className="h-3 w-3" /> Educational Background
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="Degree Finished" value={profile.degree_finished} />
                                <Separator />
                                <InfoRow label="Minor" value={profile.minor} />
                                <Separator />
                                <InfoRow label="Post-Graduate" value={profile.post_graduate} />
                                <Separator />
                                <InfoRow label="PRC Specialization" value={profile.prc_specialization} />
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewProfile;
