import SharedSFLayout from "../shared/SharedSFLayout";

const SF2_DATA = {
    formCode: "SF2",
    formName: "Daily Attendance Report",
    schoolYear: "2026-2027",
    fileType: "Excel Spreadsheet",
    description: "School Form 2 template for monthly daily learner attendance per section.",
    templateFileSize: "98 KB",
    lastUpdated: "August 28, 2026",

    metrics: [
        { key: "totalFiles", title: "Total Files", value: 12 },
        { key: "version", title: "Current Version", value: "v2" },
        { key: "lastUpdated", title: "Last Updated", value: "Aug 28, 2026" },
    ],
    files: [
        {
            id: 1,
            filename: "SF2_Daily_Attendance_Report.xlsx",
            schoolYear: "2025-2026",
            version: "v2",
            uploadedDate: "08/28/2026",
            fileType: "Excel",
            fileSize: "312 KB",
            status: "Current",
        },
        {
            id: 2,
            filename: "SF2_Daily_Attendance_Report.xlsx",
            schoolYear: "2024-2025",
            version: "v1",
            uploadedDate: "07/10/2025",
            fileType: "Excel",
            fileSize: "298 KB",
            status: "Archived",
        },
        {
            id: 3,
            filename: "SF2_Daily_Attendance_Report_June.xlsx",
            schoolYear: "2024-2025",
            version: "v1",
            uploadedDate: "06/30/2025",
            fileType: "Excel",
            fileSize: "285 KB",
            status: "Archived",
        },
    ],
};

const SF2 = () => {
    return <SharedSFLayout {...SF2_DATA} />;
};

export default SF2;