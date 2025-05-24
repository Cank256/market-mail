import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MapPin, DollarSign, Clock, Mail } from "lucide-react"; // Added Clock and Mail

interface StatsOverviewProps {
  activeMarketsCount?: number;
  // Add other props here if/when API endpoints for them become available
  // e.g., contributorsCount?: number;
  // e.g., priceUpdatesCount?: number;
  // e.g., avgResponseTime?: string; 
}

export const StatsOverview = ({ activeMarketsCount }: StatsOverviewProps) => {
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
      value: "847", // Mock data: Requires API endpoint for actual contributor count
      description: "Farmers & enumerators",
      icon: Users,
      trend: "+23 this week", // Mock data
      color: "text-green-600"
    },
    {
      title: "Price Updates",
      value: "1,243", // Mock data: Requires API endpoint for recent price updates count
      description: "This month",
      icon: TrendingUp,
      trend: "+156 today", // Mock data
      color: "text-purple-600"
    },
    {
      title: "Avg. Response", // This likely refers to email processing or system response
      value: "2.3m", // Mock data: Requires operational metrics, not typically from market data API
      description: "Email to dashboard", // Clarified description
      icon: Clock, // Changed icon to Clock, Mail could also be an option
      trend: "98.7% uptime", // Mock data: Uptime is an operational metric
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
