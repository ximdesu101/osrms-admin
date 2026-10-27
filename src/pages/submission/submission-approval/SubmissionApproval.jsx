import CardMetrics from "@/pages/submission/submission-approval/layout/CardMetrics";
import SubmissionTable from "@/pages/submission/submission-approval/layout/SubmissionApprovalTable";
const SubmissionApproval = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <CardMetrics/>
            <SubmissionTable />
        </div>
    )
}

export default SubmissionApproval