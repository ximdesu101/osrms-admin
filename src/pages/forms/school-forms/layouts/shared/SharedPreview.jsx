import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { 
    Download, 
    Eye, 
    FileText, 
    Loader 
} from "lucide-react";
import { 
    GetTemplatePreview, 
    DownloadTemplate 
} from "@/services/templateService";

/**
 * @param {{
 *   formCode: string,
 *   formName: string,
 *   schoolYear?: string,
 *   lastUpdated?: string,
 *   previewDescription?: string,
 *   templateFileName?: string | null,
 *   hasTemplate?: boolean,
 *   loading?: boolean
 * }} props
 */
const SharedPreview = ({
    formCode,
    formName,
    schoolYear = "2026-2027",
    lastUpdated = "September 2026",
    previewDescription,
    templateFileName = null,
    hasTemplate = false,
    loading = false,
}) => {
    const [open, setOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(null);
    const [sheetData, setSheetData] = useState(null);

    const loadPreviewContent = useCallback(async () => {
        if (!hasTemplate || !formCode) {
            setSheetData(null);
            setPreviewError(null);
            return;
        }

        setPreviewLoading(true);
        setPreviewError(null);
        setSheetData(null);

        try {
            const data = await GetTemplatePreview(formCode);
            setSheetData(data);
        } catch (err) {
            console.error("Failed to load template preview:", err);
            setPreviewError(
                err.response?.data?.message ||
                "Could not load template content. The file may be missing or invalid."
            );
            setSheetData(null);
        } finally {
            setPreviewLoading(false);
        }
    }, [formCode, hasTemplate]);

    useEffect(() => {
        if (open) {
            loadPreviewContent();
        }
    }, [open, loadPreviewContent]);

    const handleDownload = async () => {
        if (!hasTemplate || downloading) return;
        setDownloading(true);
        try {
            const response = await DownloadTemplate(formCode);
            const blob = response.data;
            const disposition = response.headers?.["content-disposition"];
            let filename = templateFileName || `${formCode}_template.xlsx`;
            if (disposition) {
                const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                    disposition
                );
                if (match?.[1]) {
                    filename = match[1].replace(/['"]/g, "");
                }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Failed to download template. Please try again."
            );
        } finally {
            setDownloading(false);
        }
    };

    const cellStyle = (cell) => ({
        backgroundColor: cell.bgColor || "#ffffff",
        color: "black",
        fontWeight: cell.bold ? 600 : 400,
        fontStyle: cell.italic ? "italic" : "normal",
        fontSize: "14px",
        fontFamily: cell.fontFamily || undefined,
        textAlign: cell.align,
        verticalAlign: cell.valign,
        whiteSpace: cell.wrapText ? "normal" : "nowrap",
        borderTop: cell.borders?.top ? "1px solid #999" : "1px solid transparent",
        borderRight: cell.borders?.right ? "1px solid #999" : "1px solid transparent",
        borderBottom: cell.borders?.bottom ? "1px solid #999" : "1px solid transparent",
        borderLeft: cell.borders?.left ? "1px solid #999" : "1px solid transparent",
        padding: "4px 8px",
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" disabled={loading}>
                    <Eye />
                    Preview
                </Button>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-h-[85vh]"
            >
                <SheetHeader className="shrink-0">
                    <SheetTitle>
                        {formCode} - {formName}
                    </SheetTitle>
                    <SheetDescription>
                        School Year {schoolYear} • Updated {lastUpdated}
                        {sheetData?.sheetName ? ` • Sheet: ${sheetData.sheetName}` : ""}
                        {templateFileName ? ` • ${templateFileName}` : ""}
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-auto px-4 py-2">
                    {!hasTemplate && (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileText />
                                </EmptyMedia>
                                <EmptyTitle>Document Preview</EmptyTitle>
                                <EmptyDescription>
                                    {previewDescription ||
                                        `The official ${formCode} ${formName} template preview will be displayed here. Upload a template first.`}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {hasTemplate && previewLoading && (
                        <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader className="h-8 w-8 animate-spin" />
                            <p className="text-sm">Loading template content…</p>
                        </div>
                    )}

                    {hasTemplate && !previewLoading && previewError && (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileText />
                                </EmptyMedia>
                                <EmptyTitle>Unable to preview</EmptyTitle>
                                <EmptyDescription>{previewError}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    )}

                    {hasTemplate &&
                        !previewLoading &&
                        !previewError &&
                        sheetData &&
                        sheetData.rows.length === 0 && (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FileText />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {templateFileName || `${formCode} Template`}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        This spreadsheet has no visible data to
                                        display.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}

                    {hasTemplate &&
                        !previewLoading &&
                        !previewError &&
                        sheetData &&
                        sheetData.rows.length > 0 && (
                            <div className="overflow-auto rounded-md border">
                                <table
                                    style={{
                                        borderCollapse: "collapse",
                                        tableLayout: "fixed",
                                    }}
                                >
                                    <colgroup>
                                        {sheetData.columnWidths.map((w, i) => (
                                            <col key={i} style={{ width: `${w}px` }} />
                                        ))}
                                    </colgroup>
                                    <tbody>
                                        {sheetData.rows.map((row, rowIdx) => (
                                            <tr
                                                key={rowIdx}
                                                style={{ height: `${row.height}px` }}
                                            >
                                                {row.cells.map((cell, cellIdx) => (
                                                    <td
                                                        key={cellIdx}
                                                        colSpan={cell.colSpan}
                                                        rowSpan={cell.rowSpan}
                                                        style={cellStyle(cell)}
                                                    >
                                                        {cell.value}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>

                <SheetFooter className="shrink-0 flex gap-2 border-t pt-4">
                    <SheetClose asChild>
                        <Button variant="outline">Close Preview</Button>
                    </SheetClose>

                    <Button
                        variant="default"
                        disabled={!hasTemplate || downloading}
                        onClick={handleDownload}
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download />
                        )}
                        {downloading ? "Downloading…" : "Download Templates"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default SharedPreview;