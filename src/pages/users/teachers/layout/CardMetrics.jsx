import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    UsersRound,
    UserRoundCheck,
    ClockAlert,
    CircleX
} from "lucide-react";
import { GetTeacherMetrics } from "@/services/teacherService";

const METRIC_CONFIG = [
    {
        key: "total",
        title: "Total Accounts",
        icon: UsersRound,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        key: "active",
        title: "Active Accounts",
        icon: UserRoundCheck,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
    },
    {
        key: "inactive",
        title: "Disabled Accounts",
        icon: CircleX,
        bgColor: "bg-red-100",
        iconColor: "text-red-600",
    },
    {
        key: "pending",
        title: "Pending Activation",
        icon: ClockAlert,
        bgColor: "bg-yellow-100",
        iconColor: "text-yellow-600",
    },
];

const CardMetrics = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["teacher-metrics"],
        queryFn: GetTeacherMetrics,
    });

    return (
        <div className="grid grid-cols-4 auto-rows-min gap-4">
            {METRIC_CONFIG.map((config) => {
                const Icon = config.icon;
                const value = isLoading ? "—" : (data?.[config.key] ?? 0);

                return (
                    <Card key={config.key} className="flex-row gap-0 p-4">
                        <div className={`flex h-15 w-15 items-center justify-center rounded-full ${config.bgColor}`}>
                            {Icon && <Icon className={`h-8 w-8 ${config.iconColor}`} />}
                        </div>
                        <div className="flex-1">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm">
                                    {config.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {value}
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
