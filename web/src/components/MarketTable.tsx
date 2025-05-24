import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLatestMarketPrices, fetchMarkets } from "../services/api";

// Define interfaces based on actual API response
interface PriceItem {
  product: string;
  unit: string;
  price: number;
}

interface MarketPriceData {
  _id: string; 
  market: string;
  date: string; 
  priceItems: PriceItem[];
}

interface MarketTableProps {
  selectedMarket?: string;
}

export const MarketTable = ({ selectedMarket }: MarketTableProps) => {
  const [marketData, setMarketData] = useState<MarketPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (selectedMarket && selectedMarket !== "all") {
          // Fetch data for specific market
          const data = await fetchLatestMarketPrices(selectedMarket);
          setMarketData([data]);
        } else {
          // For "all" markets, we need to fetch all markets first, then get latest prices for each
          const markets = await fetchMarkets();
          const marketDataPromises = markets.map(market => fetchLatestMarketPrices(market));
          const allMarketData = await Promise.all(marketDataPromises);
          setMarketData(allMarketData.filter(data => data)); // Filter out any null/undefined results
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setMarketData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, [selectedMarket]);

  const getTrendIcon = (price: number) => {
    if (price > 5000) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (price < 2000) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (price: number) => {
    if (price > 5000) return "text-green-600 bg-green-50";
    if (price < 2000) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };
  
  const getMockChange = (price: number) => {
    return (price % 10).toFixed(1);
  }

  if (loading) {
    return <Card><CardHeader><CardTitle>Loading Market Prices...</CardTitle></CardHeader><CardContent><p>Fetching data...</p></CardContent></Card>;
  }

  if (error) {
    return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p className="text-red-500">{error}</p></CardContent></Card>;
  }

  if (!marketData || marketData.length === 0) {
    return <Card><CardHeader><CardTitle>No Market Data</CardTitle></CardHeader><CardContent><p>No data available for the selected market.</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Market Prices</CardTitle>
        <CardDescription>
          Latest prices from participating markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {marketData.map((marketEntry) => (
            <div key={marketEntry._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{marketEntry.market} Market</h3>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(marketEntry.date).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {marketEntry.priceItems.length} items
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Item</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700">Unit</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Price (UGX)</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-700">Trend</th>
                      <th className="text-right py-2 px-2 font-medium text-gray-700">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketEntry.priceItems.map((item, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2 font-medium">{item.product}</td>
                        <td className="py-3 px-2 text-gray-600">{item.unit}</td>
                        <td className="py-3 px-2 text-right font-semibold">
                          {item.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex justify-center">
                            {getTrendIcon(item.price)} 
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(item.price)}`}>
                            {item.price > 0 ? '+' : ''}{getMockChange(item.price)}% 
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
