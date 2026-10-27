import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

import { GetMonthlyStats } from "@/services/dashboardService";

const chartConfig = {
    document_requests: {
        label: "Document Requests",
        color: "var(--chart-1)",
    },
    submission_requests: {
        label: "Submission Requests",
        color: "var(--chart-2)",
    },
};

const SubmissionRequestChart = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-monthly-stats"],
        queryFn: GetMonthlyStats,
        staleTime: 60_000,
    });

    const year = data?.year ?? new Date().getFullYear();
    const chartData = data?.data ?? [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle>
                            Document Requests &amp; Submissions
                        </CardTitle>
                        <CardDescription>
                            January – December {year}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="h-[212px] flex items-center justify-center text-muted-foreground text-sm">
                        Loading chart…
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-[212px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available for {year}.
                    </div>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="h-[212px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                            />

                            <Line
                                dataKey="document_requests"
                                type="monotone"
                                stroke="var(--color-document_requests)"
                                strokeWidth={2}
                                dot={false}
                            />

                            <Line
                                dataKey="submission_requests"
                                type="monotone"
                                stroke="var(--color-submission_requests)"
                                strokeWidth={2}
                                dot={false}
                            />

                            <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default SubmissionRequestChart;
