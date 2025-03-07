import { User } from "@/types/User";
import { ApplicationStatus } from "@/types/ApplicationStatus";
import { Application } from "@/types/Application";

export type MonthlyData = {
    total: number;
    pending: number;
    interviews: number;
    offers: number;
};

export type Statistics = {
    current: MonthlyData;
    monthlyChanges: MonthlyData;
    trends: {
        historicalData: MonthlyData[];
        successRate: number;
        interviewRate: number;
        offerRate: number;
        averageResponseTime: number; // in days
    };
};

function calculateMonthlyData(user: User | null, targetMonth: number): MonthlyData {
    if (!user) return { total: 0, pending: 0, interviews: 0, offers: 0 };

    // Helper function to count jobs that were in a specific status during the target month
    const countJobsInMonth = (jobIds: string[], status: string) => {
        // In a real implementation, you would:
        // 1. Fetch job details for each ID
        // 2. Check if the job status changed to this status during the target month
        // 3. Return the count
        return jobIds.length;
    };

    // Get the first day of the target month
    const targetDate = new Date();
    targetDate.setMonth(targetMonth);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);

    // Count applications for the target month
    return {
        total: user.total_applications,
        pending: countJobsInMonth(user.jobs.screen, 'screen'),
        interviews: countJobsInMonth(user.jobs.interview, 'interview'),
        offers: countJobsInMonth(user.jobs.offer, 'offer'),
    };
}

function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

function calculateSuccessRate(user: User | null): number {
    if (!user) return 0;
    const total = user.total_applications;
    const offers = user.jobs.offer.length;
    return total > 0 ? (offers / total) * 100 : 0;
}

function calculateInterviewRate(user: User | null): number {
    if (!user) return 0;
    const total = user.total_applications;
    const interviews = user.jobs.interview.length;
    return total > 0 ? (interviews / total) * 100 : 0;
}

function calculateOfferRate(user: User | null): number {
    if (!user) return 0;
    const interviews = user.jobs.interview.length;
    const offers = user.jobs.offer.length;
    return interviews > 0 ? (offers / interviews) * 100 : 0;
}

function getHistoricalTrends(user: User, months: number = 6): MonthlyData[] {
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: months }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return calculateMonthlyData(user, monthIndex);
    }).reverse(); // Return in chronological order
}

function calculateAverageResponseTime(user: User): number {
    // This is a placeholder. In a real implementation, you would:
    // 1. Get timestamps for when applications were submitted
    // 2. Get timestamps for first responses (screens/rejections)
    // 3. Calculate average time difference in days
    return 7; // Example: 7 days average response time
}

export function calculateUserStatistics(user: User | null): Statistics | null {
    if (!user) return null;

    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    // Get data for current and previous months
    const currentMonthData = calculateMonthlyData(user, currentMonth);
    const previousMonthData = calculateMonthlyData(user, previousMonth);

    // Calculate percentage changes
    const changes: MonthlyData = {
        total: calculatePercentageChange(
            currentMonthData.total,
            previousMonthData.total
        ),
        pending: calculatePercentageChange(
            currentMonthData.pending,
            previousMonthData.pending
        ),
        interviews: calculatePercentageChange(
            currentMonthData.interviews,
            previousMonthData.interviews
        ),
        offers: calculatePercentageChange(
            currentMonthData.offers,
            previousMonthData.offers
        ),
    };

    // Calculate additional trends and metrics
    const historicalData = getHistoricalTrends(user);
    const successRate = calculateSuccessRate(user);
    const interviewRate = calculateInterviewRate(user);
    const offerRate = calculateOfferRate(user);
    const averageResponseTime = calculateAverageResponseTime(user);

    return {
        current: currentMonthData,
        monthlyChanges: changes,
        trends: {
            historicalData,
            successRate,
            interviewRate,
            offerRate,
            averageResponseTime,
        },
    };
}

export interface AnalyticsResult {
    value: number;
    target?: number;
    trend?: number;
    label?: string;
}

export interface StageTimes {
    applied: number;
    screen: number;
    interview: number;
    offer: number;
}

// Utility functions for analyzing application data
export const applicationAnalytics = {
    getAverageTimeInStages: async (user: User | null): Promise<StageTimes> => {
        if (!user) {
            return {
                applied: 0,
                screen: 0,
                interview: 0,
                offer: 0
            };
        }

        // Get all applications for the user
        const response = await fetch('/api/applications?userId=' + user._id.toString());
        const applications: Application[] = await response.json();

        // Calculate average time in each stage
        const stageTimes = applications.reduce((acc, app) => {
            // Application review time (from applied to screen or final status)
            const screenDate = app.status_history.screen;
            const finalDate = app.final_status?.date;
            const endDate = screenDate || finalDate;
            if (endDate) {
                acc.applied += (endDate.getTime() - app.status_history.applied.getTime()) / (1000 * 60 * 60 * 24);
            }

            // Screen time (from screen to interview or final status)
            if (screenDate) {
                const interviewDate = app.status_history.interview;
                const endDate = interviewDate || finalDate;
                if (endDate) {
                    acc.screen += (endDate.getTime() - screenDate.getTime()) / (1000 * 60 * 60 * 24);
                }
            }

            // Interview time (from interview to offer or final status)
            if (app.status_history.interview) {
                const offerDate = app.status_history.offer;
                const endDate = offerDate || finalDate;
                if (endDate) {
                    acc.interview += (endDate.getTime() - app.status_history.interview.getTime()) / (1000 * 60 * 60 * 24);
                }
            }

            // Offer time (from offer to final status)
            if (app.status_history.offer && finalDate) {
                acc.offer += (finalDate.getTime() - app.status_history.offer.getTime()) / (1000 * 60 * 60 * 24);
            }

            return acc;
        }, { applied: 0, screen: 0, interview: 0, offer: 0 });

        // Calculate averages
        const totalApplications = applications.length;
        if (totalApplications > 0) {
            stageTimes.applied = Math.round(stageTimes.applied / totalApplications);
            stageTimes.screen = Math.round(stageTimes.screen / totalApplications);
            stageTimes.interview = Math.round(stageTimes.interview / totalApplications);
            stageTimes.offer = Math.round(stageTimes.offer / totalApplications);
        }

        return stageTimes;
    },

    getSuccessMetrics: (user: User | null): AnalyticsResult => {
        if (!user) {
            return { value: 0 };
        }

        const total = user.total_applications;
        const accepted = user.jobs.accepted.length;
        const successRate = total > 0 ? (accepted / total) * 100 : 0;

        return {
            value: Math.round(successRate),
            target: 20, // 20% success rate target
            label: "Success Rate"
        };
    },

    getApplicationVelocity: async (user: User | null): Promise<AnalyticsResult> => {
        if (!user) {
            return { value: 0 };
        }

        // Get all applications to calculate weeksActive
        const response = await fetch('/api/applications?userId=' + user._id.toString());
        const applications: Application[] = await response.json();

        // Calculate weeksActive from first application date
        const firstApplicationDate = applications.reduce((earliest, app) => {
            return app.status_history.applied < earliest ? app.status_history.applied : earliest;
        }, applications[0]?.status_history.applied ?? new Date());

        const weeksActive = Math.max(1, Math.ceil((new Date().getTime() - firstApplicationDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
        const applicationsPerWeek = user.total_applications / weeksActive;

        return {
            value: Math.round(applicationsPerWeek),
            target: 10, // Target of 10 applications per week
            label: "Weekly Applications"
        };
    },

    getApplicationsByDayOfWeek: async (user: User | null): Promise<AnalyticsResult> => {
        if (!user) {
            return { value: 0 };
        }

        // Get all applications to calculate actual daily average
        const response = await fetch('/api/applications?userId=' + user._id.toString());
        const applications: Application[] = await response.json();

        // Calculate average applications per day
        const firstApplicationDate = applications.reduce((earliest, app) => {
            return app.status_history.applied < earliest ? app.status_history.applied : earliest;
        }, applications[0]?.status_history.applied ?? new Date());

        const daysActive = Math.max(1, Math.ceil((new Date().getTime() - firstApplicationDate.getTime()) / (1000 * 60 * 60 * 24)));
        const averagePerDay = user.total_applications / daysActive;

        return {
            value: Math.round(averagePerDay),
            target: 2, // Target of 2 applications per day
            label: "Daily Applications"
        };
    },

    getCompanySuccessRate: async (user: User | null, companyId: string): Promise<AnalyticsResult> => {
        if (!user) {
            return { value: 0 };
        }

        // Get all applications for the user
        const response = await fetch('/api/applications?userId=' + user._id.toString());
        const applications: Application[] = await response.json();

        // Filter applications for the specific company
        const companyApplications = applications.filter(app => app.job_id.toString() === companyId);
        const totalApplications = companyApplications.length;

        if (totalApplications === 0) {
            return { value: 0 };
        }

        // Count successful applications (those with final_status ACCEPTED)
        const successfulApplications = companyApplications.filter(app => 
            app.final_status?.status === ApplicationStatus.ACCEPTED
        ).length;

        const successRate = (successfulApplications / totalApplications) * 100;

        return {
            value: Math.round(successRate),
            target: 20, // 20% success rate target
            label: "Company Success Rate"
        };
    },
}; 