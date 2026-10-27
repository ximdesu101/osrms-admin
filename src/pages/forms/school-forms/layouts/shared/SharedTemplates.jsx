import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Upload,
    Scaling,
    BadgeCheck,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import SharedPreview from "./SharedPreview";
import { GetTemplate, UploadTemplate } from "@/services/templateService";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];
const ACCEPTED_MIME_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

const isValidExcelFile = (file) => {
    if (!file) return false;
    const name = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
        name.endsWith(ext)
    );
    const hasValidMime =
        !file.type ||
        ACCEPTED_MIME_TYPES.includes(file.type) ||
        file.type === "application/octet-stream";
    return hasValidExtension && hasValidMime;
};

const SharedTemplates = ({
    formCode,
    formName,
    schoolYear = "2026-2027",
    fileType = "Excel Spreadsheet",
    description,
    templateFileSize,
    lastUpdated = "September 5, 2026",
    onTemplateChange,
}) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [template, setTemplate] = useState(null);

    const hasTemplate = Boolean(template);
    const displayFileSize =
        template?.file_size_formatted || (hasTemplate ? "—" : "—");
    // Never fall back to the static SF page date — show blank/message when no template
    const displayLastUpdated = loading
        ? "…"
        : template?.last_updated || "No template uploaded";
    const templateFileName = template?.original_name || null;

    const loadTemplate = useCallback(async () => {
        if (!formCode) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await GetTemplate(formCode);
            setTemplate(data);
            onTemplateChange?.(data);
        } catch (err) {
            console.error("Failed to load template:", err);
            // Keep UI usable; fall back to prop defaults
            setTemplate(null);
            onTemplateChange?.(null);
        } finally {
            setLoading(false);
        }
    }, [formCode, onTemplateChange]);

    useEffect(() => {
        loadTemplate();
    }, [loadTemplate]);

    const handleUploadClick = () => {
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!isValidExcelFile(file)) {
            toast.error(
                "Invalid file type. Please upload an Excel file (.xlsx or .xls) only."
            );
            return;
        }

        setUploading(true);
        try {
            const result = await UploadTemplate(formCode, file);
            setTemplate(result.template);
            onTemplateChange?.(result.template ?? null);
            toast.success(
                result.message ||
                    (hasTemplate
                        ? "Template updated successfully."
                        : "Template uploaded successfully.")
            );
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.errors?.file?.[0] ||
                "Failed to upload template. Please try again.";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const buttonLabel = hasTemplate ? "Update Template" : "Upload Template";

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle className="text-lg">
                        {formCode} {formName} Template
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="my-auto border-green-200 bg-green-50 text-green-700"
                    >
                        <BadgeCheck />
                        Official
                    </Badge>
                </div>
                <CardDescription className="text-xs">{fileType}</CardDescription>

                <CardDescription className="text-md">{description}</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex gap-2">
                    <SharedPreview
                        formCode={formCode}
                        formName={formName}
                        schoolYear={schoolYear}
                        lastUpdated={displayLastUpdated}
                        templateFileName={templateFileName}
                        hasTemplate={hasTemplate}
                        loading={loading}
                    />
                    <Button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={uploading || loading}
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        {uploading ? "Uploading…" : buttonLabel}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="mt-5 flex justify-between">
                    <span className="flex gap-1 text-xs text-muted-foreground">
                        <Scaling className="h-3 w-3 my-auto" />
                        File Size: {loading ? "…" : displayFileSize}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Last updated: {loading ? "…" : displayLastUpdated}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export default SharedTemplates;