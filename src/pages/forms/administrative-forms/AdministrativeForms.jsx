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
    Fingerprint,
    ClipboardCheck,
    Database,
    Plane,
    FileText,
    Megaphone,
    Send,
    Apple,
} from "lucide-react";
import { GetAdminFormsSummary } from "@/services/templateService";

const ADMINISTRATIVE_FORMS = [
    {
        code: "DTR",
        path: "dtr",
        icon: Fingerprint,
        name: "Biometrics and DTR",
        description:
            "Personnel biometrics and daily time record documents.",
    },
    {
        code: "ACR",
        path: "acr",
        icon: ClipboardCheck,
        name: "Activity Completion Report",
        description:
            "Report used to document completed school activities.",
    },
    {
        code: "TO",
        path: "to",
        icon: Plane,
        name: "Travel Order",
        description:
            "Authorization and location details for official travel.",
    },
    {
        code: "LF",
        path: "lf",
        icon: CalendarDays,
        name: "Leave Form",
        description:
            "Application form for employee leave requests.",
    },
    {
        code: "SO",
        path: "so",
        icon: FileText,
        name: "Special Order",
        description:
            "Request and authorization for required services.",
    },
    {
        code: "TRANSMITTAL",
        path: "transmittal",
        icon: Send,
        name: "Transmittal",
        description:
            "Covers district and division transmittal for document routing.",
    },
    {
        code: "SNSED",
        path: "snsed",
        icon: Megaphone,
        name: "Nationwide Simultaneous Earthquake Drill",
        description:
            "Nationwide Simultaneous Earthquake Drill documentation.",
    },
    {
        code: "DPDS",
        path: "dpds",
        icon: Database,
        name: "DepED Partnership Database System",
        description:
            "Records and manages school partnerships and stakeholder contributions.",
    },
    {
        code: "SBFP",
        path: "sbfp",
        icon: Apple,
        name: "SBFP – School-Based Feeding Program",
        description:
            "School-Based Feeding Program documentation, beneficiary records, and related reports.",
    },
];

function AdministrativeFormCard({ form, onOpen, metrics, loading }) {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(form.path);
        }
    };

    const fileCount = metrics?.approved_count ?? 0;
    const templateCount = metrics?.template_count ?? 0;
    const dateLabel = metrics?.last_updated || null;
    const Icon = form.icon;

    return (
        <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e963f]"
            onClick={() => onOpen(form.path)}
            onKeyDown={handleKeyDown}
        >
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#3e963f]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold">
                        {form.name}
                    </CardTitle>
                    <CardDescription>{form.code}</CardDescription>
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
                            {loading
                                ? "…"
                                : `${fileCount} file${fileCount !== 1 ? "s" : ""}`}
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

const AdministrativeForms = () => {
    const navigate = useNavigate();
    const [summaryMap, setSummaryMap] = useState({});
    const [loading, setLoading] = useState(true);

    const loadSummary = useCallback(async () => {
        setLoading(true);
        try {
            const data = await GetAdminFormsSummary();
            const map = {};
            (data?.forms || []).forEach((item) => {
                map[item.form_code] = item;
            });
            setSummaryMap(map);
        } catch (err) {
            console.error("Failed to load administrative forms summary:", err);
            setSummaryMap({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const openForm = (path) => navigate(`/admin-forms/${path}`);

    return (
        <div className="grid gap-4">
            <CardHeader>
                <div className="flex gap-2">
                    <CardTitle className="text-3xl font-semibold">
                        Administrative Forms
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
                    Administrative documents of Tagnao Elementary School
                </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-3 gap-4">
                {ADMINISTRATIVE_FORMS.map((form) => (
                    <AdministrativeFormCard
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

export default AdministrativeForms;