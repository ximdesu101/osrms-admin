import CardMetrics from "./layout/CardMetrics";
import SubmissionRequestTable from "./layout/SubmissionRequestTable";
const SubmissionRequest = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <CardMetrics />
            <SubmissionRequestTable />
        </div>
    )
}

export default SubmissionRequest