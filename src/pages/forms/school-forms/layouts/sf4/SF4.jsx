import SharedSFLayout from "../shared/SharedSFLayout";

const SF4_DATA = {
    formCode: "SF4",
    formName: "Monthly Movement Report",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF4 template for recording learner enrollment changes throughout the school year.",
    templateFileSize: "87 KB",
    lastUpdated: "August 15, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 9 },
        { key: "version", title: "Current Version", value: "v2" },
        { key: "lastUpdated", title: "Last Updated", value: "Aug 15, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF4_Monthly_Movement_Report.xlsx",
            schoolYear: "2025-2026",
            version: "v2",
            uploadedDate: "08/15/2026",
            fileType: "Excel",
            fileSize: "267 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF4_Monthly_Movement_Report.xlsx",
            schoolYear: "2024-2025",
            version: "v1",
            uploadedDate: "09/05/2025",
            fileType: "Excel",
            fileSize: "254 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF4_Monthly_Movement_July.xlsx",
            schoolYear: "2024-2025",
            version: "v1",
            uploadedDate: "07/31/2025",
            fileType: "Excel",
            fileSize: "241 KB",
            status: "Archived",
        },
    ],
};

const SF4 = () => {
    return <SharedSFLayout {...SF4_DATA} />;
};

export default SF4;