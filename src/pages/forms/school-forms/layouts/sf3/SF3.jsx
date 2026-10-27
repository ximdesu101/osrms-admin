import SharedSFLayout from "../shared/SharedSFLayout";

const SF3_DATA = {
    formCode: "SF3",
    formName: "Books Issued and Returned",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF3 template for tracking textbooks and instructional materials issued to learners.",
    templateFileSize: "156 KB",
    lastUpdated: "August 21, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 6 },
        { key: "version", title: "Current Version", value: "v4" },
        { key: "lastUpdated", title: "Last Updated", value: "Aug 21, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF3_Books_Issued_Returned.xlsx",
            schoolYear: "2025-2026",
            version: "v4",
            uploadedDate: "08/21/2026",
            fileType: "Excel",
            fileSize: "198 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF3_Books_Issued_Returned.xlsx",
            schoolYear: "2024-2025",
            version: "v3",
            uploadedDate: "05/12/2025",
            fileType: "Excel",
            fileSize: "185 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF3_Books_Issued_Returned.xlsx",
            schoolYear: "2023-2024",
            version: "v2",
            uploadedDate: "04/18/2024",
            fileType: "Excel",
            fileSize: "172 KB",
            status: "Archived",
        },
    ],
};

const SF3 = () => {
    return <SharedSFLayout {...SF3_DATA} />;
};

export default SF3;