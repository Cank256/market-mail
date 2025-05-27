import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { fetchMarketHistory } from "../services/api";

interface PriceChartProps {
  showDetailed?: boolean;
  selectedMarket?: string; // Now optional since we can show all market data by default
}

interface PriceDataPoint {
  date: string;
  [productKey: string]: number | string; // Product prices, and the date string
}

export const PriceChart = ({ showDetailed = false, selectedMarket = "all" }: PriceChartProps) => {
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productKeys, setProductKeys] = useState<string[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use market history to get time-series data for chart
        // If no market is selected or "all" is selected, show aggregated data from all markets
        const marketParam = (selectedMarket && selectedMarket !== "all") ? selectedMarket : "all";

        const days = 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        const result = await fetchMarketHistory(marketParam, 1, days, startDate, endDate);

        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          console.log('Market history data:', result.data); // Debug log
          
          // Transform market history data into chart format
          // result.data contains: [{ _id, market, date, priceItems: [{ product, unit, price }] }]
          const transformedData = transformHistoryToChartData(result.data);
          
          if (transformedData.chartData.length > 0) {
            setChartData(transformedData.chartData);
            setProductKeys(transformedData.productKeys);
          } else {
            setError("No price data available for the selected time period");
            setChartData([]);
            setProductKeys([]);
          }
        } else {
          setError("No historical data available" + (marketParam === "all" ? "" : " for this market"));
          setChartData([]);
          setProductKeys([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setChartData([]);
        setProductKeys([]);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to transform market history data to chart data format
    const transformHistoryToChartData = (historyData: Array<{
      _id: string;
      market: string;
      date: string;
      priceItems: Array<{ product: string; price: number; unit: string }>;
    }>): { chartData: PriceDataPoint[], productKeys: string[] } => {
      const dataByDate: { [date: string]: PriceDataPoint } = {};
      const productKeySet = new Set<string>();

      historyData.forEach(entry => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        
        if (!dataByDate[dateStr]) {
          dataByDate[dateStr] = { date: dateStr };
        }

        entry.priceItems.forEach((item: { product: string; price: number; unit: string }) => {
          const productKey = `${item.product.toLowerCase().replace(/\s/g, '_')}_${item.unit}`;
          productKeySet.add(productKey);
          
          // If multiple entries for same product on same date, take average
          if (dataByDate[dateStr][productKey]) {
            dataByDate[dateStr][productKey] = (dataByDate[dateStr][productKey] as number + item.price) / 2;
          } else {
            dataByDate[dateStr][productKey] = item.price;
          }
        });
      });

      const chartData = Object.values(dataByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return { 
        chartData, 
        productKeys: Array.from(productKeySet) 
      };
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
