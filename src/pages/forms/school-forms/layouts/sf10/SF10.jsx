import SharedSFLayout from "../shared/SharedSFLayout";

const SF10_DATA = {
    formCode: "SF10",
    formName: "Permanent Academic Record",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF10 template for cumulative academic record retained permanently by the school.",
    templateFileSize: "167 KB",
    lastUpdated: "May 27, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 10 },
        { key: "version", title: "Current Version", value: "v6" },
        { key: "lastUpdated", title: "Last Updated", value: "May 27, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF10_Permanent_Academic_Record.xlsx",
            schoolYear: "2025-2026",
            version: "v6",
            uploadedDate: "05/27/2026",
            fileType: "Excel",
            fileSize: "678 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF10_Permanent_Academic_Record.xlsx",
            schoolYear: "2024-2025",
            version: "v5",
            uploadedDate: "04/20/2025",
            fileType: "Excel",
            fileSize: "645 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF10_Permanent_Academic_Record.xlsx",
            schoolYear: "2023-2024",
            version: "v4",
            uploadedDate: "03/18/2024",
            fileType: "Excel",
            fileSize: "612 KB",
            status: "Archived",
        },
    ],
};

const SF10 = () => {
    return <SharedSFLayout {...SF10_DATA} />;
};

export default SF10;