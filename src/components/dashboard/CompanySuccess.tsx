import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { applicationAnalytics } from "@/utils/applicationStats";
import { useEffect, useState } from "react";
import { AnalyticsResult } from "@/utils/applicationStats";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Company {
    id: string;
    name: string;
}

function CompanySuccessCard({ company }: { company: Company }) {
    const { user } = useUser();
    const [stats, setStats] = useState<AnalyticsResult>({ value: 0 });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompanyStats = async () => {
            if (!user) return;
            try {
                const companyStats = await applicationAnalytics.getCompanySuccessRate(user, company.id);
                setStats(companyStats);
                setError(null);
            } catch (err) {
                setError('Failed to load company statistics');
                console.error('Error fetching company stats:', err);
            }
        };

        fetchCompanyStats();
    }, [user, company.id]);

    if (!user) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{company.name}</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Success Rate</span>
                            <span>{stats.value.toFixed(1)}%</span>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between font-medium">
                                <span>Target</span>
                                <span>{stats.target}%</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {stats.value >= (stats.target ?? 0) 
                                ? "You're performing well with this company!"
                                : "Consider improving your application strategy for this company."}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function CompanySuccess() {
    const { user } = useUser();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!user) return;
            
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/applications?userId=' + user._id.toString());
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Response was not JSON");
                }

                const applications = await response.json();

                // Get unique companies from applications
                const uniqueCompanies = new Map<string, Company>();
                applications.forEach((app: any) => {
                    if (app.company_id && !uniqueCompanies.has(app.company_id)) {
                        uniqueCompanies.set(app.company_id, {
                            id: app.company_id,
                            name: app.company_name || 'Unknown Company'
                        });
                    }
                });

                setCompanies(Array.from(uniqueCompanies.values()));
            } catch (err) {
                setError('Failed to load companies');
                console.error('Error fetching companies:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, [user]);

    if (!user) return null;

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Company Success Rates</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : isLoading ? (
                    <div className="text-center py-4">Loading companies...</div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                        No companies found in your applications
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {companies.map((company) => (
                            <CompanySuccessCard key={company.id} company={company} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 