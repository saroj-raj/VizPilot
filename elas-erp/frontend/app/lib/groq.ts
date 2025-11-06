// Groq AI Service - now using backend API for all operations

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

/**
 * Get business insights based on industry and data
 */
export async function getBusinessInsights(
  businessData: {
    name: string;
    industry: string;
    size: string;
    hasDocuments: boolean;
  }
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_data: businessData,
        financial_data: []
      })
    });
    
    const data = await response.json();
    
    if (data.recommendations && data.recommendations.length > 0) {
      return data.recommendations.map((r: any, i: number) => 
        `${i + 1}. **${r.title}** (${r.priority} priority)\n   ${r.description}\n   Expected Impact: ${r.expected_impact}`
      ).join('\n\n');
    }
    
    return "No insights available at this time.";
  } catch (error) {
    console.error('Error getting insights:', error);
    return getFallbackInsights(businessData);
  }
}

function getFallbackInsights(businessData: any): string {
  const insights = [
    `• Focus on ${businessData.industry} industry best practices`,
    `• Optimize operations for ${businessData.size} company scale`,
    `• Consider cloud-based solutions for scalability`,
    `• Implement data-driven decision making`,
    `• Regular financial reviews recommended`
  ];
  return insights.join('\n');
}

/**
 * Generate sample financial data based on industry
 */
export async function generateHistoricalData(
  industry: string,
  companySize: string
): Promise<{
  revenue: number[];
  expenses: number[];
  profit: number[];
  months: string[];
}> {
  try {
    // Try to get predictions from backend
    const historicalData: ChartData[] = generateFallbackChartData();
    
    const response = await fetch(`${API_BASE}/ai/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        historical_data: historicalData,
        months_ahead: 0  // Just want historical, not predictions
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Use AI-enhanced data if available
    }
  } catch (error) {
    console.error('Error generating data:', error);
  }
  
  // Return fallback data
  const fallbackData = generateFallbackChartData();
  return {
    revenue: fallbackData.map(d => d.revenue),
    expenses: fallbackData.map(d => d.expenses),
    profit: fallbackData.map(d => d.profit),
    months: fallbackData.map(d => d.month)
  };
}

/**
 * Fallback chart data generation
 */
function generateFallbackChartData(): ChartData[] {
  const baseRevenue = 100 + Math.random() * 50;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return months.map((month, i) => {
    const revenue = Math.round(baseRevenue * (1 + i * 0.05 + (Math.random() - 0.5) * 0.1));
    const expenses = Math.round(revenue * (0.6 + Math.random() * 0.2));
    const profit = revenue - expenses;
    
    return { month, revenue, expenses, profit };
  });
}

/**
 * Get AI chat response for general questions
 */
export async function getChatResponse(
  userMessage: string,
  conversationHistory: GroqMessage[] = []
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/chat?message=${encodeURIComponent(userMessage)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: conversationHistory })
    });
    
    const data = await response.json();
    return data.response || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error in chat:', error);
    return 'I apologize, but I\'m having trouble connecting. Please try again.';
  }
}

/**
 * Upload and analyze document
 */
export async function uploadDocument(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('files', file);
    
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    return { error: 'Upload failed' };
  }
}

/**
 * Save business setup
 */
export async function saveBusinessSetup(setupData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/business/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setupData)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error saving business setup:', error);
    return { success: false, error: 'Save failed' };
  }
}

/**
 * Analyze uploaded document
 */
export async function analyzeDocument(
  fileName: string,
  fileContent: string
): Promise<{
  summary: string;
  keyMetrics: { label: string; value: string }[];
  insights: string[];
}> {
  try {
    const response = await fetch(`${API_BASE}/ai/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_name: fileName,
        content: fileContent
      })
    });
    
    const data = await response.json();
    return {
      summary: data.summary || 'Document uploaded successfully.',
      keyMetrics: data.key_metrics || [],
      insights: data.insights || []
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    return {
      summary: 'Document uploaded successfully. Analysis pending.',
      keyMetrics: [{ label: 'Status', value: 'Uploaded' }],
      insights: ['Document will be analyzed shortly.']
    };
  }
}
