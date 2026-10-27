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
    AlertDialogMedia
} from "@/components/ui/alert-dialog";
import { 
    Trash2, 
    Loader2 
} from "lucide-react";
import { DeleteTeacher } from "@/services/teacherService";

const DeleteAccount = ({ teacher }) => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => DeleteTeacher(teacher.id),
        onSuccess: () => {
            toast.success(`Teacher "${teacher.first_name} ${teacher.last_name}" deleted successfully.`);
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-metrics"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete teacher account.");
        },
    });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 />
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <Trash2 className="text-destructive" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete Teacher Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {teacher.first_name} {teacher.last_name}
                        </span>
                        ? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteAccount;
