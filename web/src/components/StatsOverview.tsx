import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MapPin, DollarSign, Clock, Mail } from "lucide-react"; // Added Clock and Mail

interface StatsOverviewProps {
  activeMarketsCount?: number;
  contributorsCount?: number;
  priceUpdatesThisMonth?: number;
  avgResponseTime?: string;
  uptime?: string;
  newContributorsThisWeek?: number;
  priceUpdatesToday?: number;
}

export const StatsOverview = ({ 
  activeMarketsCount, 
  contributorsCount, 
  priceUpdatesThisMonth, 
  avgResponseTime, 
  uptime, 
  newContributorsThisWeek, 
  priceUpdatesToday 
}: StatsOverviewProps) => {
  const stats = [
    {
      title: "Active Markets",
      value: activeMarketsCount !== undefined ? activeMarketsCount.toString() : "...", // Show loading or default
      description: "Across Uganda & East Africa",
      icon: MapPin,
      trend: activeMarketsCount !== undefined && activeMarketsCount > 10 ? "+2 this week" : (activeMarketsCount !== undefined ? "" : "Loading..."), // Example trend logic
      color: "text-blue-600"
    },
    {
      title: "Contributors",
      value: contributorsCount !== undefined ? contributorsCount.toString() : "...",
      description: "Farmers & enumerators",
      icon: Users,
      trend: newContributorsThisWeek !== undefined ? `+${newContributorsThisWeek} this week` : "Loading...",
      color: "text-green-600"
    },
    {
      title: "Price Updates",
      value: priceUpdatesThisMonth !== undefined ? priceUpdatesThisMonth.toLocaleString() : "...",
      description: "This month",
      icon: TrendingUp,
      trend: priceUpdatesToday !== undefined ? `+${priceUpdatesToday} today` : "Loading...",
      color: "text-purple-600"
    },
    {
      title: "Avg. Response", // This refers to email processing or system response
      value: avgResponseTime !== undefined ? avgResponseTime : "...",
      description: "Email to dashboard", // Clarified description
      icon: Clock, // Changed icon to Clock, Mail could also be an option
      trend: uptime !== undefined ? `${uptime} uptime` : "Loading...",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mb-1">
              {stat.description}
            </p>
            <p className={`text-xs ${stat.color} font-medium`}>
              {stat.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
