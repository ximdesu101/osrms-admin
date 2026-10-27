import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    UsersRound,
    ClockAlert,
    Send,
    FileText,
} from "lucide-react";
import { GetDashboardMetrics } from "@/services/dashboardService";

const CardMetrics = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-metrics"],
        queryFn: GetDashboardMetrics,
        staleTime: 30_000,
    });

    const cardMetrics = [
        {
            id: 1,
            title: "Teacher Accounts",
            value: data?.teachers?.total ?? 0,
            icon: UsersRound,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
            path: "/teacher-account",
            clickable: true,
        },
        {
            id: 2,
            title: "Pending Requests",
            value: data?.documents?.pending ?? 0,
            icon: ClockAlert,
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
            path: "/document-requests",
            clickable: true,
        },
        {
            id: 3,
            title: "Pending Submissions",
            value: data?.submissions?.requested ?? 0,
            icon: Send,
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            path: "/submission-requests",
            clickable: true,
        },
        {
            id: 4,
            title: "Overdue Submissions",
            value: data?.submissions?.overdue ?? 0,
            icon: FileText,
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
            path: "/submission-requests",
            clickable: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 auto-rows-min gap-4">
            {cardMetrics.map((item) => {
                const Icon = item.icon;
                return (
                    <Card
                        key={item.id}
                        className={`flex-row gap-0 p-4 ${item.clickable ? "cursor-pointer hover:bg-accent transition-colors" : ""}`}
                        onClick={() => item.clickable && navigate(item.path)}
                        role={item.clickable ? "button" : undefined}
                        tabIndex={item.clickable ? 0 : undefined}
                        onKeyDown={(e) => {
                            if (item.clickable && (e.key === "Enter" || e.key === " ")) {
                                navigate(item.path);
                            }
                        }}
                    >
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bgColor}`}>
                            {Icon && <Icon className={`h-8 w-8 ${item.iconColor}`} />}
                        </div>
                        <div className="flex-1">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm">
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-3xl font-bold tracking-tight">
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
