import SharedSFLayout from "@/pages/forms/school-forms/layouts/shared/SharedSFLayout";

const DATA = {
    formCode: "LF",
    formName: "Leave Form",
    fileType: "Excel Spreadsheet",
    description: "template for employee leave request applications.",
    metrics: [
        { key: "totalFiles", title: "Total Files", value: 0 },
        { key: "version", title: "Total Templates", value: "0" },
        { key: "lastUpdated", title: "Last Updated", value: "—" },
    ],
};

const Page = () => {
    return <SharedSFLayout {...DATA} />;
};

export default Page;