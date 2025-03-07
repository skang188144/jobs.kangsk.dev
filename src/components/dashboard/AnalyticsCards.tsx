import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { applicationAnalytics } from "@/utils/applicationStats";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { AnalyticsResult, StageTimes } from "@/utils/applicationStats";

export function TrendIndicator({ trend, changePercentage }: { trend: 'up' | 'down' | 'neutral', changePercentage?: number }) {
    const Icon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : MinusIcon;
    const color = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
    
    return (
        <div className={`flex items-center gap-1 ${color}`}>
            <Icon className="w-4 h-4" />
            {changePercentage !== undefined && (
                <span className="text-xs">{Math.abs(changePercentage).toFixed(1)}%</span>
            )}
        </div>
    );
}

export function AnalyticsCards() {
    const { user } = useUser();
    const [successMetrics, setSuccessMetrics] = useState<AnalyticsResult>({ value: 0 });
    const [velocity, setVelocity] = useState<AnalyticsResult>({ value: 0 });
    const [stageTimes, setStageTimes] = useState<StageTimes>({
        applied: 0,
        screen: 0,
        interview: 0,
        offer: 0
    });
    
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;

            const [times, vel] = await Promise.all([
                applicationAnalytics.getAverageTimeInStages(user),
                applicationAnalytics.getApplicationVelocity(user)
            ]);

            setStageTimes(times);
            setVelocity(vel);
            setSuccessMetrics(applicationAnalytics.getSuccessMetrics(user));
        };

        fetchAnalytics();
    }, [user]);

    if (!user) return null;

    // Calculate trend based on value vs target
    const getTrend = (value: number, target: number): 'up' | 'down' | 'neutral' => {
        if (value >= target) return 'up';
        if (value < target * 0.8) return 'down';
        return 'neutral';
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Success Rate Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Success Rate
                    </CardTitle>
                    <TrendIndicator 
                        trend={getTrend(successMetrics.value, successMetrics.target ?? 0)}
                        changePercentage={successMetrics.value}
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {successMetrics.value.toFixed(1)}%
                    </div>
                    <Progress 
                        value={successMetrics.value} 
                        className="mt-2"
                    />
                </CardContent>
            </Card>

            {/* Interview Success Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Interview Success
                    </CardTitle>
                    <TrendIndicator 
                        trend={getTrend(successMetrics.value, successMetrics.target ?? 0)}
                        changePercentage={successMetrics.value}
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {successMetrics.value.toFixed(1)}%
                    </div>
                    <Progress 
                        value={successMetrics.value} 
                        className="mt-2"
                    />
                </CardContent>
            </Card>

            {/* Application Velocity Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Weekly Applications
                    </CardTitle>
                    <TrendIndicator 
                        trend={getTrend(velocity.value, velocity.target ?? 0)}
                        changePercentage={velocity.value}
                    />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {velocity.value.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Target: {velocity.target} applications/week
                    </p>
                </CardContent>
            </Card>

            {/* Response Time Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Average Response Time
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stageTimes.screen} days
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        From application to first response
                    </p>
                </CardContent>
            </Card>
        </div>
    );
} 