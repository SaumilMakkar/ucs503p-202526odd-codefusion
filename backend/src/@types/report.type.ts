export type ReportType = {
    period: string;
    summary: {
        income: number;
        expenses: number;
        balance: number;
        savingsRate: number;
        topCategories: Array<{
          category: any; name: string; amount: number; percent: number 
}>;
    };
    insights: string[];
  };