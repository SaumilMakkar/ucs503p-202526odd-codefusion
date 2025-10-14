import { useSummaryAnalyticsQuery } from "@/features/analytics/analyticsAPI";
import SummaryCard from "./summary-card";
import { DateRangeType } from "@/components/date-range-select";

const DashboardStats = ({ dateRange }: { dateRange?: DateRangeType }) => {

  const { data, isFetching } = useSummaryAnalyticsQuery(
    { preset: dateRange?.value },
    { skip: !dateRange }
  );
  const summaryData = data?.data;
  
  return (
    <div className="flex flex-row items-center">
      <div className="flex-1 lg:flex-[1] grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Available Balance"
          value={summaryData?.availableBalance}
          dateRange={dateRange}
          percentageChange={0}
          isLoading={isFetching}
          cardType="balance"
        />
        <SummaryCard
          title="Total Income"
          value={summaryData?.totalIncome}
          percentageChange={12.8}
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={summaryData?.totalExpenses}
          dateRange={dateRange}
          percentageChange={summaryData?.percentageChange?.expenses}
          isLoading={isFetching}
          cardType="expenses"
        />
        <SummaryCard
          title="Savings Rate"
          value={summaryData?.savingRate?.percentage}
          expenseRatio={75}
          isPercentageValue
          dateRange={dateRange}
          isLoading={isFetching}
          cardType="savings"
        />
      </div>
    </div>
  );
};

export default DashboardStats;
