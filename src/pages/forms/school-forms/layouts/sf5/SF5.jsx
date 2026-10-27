import SharedSFLayout from "../shared/SharedSFLayout";

const SF5_DATA = {
    formCode: "SF5",
    formName: "Promotion Report",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF5 template for end-of-year report on learner promotions, retention, and dropouts.",
    templateFileSize: "203 KB",
    lastUpdated: "July 30, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 14 },
        { key: "version", title: "Current Version", value: "v5" },
        { key: "lastUpdated", title: "Last Updated", value: "Jul 30, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF5_Promotion_Report.xlsx",
            schoolYear: "2025-2026",
            version: "v5",
            uploadedDate: "07/30/2026",
            fileType: "Excel",
            fileSize: "421 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF5_Promotion_Report.xlsx",
            schoolYear: "2024-2025",
            version: "v4",
            uploadedDate: "06/20/2025",
            fileType: "Excel",
            fileSize: "398 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF5_Promotion_Report.xlsx",
            schoolYear: "2023-2024",
            version: "v3",
            uploadedDate: "05/15/2024",
            fileType: "Excel",
            fileSize: "375 KB",
            status: "Archived",
        },
    ],
};

const SF5 = () => {
    return <SharedSFLayout {...SF5_DATA} />;
};

export default SF5;