import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    CalendarDays,
    File,
    FileStack,
    BadgeCheck,
    Loader2,
} from "lucide-react";
import campus from "@/assets/sf-icons/campus.png";
import attendance from "@/assets/sf-icons/attendance.png";
import book from "@/assets/sf-icons/book.png";
import calendar from "@/assets/sf-icons/calendar.png";
import promotion from "@/assets/sf-icons/promotion.png";
import summary from "@/assets/sf-icons/summary.png";
import users from "@/assets/sf-icons/users.png";
import health from "@/assets/sf-icons/health.png";
import clipboard from "@/assets/sf-icons/clipboard.png";
import academic from "@/assets/sf-icons/academic.png";
import { GetSchoolFormsSummary } from "@/services/templateService";

const SCHOOL_FORMS = [
    {
        code: "SF1",
        path: "sf1",
        icon: campus,
        name: "School Register Report",
        description:
            "A register of all learners enrolled in the school, including personal data and enrollment status. Used as the official enrollment record for the school year.",
    },
    {
        code: "SF2",
        path: "sf2",
        icon: attendance,
        name: "Daily Attendance Report",
        description:
            "Monthly summary of daily learner attendance per section.",
    },
    {
        code: "SF3",
        path: "sf3",
        icon: book,
        name: "Books Issued and Returned",
        description:
            "Tracks textbooks and instructional materials issued to learners.",
    },
    {
        code: "SF4",
        path: "sf4",
        icon: calendar,
        name: "Monthly Movement Report",
        description:
            "Records learner enrollment changes throughout the school year.",
    },
    {
        code: "SF5",
        path: "sf5",
        icon: promotion,
        name: "Promotion Report",
        description:
            "End-of-year report on learner promotions, retention, and dropouts.",
    },
    {
        code: "SF6",
        path: "sf6",
        icon: summary,
        name: "Summarized Report on Promotion",
        description:
            "Consolidated school-wide summary of promotion outcomes.",
    },
    {
        code: "SF7",
        path: "sf7",
        icon: users,
        name: "School Personnel List",
        description:
            "Report of all teaching and non-teaching personnel, including position, status, and assignments.",
    },
    {
        code: "SF8",
        path: "sf8",
        icon: health,
        name: "Learner's Basic Health Profile",
        description:
            "Basic health and nutritional data for each enrolled learner.",
    },
    {
        code: "SF9",
        path: "sf9",
        icon: clipboard,
        name: "Learner Progress Report Card",
        description:
            "Official report card showing quarterly grades and remarks.",
    },
    {
        code: "SF10",
        path: "sf10",
        icon: academic,
        name: "Permanent Academic Record",
        description:
            "Cumulative academic record retained permanently by the school.",
    },
];

function SchoolFormCard({ form, onOpen, metrics, loading }) {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(form.path);
        }
    };

    const fileCount = metrics?.approved_count ?? 0;
    const templateCount = metrics?.template_count ?? 0;
    const dateLabel = metrics?.last_updated || null;

    return (
        <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e963f]"
            onClick={() => onOpen(form.path)}
            onKeyDown={handleKeyDown}
        >
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <img
                        src={form.icon}
                        alt=""
                        className="h-7 w-7 object-contain"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold">
                        {form.code}
                    </CardTitle>
                    <CardDescription>{form.name}</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {form.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                        <File className="h-4 w-4" />
                        <span className="my-auto">
                            {loading ? "…" : `${fileCount} file${fileCount !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    <div className="flex gap-1">
                        <FileStack className="h-4 w-4" />
                        <span className="my-auto">
                            {loading
                                ? "…"
                                : `${templateCount} template${templateCount !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    <div className="flex gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span className="my-auto">
                            {loading ? "…" : dateLabel || "No template"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const SchoolForms = () => {
    const navigate = useNavigate();
    const [summaryMap, setSummaryMap] = useState({});
    const [loading, setLoading] = useState(true);

    const loadSummary = useCallback(async () => {
        setLoading(true);
        try {
            const data = await GetSchoolFormsSummary();
            const map = {};
            (data?.forms || []).forEach((item) => {
                map[item.form_code] = item;
            });
            setSummaryMap(map);
        } catch (err) {
            console.error("Failed to load school forms summary:", err);
            setSummaryMap({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const openForm = (path) => navigate(`/school-forms/${path}`);

    return (
        <div className="grid gap-4">
            <CardHeader>
                <div className="flex gap-2">
                    <CardTitle className="text-3xl font-semibold">
                        School Forms
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="my-auto border-green-200 bg-green-50 text-green-700"
                    >
                        <BadgeCheck />
                        Official
                    </Badge>
                </div>
                <CardDescription>
                    Official DepEd Form of Tagnao Elementary School
                </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4">
                {SCHOOL_FORMS.map((form) => (
                    <SchoolFormCard
                        key={form.code}
                        form={form}
                        onOpen={openForm}
                        metrics={summaryMap[form.code]}
                        loading={loading}
                    />
                ))}
            </div>
            {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading form metrics…
                </div>
            )}
        </div>
    );
};

export default SchoolForms;