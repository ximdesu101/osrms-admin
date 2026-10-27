import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    ClipboardList,
    Clock,
    Eye,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Ban,
} from "lucide-react";
import { GetDocumentRequestMetrics } from "@/services/documentRequestService";

const CardMetrics = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["document-request-metrics"],
        queryFn: GetDocumentRequestMetrics,
        staleTime: 30_000,
    });

    const cardMetrics = [
        {
            id: 1,
            title: "Total Requests",
            value: data?.total ?? 0,
            icon: ClipboardList,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            id: 2,
            title: "Pending",
            value: data?.pending ?? 0,
            icon: Clock,
            bgColor: "bg-sky-100",
            iconColor: "text-sky-600",
        },
        {
            id: 3,
            title: "Acknowledged",
            value: data?.acknowledged ?? 0,
            icon: Eye,
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            id: 4,
            title: "Processing",
            value: data?.processing ?? 0,
            icon: Loader2,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            id: 5,
            title: "Fulfilled",
            value: data?.fulfilled ?? 0,
            icon: CheckCircle2,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            id: 6,
            title: "Unavailable",
            value: data?.unavailable ?? 0,
            icon: AlertCircle,
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 auto-rows-min gap-4">
            {cardMetrics.map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.id} className="flex-row gap-0 p-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.bgColor}`}
                        >
                            {Icon && <Icon className={`h-6 w-6 ${item.iconColor}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <CardHeader className="pb-0 px-3">
                                <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {isLoading ? "—" : item.value}
                                </h1>
                            </CardContent>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default CardMetrics;
