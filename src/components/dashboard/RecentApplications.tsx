import { useUser } from "@/contexts/UserContext";
import { ApplicationStatus } from "@/types/ApplicationStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Application } from "@/types/Application";

export function RecentApplications() {
    const { user } = useUser();
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            
            // Get all job IDs from all status arrays
            const allJobIds = new Set([
                ...user.jobs.applied,
                ...user.jobs.screen,
                ...user.jobs.interview,
                ...user.jobs.offer,
                ...user.jobs.accepted,
                ...user.jobs.rejected,
                ...user.jobs.withdrawn
            ]);

            // Fetch applications for all job IDs
            const response = await fetch('/api/applications?jobIds=' + Array.from(allJobIds).join(','));
            const data = await response.json();
            setApplications(data);
        };

        fetchApplications();
    }, [user]);

    const recentApplications = applications
        .sort((a, b) => b.status_history.applied.getTime() - a.status_history.applied.getTime())
        .slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentApplications.map((app) => (
                        <div key={app._id.toString()} className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Job ID: {app.job_id.toString()}</p>
                                <p className="text-sm text-gray-500">
                                    Applied: {app.status_history.applied.toLocaleDateString()}
                                </p>
                            </div>
                            <Badge variant={
                                app.final_status?.status === ApplicationStatus.ACCEPTED ? "default" :
                                app.final_status?.status === ApplicationStatus.REJECTED ? "destructive" :
                                "outline"
                            }>
                                {app.final_status?.status ?? ApplicationStatus.APPLIED}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 