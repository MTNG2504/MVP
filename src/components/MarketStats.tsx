
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { fetchGlobalMarketStats } from "@/services/marketDataService";

const MarketStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["globalMarketStats"],
    queryFn: fetchGlobalMarketStats,
    staleTime: 120000,
    refetchInterval: 120000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const marketStats = data?.status === "ok" ? data.stats : null;
  const isUnavailable = data?.status === "unavailable";

  const stats = [
    {
      title: "Market Cap",
      value: marketStats?.totalMarketCapUsd ?? 0,
      change: marketStats?.marketCapChangePercentage24hUsd ?? 0,
      icon: DollarSign,
      format: "currency"
    },
    {
      title: "24h Volume", 
      value: marketStats?.totalVolumeUsd ?? 0,
      change: 0,
      icon: BarChart3,
      format: "currency"
    },
    {
      title: "BTC Dominance",
      value: marketStats?.btcDominance ?? 0,
      change: 0,
      icon: TrendingUp,
      format: "percentage"
    },
    {
      title: "Active Coins",
      value: marketStats?.activeCryptocurrencies ?? 0,
      change: 0,
      icon: BarChart3,
      format: "number"
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        return `$${value.toLocaleString()}`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "number":
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  return (
    <div className="mb-8">
      {isUnavailable && (
        <p className="text-sm text-gray-400 mb-4">Market data temporarily unavailable</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-800 hover:border-red-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? (
                <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
              ) : isUnavailable ? (
                <span className="text-gray-500">—</span>
              ) : (
                formatValue(stat.value, stat.format)
              )}
            </div>
            {!isUnavailable && stat.change !== 0 && (
              <p className={`text-xs flex items-center ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(stat.change).toFixed(2)}%
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  );
};

export default MarketStats;
