export type ReportType = {
    period: string;
    summary: {
        income: number;
        expenses: number;
        balance: number;
        savingsRate: number;
        topCategories: Array<{ name: string; amount: number; percent: number }>;
    };
    insights: string[];
  };