import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { UserX, UserCheck, Loader2 } from "lucide-react";
import { ToggleTeacherStatus } from "@/services/teacherService";

const ToggleAccountStatus = ({ teacher }) => {
    const queryClient = useQueryClient();
    const isActive = teacher.status === "active";

    const toggleMutation = useMutation({
        mutationFn: () => ToggleTeacherStatus(teacher.id),
        onSuccess: (data) => {
            const action = data.status === "inactive" ? "deactivated" : "activated";
            toast.success(
                `Teacher "${teacher.first_name} ${teacher.last_name}" has been ${action}.`
            );
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-metrics"] });
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to update account status."
            );
        },
    });

    if (teacher.status === "pending") {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={
                        isActive
                            ? "text-orange-500 hover:text-orange-600"
                            : "text-green-600 hover:text-green-700"
                    }
                    disabled={toggleMutation.isPending}
                    title={isActive ? "Deactivate Account" : "Activate Account"}
                >
                    {toggleMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isActive ? (
                        <UserX />
                    ) : (
                        <UserCheck />
                    )}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        {isActive ? (
                            <UserX className="text-orange-500" />
                        ) : (
                            <UserCheck className="text-green-600" />
                        )}
                    </AlertDialogMedia>
                    <AlertDialogTitle>
                        {isActive ? "Deactivate Teacher Account?" : "Activate Teacher Account?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isActive ? (
                            <>
                                Are you sure you want to deactivate{" "}
                                <span className="font-semibold">
                                    {teacher.first_name} {teacher.last_name}
                                </span>
                                ? Their session will be revoked immediately and they will no
                                longer be able to log in. All records will be preserved.
                            </>
                        ) : (
                            <>
                                Are you sure you want to reactivate{" "}
                                <span className="font-semibold">
                                    {teacher.first_name} {teacher.last_name}
                                </span>
                                ? They will regain access to the system according to their
                                assigned role.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant={isActive ? "destructive" : "default"}
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                    >
                        {toggleMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isActive ? "Deactivating..." : "Activating..."}
                            </>
                        ) : isActive ? (
                            "Deactivate"
                        ) : (
                            "Activate"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ToggleAccountStatus;
