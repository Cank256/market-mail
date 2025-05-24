import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { fetchMarketSummary } from "../services/api";

interface PriceChartProps {
  showDetailed?: boolean;
  selectedMarket?: string; // To fetch data for a specific market
}

interface PriceDataPoint {
  date: string;
  [productKey: string]: number | string; // Product prices, and the date string
}

export const PriceChart = ({ showDetailed = false, selectedMarket }: PriceChartProps) => {
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use centralized API service to fetch market summary
        const marketParam = selectedMarket && selectedMarket !== "all" ? selectedMarket : "all"; // Use a default or aggregated market if 'all'
        const days = 30; // Fetch 30 days summary for trends
        
        const result = await fetchMarketSummary(marketParam, days);

        if (result.success && result.data) {
          // The API's /summary endpoint returns data structured as MarketSummary:
          // { market, startDate, endDate, products: [{ product, unit, averagePrice, minPrice, maxPrice, count, history: [{date, price}] }] }
          // We need to transform this into the format expected by the chart: { date, product1: price, product2: price }
          
          let transformedData: PriceDataPoint[] = [];
          const tempProductKeys = new Set<string>();

          if (Array.isArray(result.data)) { // If API returns an array of summaries (e.g. for "all" markets)
            // This case needs clarification on how to aggregate multiple market summaries for the chart.
            // For now, let's assume we'll use the first market's summary if 'all' is selected, or handle as error/empty.
            // Or, the frontend should pick one market if 'all' is selected for this detailed chart.
            // console.warn("Chart data for 'all' markets summary needs specific handling. Using first available or empty.");
            // For simplicity, if 'all' is selected, we might show a generic message or data from a default market if available.
            // This part needs to be decided based on desired UX for 'all' markets trend chart.
            // For now, if result.data is an array, we'll try to process the first element if it exists.
            const summaryToProcess = result.data.length > 0 ? result.data[0] : null;
            if (summaryToProcess && summaryToProcess.products) {
              transformedData = transformSummaryToChartData(summaryToProcess.products, tempProductKeys);
            }
          } else if (result.data.products) { // Single market summary
            transformedData = transformSummaryToChartData(result.data.products, tempProductKeys);
          }

          setChartData(transformedData);
          setProductKeys(Array.from(tempProductKeys));
        } else {
          throw new Error(result.message || "Failed to fetch chart data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setChartData([]);
        setProductKeys([]);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to transform API summary data to chart data format
    const transformSummaryToChartData = (products: Array<{ product: string; history?: Array<{ date: string; price: number }> }>, productKeySet: Set<string>): PriceDataPoint[] => {
      const dataByDate: { [date: string]: PriceDataPoint } = {};
      products.forEach(product => {
        const productKey = `${product.product.toLowerCase().replace(/\s/g, '_')}`; // e.g., maize_kg
        productKeySet.add(productKey);
        if (product.history && Array.isArray(product.history)) {
          product.history.forEach((historyEntry: { date: string; price: number }) => {
            const dateStr = new Date(historyEntry.date).toISOString().split('T')[0];
            if (!dataByDate[dateStr]) {
              dataByDate[dateStr] = { date: dateStr };
            }
            dataByDate[dateStr][productKey] = historyEntry.price;
          });
        }
      });
      return Object.values(dataByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    fetchChartData();
  }, [selectedMarket]);

  if (loading) return <div className="w-full h-80 flex justify-center items-center"><p>Loading chart data...</p></div>;
  if (error) return <div className="w-full h-80 flex justify-center items-center"><p className="text-red-500">Error: {error}</p></div>;
  if (chartData.length === 0) return <div className="w-full h-80 flex justify-center items-center"><p>No data available for chart.</p></div>;

  // Define some colors for the lines, can be expanded
  const lineColors = ["#16a34a", "#dc2626", "#2563eb", "#ea580c", "#6d28d9", "#db2777"];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            className="text-xs"
          />
          <YAxis 
            tickFormatter={(value) => `${value.toLocaleString()}`}
            className="text-xs"
            domain={['auto', 'auto']}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [`${name}: UGX ${value.toLocaleString()}`, null]}
            labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('en-GB')}`}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showDetailed && <Legend />}
          {productKeys.slice(0, showDetailed ? productKeys.length : 2).map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key}
              stroke={lineColors[index % lineColors.length]} 
              strokeWidth={2}
              name={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Format name for display
              dot={{ fill: lineColors[index % lineColors.length], strokeWidth: 1, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
