import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Send, 
    ClockAlert, 
    CircleCheck, 
    FileStack, 
    RotateCcw, 
    Loader2,
} from "lucide-react";
import { GetDocumentSubmissionMetrics } from "@/services/documentSubmissionService";

const CardMetrics = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["document-submission-metrics"],
        queryFn: GetDocumentSubmissionMetrics,
    });

    const cards = [
        { title: "Total Submissions", value: data?.total ?? 0, icon: FileStack, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
        { title: "Submitted", value: data?.submitted ?? 0, icon: Send, bgColor: "bg-sky-100", iconColor: "text-sky-600" },
        { title: "Resubmitted", value: data?.resubmitted ?? 0, icon: RotateCcw, bgColor: "bg-purple-100", iconColor: "text-purple-600" },
        { title: "Revision Required", value: data?.revision_required ?? 0, icon: ClockAlert, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
        { title: "Approved", value: data?.approved ?? 0, icon: CircleCheck, bgColor: "bg-green-100", iconColor: "text-green-600" },
    ];

    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card key={card.title} className="flex-row gap-0 p-4">
                        <div className="flex-1">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                                ) : (
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        {card.value}
                                    </h1>
                                )}
                            </CardContent>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default CardMetrics;