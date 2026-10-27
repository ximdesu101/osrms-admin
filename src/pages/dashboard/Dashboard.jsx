import CardMetrics from './layout/CardMetrics';
import Calendar from './layout/DashboardCalendar';
import SubmissionRequestChart from './layout/SubmissionRequestChart';
import QuickAction from './layout/QuickAction';

const Dashboard = () => {
    return (
        <div className='grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
                <Calendar />
                <div className='grid gap-4'>
                    <CardMetrics />
                    <SubmissionRequestChart/>
                </div>
            </div>
            <QuickAction />
        </div>
    );
};

export default Dashboard;