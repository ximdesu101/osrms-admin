import SharedSFLayout from "../shared/SharedSFLayout";

const SF1_DATA = {
    formCode: "SF1",
    formName: "School Register",
    fileType: "Excel Spreadsheet",
    description: "template for recording learner enrollment and basic school register information for SY 2026-2027.",
    templateFileSize: "124 KB",
    lastUpdated: "September 5, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 12 },
        { key: "version", title: "Total Templates", value: "1" },
        { key: "lastUpdated", title: "Last Updated", value: "Sep 5, 2026" },
    ],

    files: [
        {
            id: 1,
            filename: "SF1_School_Register.xlsx",
            schoolYear: "2025-2026",
            version: "v3",
            uploadedDate: "03/29/2026",
            fileType: "Excel",
            fileSize: "245 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF1_School_Register.xlsx",
            schoolYear: "2024-2025",
            version: "v2",
            uploadedDate: "06/15/2025",
            fileType: "Excel",
            fileSize: "231 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF1_School_Register.xlsx",
            schoolYear: "2023-2024",
            version: "v1",
            uploadedDate: "05/20/2024",
            fileType: "Excel",
            fileSize: "218 KB",
            status: "Archived",
        },
    ],
};

const SF1 = () => {
    return <SharedSFLayout {...SF1_DATA} />;
};

export default SF1;