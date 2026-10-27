import SharedSFLayout from "@/pages/forms/school-forms/layouts/shared/SharedSFLayout";

const DATA = {
    formCode: "TO",
    formName: "Travel Order",
    fileType: "Excel Spreadsheet",
    description: "template for authorization and location details for official travel.",
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