import { useState, useCallback } from "react";
import SharedCardMetrics from "./SharedCardMetrics";
import SharedTemplates from "./SharedTemplates";
import SharedTable from "./SharedTable";
import { GetTemplates } from "@/services/templateService";

/**
 * Shared layout for all School Forms (SF1–SF10).
 * Metrics:
 * - totalFiles  → live count of approved teacher submissions for this form
 * - version     → live count of uploaded templates (Templates card)
 * - lastUpdated → live last-updated date of the official template (blank if none)
 */
const SharedSFLayout = ({
    formCode,
    formName,
    schoolYear,
    fileType,
    description,
    currentVersion,
    templateFileSize,
    lastUpdated,
    versions,
    metrics: initialMetrics,
}) => {
    const [approvedCount, setApprovedCount] = useState(null);
    const [templateCount, setTemplateCount] = useState(null);
    const [templateLastUpdated, setTemplateLastUpdated] = useState(null);
    const [templateLoaded, setTemplateLoaded] = useState(false);

    const handleCountChange = useCallback((count) => {
        setApprovedCount(count);
    }, []);

    const handleTemplateCountChange = useCallback((count) => {
        setTemplateCount(count);
    }, []);

    const handleTemplateChange = useCallback(async (template) => {
        setTemplateLoaded(true);
        if (template?.updated_at || template?.last_updated) {
            setTemplateLastUpdated(
                template.updated_at || template.last_updated
            );
        } else {
            setTemplateLastUpdated(null);
        }
        if (formCode) {
            try {
                const list = await GetTemplates(formCode);
                setTemplateCount(Array.isArray(list) ? list.length : 0);
            } catch {
                setTemplateCount(0);
            }
        }
    }, [formCode]);

    const formatMetricDate = (value) => {
        if (!value) return null;
        try {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) {
                return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
            }
        } catch {
            return null;
        }
        return value;
    };

    const metrics = (initialMetrics || []).map((m) => {
        if (m.key === "totalFiles") {
            if (approvedCount !== null) {
                return { ...m, value: approvedCount };
            }
            return { ...m, value: "…" };
        }

        if (m.key === "version") {
            return {
                ...m,
                title: "Templates",
                value: templateCount !== null ? templateCount : "…",
            };
        }

        if (m.key === "lastUpdated") {
            if (!templateLoaded) {
                return { ...m, value: "…" };
            }
            if (templateLastUpdated) {
                return {
                    ...m,
                    value: formatMetricDate(templateLastUpdated) || "—",
                };
            }
            return { ...m, value: "No template" };
        }

        return m;
    });

    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <SharedTemplates
                    formCode={formCode}
                    formName={formName}
                    schoolYear={schoolYear}
                    fileType={fileType}
                    description={description}
                    templateFileSize={templateFileSize}
                    currentVersion={currentVersion}
                    lastUpdated={lastUpdated}
                    versions={versions}
                    onTemplateChange={handleTemplateChange}
                />
                <SharedCardMetrics metrics={metrics} />
            </div>
            <SharedTable
                formCode={formCode}
                formName={formName}
                onCountChange={handleCountChange}
                onTemplateCountChange={handleTemplateCountChange}
                onTemplateActivated={handleTemplateChange}
            />
        </div>
    );
};

export default SharedSFLayout;