import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/Overview";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Analytics } from "@/components/dashboard/Analytics";

export default function Dashboard() {
    const { user, isLoading, statistics } = useUser();

    if (isLoading) {
        return (
            <ContentLayout title="Dashboard">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <Skeleton className="h-9 w-[150px]" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {Array(4).fill(0).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-5 w-[120px]" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-[60px]" />
                                    <Skeleton className="h-4 w-[100px] mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </ContentLayout>
        );
    }

    if (!user) {
        return (
            <ContentLayout title="Dashboard">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-center h-[50vh]">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold tracking-tight">User Not Found</h2>
                            <p className="text-muted-foreground mt-2">Please try refreshing the page or contact support.</p>
                        </div>
                    </div>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Dashboard">
            <div className="flex-1 space-y-8 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.current.total}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics?.monthlyChanges.total}% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.current.pending}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics?.monthlyChanges.pending}% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Interviews Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.current.interviews}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics?.monthlyChanges.interviews}% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Offers Received
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics?.current.offers}</div>
                            <p className="text-xs text-muted-foreground">
                                +{statistics?.monthlyChanges.offers}% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RecentApplications />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h3 className="text-2xl font-semibold tracking-tight mb-4">Detailed Analytics</h3>
                    <Analytics />
                </div>
            </div>
        </ContentLayout>
    );
}
