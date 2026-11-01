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
    UserStar,
    CircleCheck,
    CircleX,
    Clock3,
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
            <DialogContent className="max-w-md">
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
                    <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
                        {/* Account Status */}
                        <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${statusMeta.className}`} />
                            <span className={`text-sm font-medium ${statusMeta.className}`}>
                                {statusMeta.label}
                            </span>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <UserRound className="h-3 w-3" /> Personal Information
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="First Name"  value={profile.first_name} />
                                <Separator />
                                <InfoRow label="Middle Name" value={profile.middle_name} />
                                <Separator />
                                <InfoRow label="Last Name"   value={profile.last_name} />
                                <Separator />
                                <InfoRow label="Suffix"      value={profile.suffix} />
                            </div>
                        </div>

                        {/* Account Information */}
                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <IdCardLanyard className="h-3 w-3" /> Account Information
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="Staff ID"  value={profile.staff_id} />
                                <Separator />
                                <InfoRow label="Username"  value={profile.username} />
                                <Separator />
                                <InfoRow label="Activated" value={
                                    profile.activated_at
                                        ? new Date(profile.activated_at).toLocaleDateString()
                                        : null
                                } />
                                <Separator />
                                <InfoRow label="Date Added" value={
                                    profile.created_at
                                        ? new Date(profile.created_at).toLocaleDateString()
                                        : null
                                } />
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <UserStar className="h-3 w-3" /> Employment
                            </p>
                            <div className="rounded-md border px-3">
                                <InfoRow label="Position" value={profile.position} />
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewProfile;
