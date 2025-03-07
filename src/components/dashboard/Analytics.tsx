import { AnalyticsCards } from "./AnalyticsCards";
import { ApplicationDistribution } from "./ApplicationDistribution";
import { StageTimelines } from "./StageTimelines";
import { CompanySuccess } from "./CompanySuccess";

export function Analytics() {
    return (
        <div className="space-y-4">
            <AnalyticsCards />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <ApplicationDistribution />
                <StageTimelines />
            </div>
            <CompanySuccess />
        </div>
    );
} 