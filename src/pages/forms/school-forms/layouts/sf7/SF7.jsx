import SharedSFLayout from "../shared/SharedSFLayout";

const SF7_DATA = {
    formCode: "SF7",
    formName: "School Personnel List",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF7 template for report of all teaching and non-teaching personnel, including position, status, and assignments.",
    templateFileSize: "76 KB",
    lastUpdated: "July 18, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 5 },
        { key: "version", title: "Current Version", value: "v2" },
        { key: "lastUpdated", title: "Last Updated", value: "Jul 18, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF7_School_Personnel_List.xlsx",
            schoolYear: "2025-2026",
            version: "v2",
            uploadedDate: "07/18/2026",
            fileType: "Excel",
            fileSize: "189 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF7_School_Personnel_List.xlsx",
            schoolYear: "2024-2025",
            version: "v1",
            uploadedDate: "06/05/2025",
            fileType: "Excel",
            fileSize: "175 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF7_School_Personnel_List.xlsx",
            schoolYear: "2023-2024",
            version: "v1",
            uploadedDate: "04/28/2024",
            fileType: "Excel",
            fileSize: "168 KB",
            status: "Archived",
        },
    ],
};

const SF7 = () => {
    return <SharedSFLayout {...SF7_DATA} />;
};

export default SF7;