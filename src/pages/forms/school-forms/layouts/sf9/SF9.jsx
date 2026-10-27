import SharedSFLayout from "../shared/SharedSFLayout";

const SF9_DATA = {
    formCode: "SF9",
    formName: "Learner Progress Report Card",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF9 template for report card showing quarterly grades and remarks.",
        templateFileSize: "112 KB",
    lastUpdated: "June 12, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 18 },
        { key: "version", title: "Current Version", value: "v3" },
        { key: "lastUpdated", title: "Last Updated", value: "Jun 12, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF9_Learner_Progress_Report_Card.xlsx",
            schoolYear: "2025-2026",
            version: "v3",
            uploadedDate: "06/12/2026",
            fileType: "Excel",
            fileSize: "512 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF9_Learner_Progress_Report_Card.xlsx",
            schoolYear: "2024-2025",
            version: "v2",
            uploadedDate: "05/28/2025",
            fileType: "Excel",
            fileSize: "487 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF9_Learner_Progress_Report_Card.xlsx",
            schoolYear: "2023-2024",
            version: "v1",
            uploadedDate: "04/15/2024",
            fileType: "Excel",
            fileSize: "465 KB",
            status: "Archived",
        },
    ],
};

const SF9 = () => {
    return <SharedSFLayout {...SF9_DATA} />;
};

export default SF9;