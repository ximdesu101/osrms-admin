import SharedSFLayout from "../shared/SharedSFLayout";

const SF8_DATA = {
    formCode: "SF8",
    formName: "Learner's Basic Health Profile",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "Official SF8 template for basic health and nutritional data for each enrolled learner.",
    templateFileSize: "189 KB",
    lastUpdated: "June 29, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 11 },
        { key: "version", title: "Current Version", value: "v4" },
        { key: "lastUpdated", title: "Last Updated", value: "Jun 29, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF8_Learner_Health_Profile.xlsx",
            schoolYear: "2025-2026",
            version: "v4",
            uploadedDate: "06/29/2026",
            fileType: "Excel",
            fileSize: "356 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF8_Learner_Health_Profile.xlsx",
            schoolYear: "2024-2025",
            version: "v3",
            uploadedDate: "05/14/2025",
            fileType: "Excel",
            fileSize: "342 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF8_Learner_Health_Profile.xlsx",
            schoolYear: "2023-2024",
            version: "v2",
            uploadedDate: "04/10/2024",
            fileType: "Excel",
            fileSize: "328 KB",
            status: "Archived",
        },
    ],
};

const SF8 = () => {
    return <SharedSFLayout {...SF8_DATA} />;
};

export default SF8;