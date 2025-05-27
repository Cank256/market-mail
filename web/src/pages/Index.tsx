import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mail, MapPin, Calendar, Locate, Zap } from "lucide-react";
import { PriceChart } from "@/components/PriceChart";
import { MarketTable } from "@/components/MarketTable";
import { StatsOverview } from "@/components/StatsOverview";
import { EmailInstructions } from "@/components/EmailInstructions";
import { CountryDropdown } from "@/components/CountryDropdown";
import { MarketDetailCard } from "@/components/MarketDetailCard"; // Import the new component
import { fetchMarkets, fetchLatestMarketsActivity, fetchPlatformStatistics } from "@/services/api"; // Import API service functions

interface MarketInfo {
  name: string;
  // Add other properties if your API provides more details about markets themselves
}

interface MarketActivityItem {
  market: string;
  lastReportedAt: string; // ISO date string
}

// Helper function to format time difference
const formatTimeAgo = (isoDateString: string) => {
  if (!isoDateString) return 'N/A'; // Handle cases where date might be missing
  const date = new Date(isoDateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Index = () => {
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [selectedCountry, setSelectedCountry] = useState("uganda");
  const [availableMarkets, setAvailableMarkets] = useState<MarketInfo[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleString());
  const [marketActivityData, setMarketActivityData] = useState<MarketActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);
  
  // Statistics state
  const [statistics, setStatistics] = useState<{
    contributorsCount?: number;
    priceUpdatesCount?: number;
    priceUpdatesThisMonth?: number;
    avgResponseTime?: string;
    uptime?: string;
    newContributorsThisWeek?: number;
    priceUpdatesToday?: number;
    activeMarketsCount?: number;
  }>({});

  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const marketsData = await fetchMarkets();
        const marketsArray = marketsData.map((market: string | { name?: string; market?: string }) => ({ 
          name: typeof market === 'string' ? market : (market.name || market.market || 'Unknown Market') 
        }));
        setAvailableMarkets(marketsArray.filter(m => m.name && m.name !== 'Unknown Market'));
      } catch (error) {
        console.error("Error fetching markets:", error);
        setAvailableMarkets([]);
      }
    };
    
    const loadMarketActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);
      try {
        const result = await fetchLatestMarketsActivity();
        if (result.success && Array.isArray(result.data)) {
          // Process data to find the latest update per market
          // API returns: { market: string, product: string, price: number, lastReportedAt: string }[]
          const latestActivityByMarket: { [key: string]: string } = {};
          result.data.forEach((item: { market?: string; lastReportedAt?: string }) => {
            if (item.market && item.lastReportedAt) {
              if (!latestActivityByMarket[item.market] || new Date(item.lastReportedAt) > new Date(latestActivityByMarket[item.market])) {
                latestActivityByMarket[item.market] = item.lastReportedAt;
              }
            }
          });

          const activity = Object.entries(latestActivityByMarket)
            .map(([market, lastReportedAt]) => ({ market, lastReportedAt }))
            .sort((a, b) => new Date(b.lastReportedAt).getTime() - new Date(a.lastReportedAt).getTime()); 

          setMarketActivityData(activity);

          // Update the general "lastUpdated" timestamp if desired, e.g., from the most recent item
          if (activity.length > 0 && activity[0].lastReportedAt) {
            setLastUpdated(new Date(activity[0].lastReportedAt).toLocaleString());
          }
        } else {
          console.error("Failed to fetch market activity or data is not an array:", result.message);
          setMarketActivityData([]);
          setActivityError("Failed to load activity data.");
        }
      } catch (error) {
        console.error("Error fetching market activity:", error);
        setMarketActivityData([]);
        setActivityError("An error occurred while fetching activity.");
      } finally {
        setActivityLoading(false);
      }
    };

    const loadStatistics = async () => {
      try {
        const result = await fetchPlatformStatistics();
        if (result.success && result.data) {
          setStatistics(result.data);
        } else {
          console.error("Failed to fetch platform statistics:", result.message);
        }
      } catch (error) {
        console.error("Error fetching platform statistics:", error);
      }
    };

    loadMarkets();
    loadMarketActivity();
    loadStatistics();
  }, []);

  const handleLocateMarket = (marketName: string, country: string) => {
    console.log(`Locating ${marketName} market in ${country}`);
    // Create Google Maps search URL with market name and country
    const searchQuery = encodeURIComponent(`${marketName} market ${country}`);
    const mapsUrl = `https://maps.google.com/maps?q=${searchQuery}`;
    
    // Open in new tab
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MarketMail</h1>
                <p className="text-sm text-gray-600">Crowdsourced Produce Price Exchange</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                📈 Live Data
              </Badge>
              <CountryDropdown selectedCountry={selectedCountry} onCountryChange={setSelectedCountry} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <StatsOverview 
          activeMarketsCount={statistics.activeMarketsCount || availableMarkets.length}
          contributorsCount={statistics.contributorsCount}
          priceUpdatesThisMonth={statistics.priceUpdatesThisMonth}
          priceUpdatesCount={statistics.priceUpdatesCount}
          avgResponseTime={statistics.avgResponseTime}
          uptime={statistics.uptime}
          newContributorsThisWeek={statistics.newContributorsThisWeek}
          priceUpdatesToday={statistics.priceUpdatesToday}
        />

        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {availableMarkets.map(market => (
                  <SelectItem key={market.name} value={market.name}>{market.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated}
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="contribute">Contribute</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Price Trends
                  </CardTitle>
                  <CardDescription>
                    Price movements for {selectedMarket === 'all' ? 'all markets' : selectedMarket}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PriceChart selectedMarket={selectedMarket} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-blue-600" /> {/* Changed icon */}
                    Market Activity
                  </CardTitle>
                  <CardDescription>
                    Latest submissions by market
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading && <p>Loading activity...</p>}
                  {activityError && <p className="text-red-500">{activityError}</p>}
                  {!activityLoading && !activityError && marketActivityData.length === 0 && <p>No market activity to display.</p>}
                  {!activityLoading && !activityError && marketActivityData.length > 0 && (
                    <div className="space-y-3">
                      {marketActivityData.slice(0, 5).map((activity) => (
                        <div key={activity.market} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            {/* Conditional pulse: green and pulsing if recent (e.g., < 5min), yellow otherwise */}
                            <div className={`w-2 h-2 rounded-full ${new Date().getTime() - new Date(activity.lastReportedAt).getTime() < 5 * 60 * 1000 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                            <span className="font-medium text-sm">{activity.market}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(activity.lastReportedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <MarketTable selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            {availableMarkets.length === 0 && !activityLoading && (
              <p>No markets available to display. Check back later or ensure the API is running.</p>
            )}
            {activityLoading && availableMarkets.length === 0 && (
                 <div className="flex justify-center items-center min-h-[200px]">
                    <p>Loading market data...</p>
                 </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableMarkets.map(market => (
                <MarketDetailCard 
                  key={market.name} 
                  marketName={market.name} 
                  onLocateMarket={handleLocateMarket} 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>
                  Comprehensive view of price movements for {selectedMarket === 'all' ? 'selected markets' : selectedMarket}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceChart selectedMarket={selectedMarket} showDetailed={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contribute" className="space-y-6">
            <EmailInstructions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
