import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUser } from "@/contexts/UserContext";

export function Overview() {
    const { statistics } = useUser();

    if (!statistics) {
        return (
            <div className="flex items-center justify-center h-[350px]">
                <p className="text-muted-foreground">No data available</p>
            </div>
        );
    }

    // Transform historical data into chart format
    const data = statistics.trends.historicalData.map((monthData, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (statistics.trends.historicalData.length - 1 - index));
        
        // Only show data for January and February 2025
        if (date.getFullYear() !== 2025 || (date.getMonth() !== 0 && date.getMonth() !== 1)) {
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                total: 0,
                pending: 0,
                interviews: 0,
                offers: 0,
            };
        }
        
        return {
            name: date.toLocaleString('default', { month: 'short' }),
            total: monthData.total,
            pending: monthData.pending,
            interviews: monthData.interviews,
            offers: monthData.offers,
        };
    });

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Applications"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="offers"
                    name="Offers"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
} 