import { Link } from "react-router-dom";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle
} from "@/components/ui/card";
import { 
    Zap, 
    Users, 
    SquareText,
    ClipboardList,
    Send,
} from 'lucide-react';

const actions = [
    { 
        label: "Teacher Accounts",   
        icon: Users, 
        path: "/teacher-account",
    },
    { 
        label: "School Forms",  
        icon: SquareText,  
        path: "/forms",
    },
    { 
        label: "Document Requests",  
        icon: ClipboardList,  
        path: "/document-requests",
    },
    { 
        label: "Submission Requests",  
        icon: Send,  
        path: "/submission-requests",
    },
];

function QuickAction() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-1">
                    <Zap className="w-4 h-4 my-auto" /> Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
                {actions.map(({ label, icon: Icon, path }) => (
                    <Link
                        key={label}
                        to={path}
                        className="flex-1 flex flex-col items-center gap-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-center"
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

export default QuickAction;
