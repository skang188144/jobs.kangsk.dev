import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { applicationAnalytics } from "@/utils/applicationStats";
import { useEffect, useState } from "react";
import { AnalyticsResult } from "@/utils/applicationStats";

export function ApplicationDistribution() {
    const { user } = useUser();
    const [dayStats, setDayStats] = useState<AnalyticsResult>({ value: 0 });

    useEffect(() => {
        const fetchDayStats = async () => {
            if (!user) return;
            const stats = await applicationAnalytics.getApplicationsByDayOfWeek(user);
            setDayStats(stats);
        };

        fetchDayStats();
    }, [user]);

    if (!user) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Daily Applications</span>
                        <span>{dayStats.value.toFixed(1)}</span>
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between font-medium">
                            <span>Target</span>
                            <span>{dayStats.target} applications/day</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {dayStats.value >= (dayStats.target ?? 0) 
                            ? "You're meeting your daily application target!"
                            : "Consider increasing your daily application rate to meet your target."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
} 