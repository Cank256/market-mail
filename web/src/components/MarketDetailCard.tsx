import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Locate, Loader2, AlertTriangle } from 'lucide-react';

interface ProductPrice {
  product: string;
  price: number;
}

interface MarketDetail {
  market: string;
  products: ProductPrice[];
  // lastReportedAt: string; // Available if needed
}

interface MarketDetailCardProps {
  marketName: string;
  onLocateMarket: (marketName: string) => void;
}

export const MarketDetailCard = ({ marketName, onLocateMarket }: MarketDetailCardProps) => {
  const [marketDetail, setMarketDetail] = useState<MarketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/markets/${encodeURIComponent(marketName)}/latest`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setMarketDetail(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch market details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(`Error fetching details for market ${marketName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketDetails();
  }, [marketName]);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-sm text-gray-500">Loading {marketName}...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 min-h-[200px] bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm text-red-700">Error loading market data.</p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </Card>
    );
  }

  if (!marketDetail || marketDetail.products.length === 0) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {marketName}
            <Badge variant="outline">0 items</Badge>
          </CardTitle>
          <CardDescription>No recent price data available for {marketName} Market.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onLocateMarket(marketName)}
          >
            <Locate className="h-4 w-4 mr-2" />
            Locate Market
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sampleProducts = marketDetail.products.slice(0, 2); // Show up to 2 sample products

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {marketDetail.market}
          <Badge variant="outline">{marketDetail.products.length} items</Badge>
        </CardTitle>
        <CardDescription>Latest prices from {marketDetail.market} Market</CardDescription>
      </CardHeader>
      <CardContent>
        {sampleProducts.length > 0 ? (
          <div className="space-y-2 mb-4">
            {sampleProducts.map(item => (
              <div key={item.product} className="flex justify-between text-sm">
                <span>{item.product} (kg)</span> {/* Assuming per kg, adjust if unit varies */}
                <span className="font-semibold">UGX {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No specific product prices to display.</p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onLocateMarket(marketDetail.market)}
        >
          <Locate className="h-4 w-4 mr-2" />
          Locate Market
        </Button>
      </CardContent>
    </Card>
  );
};
