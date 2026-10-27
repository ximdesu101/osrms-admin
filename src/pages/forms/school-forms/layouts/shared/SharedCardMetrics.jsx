import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Files,
    FileStack,
    CalendarDays,
} from "lucide-react";

const DEFAULT_ICONS = {
    totalFiles: Files,
    version: FileStack,
    lastUpdated: CalendarDays,
};

const DEFAULT_STYLES = {
    totalFiles: { bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    version: { bgColor: "bg-green-100", iconColor: "text-green-600" },
    lastUpdated: { bgColor: "bg-orange-100", iconColor: "text-orange-600" },
};

/**
 * @param {{ metrics: Array<{ key: string, title: string, value: string|number, icon?: any, bgColor?: string, iconColor?: string }> }} props
 */
const SharedCardMetrics = ({ metrics }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {metrics.map((config, index) => {
                const Icon = config.icon || DEFAULT_ICONS[config.key] || Files;
                const bgColor = config.bgColor || DEFAULT_STYLES[config.key]?.bgColor || "bg-blue-100";
                const iconColor = config.iconColor || DEFAULT_STYLES[config.key]?.iconColor || "text-blue-600";

                return (
                    <Card
                        key={config.key}
                        className={`flex flex-row items-center gap-4 p-4 shadow-none ${
                            index === 0 ? "col-span-2" : ""
                        }`}
                    >
                        <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${bgColor}`}
                        >
                            <Icon className={`h-7 w-7 ${iconColor}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <CardHeader className="p-0 pb-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {config.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-0">
                                <h1 className="truncate text-2xl font-bold tracking-tight">
                                    {config.value}
                                </h1>
                            </CardContent>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default SharedCardMetrics;