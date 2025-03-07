import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { applicationAnalytics } from "@/utils/applicationStats";
import { useEffect, useState } from "react";
import { StageTimes } from "@/utils/applicationStats";

export function StageTimelines() {
    const { user } = useUser();
    const [stageTimes, setStageTimes] = useState<StageTimes>({
        applied: 0,
        screen: 0,
        interview: 0,
        offer: 0
    });

    useEffect(() => {
        const fetchStageTimes = async () => {
            if (!user) return;
            const times = await applicationAnalytics.getAverageTimeInStages(user);
            setStageTimes(times);
        };

        fetchStageTimes();
    }, [user]);

    if (!user) {
        return null;
    }

    const totalDays = stageTimes.applied + stageTimes.screen + stageTimes.interview + stageTimes.offer;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Application Review</span>
                        <span>{stageTimes.applied} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Screen</span>
                        <span>{stageTimes.screen} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Interview</span>
                        <span>{stageTimes.interview} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Offer</span>
                        <span>{stageTimes.offer} days</span>
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between font-medium">
                            <span>Total Time</span>
                            <span>{totalDays} days</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 