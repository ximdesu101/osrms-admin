import CardMetrics from "./layout/CardMetrics";
import DocumentRequestTable from "./layout/DocumentRequestTable";

const DocumentRequests = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <CardMetrics />
            <DocumentRequestTable />
        </div>
    );
};

export default DocumentRequests;
