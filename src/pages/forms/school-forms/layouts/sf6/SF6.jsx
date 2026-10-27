import SharedSFLayout from "../shared/SharedSFLayout";

const SF6_DATA = {
    formCode: "SF6",
    formName: "Summarized Report on Promotion",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF6 template for consolidated school-wide summary of promotion outcomes.",
    templateFileSize: "145 KB",
    lastUpdated: "July 24, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 7 },
        { key: "version", title: "Current Version", value: "v3" },
        { key: "lastUpdated", title: "Last Updated", value: "Jul 24, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF6_Summarized_Promotion_Report.xlsx",
            schoolYear: "2025-2026",
            version: "v3",
            uploadedDate: "07/24/2026",
            fileType: "Excel",
            fileSize: "156 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF6_Summarized_Promotion_Report.xlsx",
            schoolYear: "2024-2025",
            version: "v2",
            uploadedDate: "06/18/2025",
            fileType: "Excel",
            fileSize: "142 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF6_Summarized_Promotion_Report.xlsx",
            schoolYear: "2023-2024",
            version: "v1",
            uploadedDate: "05/22/2024",
            fileType: "Excel",
            fileSize: "138 KB",
            status: "Archived",
        },
    ],
};

const SF6 = () => {
    return <SharedSFLayout {...SF6_DATA} />;
};

export default SF6;