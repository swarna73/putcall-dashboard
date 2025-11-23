import { DashboardData, StockAnalysis } from "../types";

/**
 * Fetches market dashboard data from the server-side API route
 */
export const fetchMarketDashboard = async (): Promise<DashboardData> => {
  const response = await fetch('/api/dashboard');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch dashboard data");
  }
  
  return response.json();
};

/**
 * Performs a Deep Dive Financial X-Ray on a specific ticker via server-side API route
 */
export const analyzeStock = async (symbol: string): Promise<StockAnalysis> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symbol }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze stock");
  }

  return response.json();
};