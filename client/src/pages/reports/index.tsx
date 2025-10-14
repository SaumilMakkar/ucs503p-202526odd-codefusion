import {
  Card,
  CardContent,
} from "@/components/ui/card";
import PageLayout from "@/components/page-layout";
import ScheduleReportDrawer from "./_component/schedule-report-drawer";
import ReportTable from "./_component/report-table";
import ReportControls from "./_component/report-controls";


export default function Reports() {
  return (
    <PageLayout
      title="Report History"
      subtitle="View and manage your financial reports"
      addMarginTop
      rightAction={
        <div className="flex gap-2">
          <ReportControls />
          <ScheduleReportDrawer />
        </div>
      }
    >
        <Card className="border shadow-none">
          <CardContent>
           <ReportTable />
          </CardContent>
        </Card>
    </PageLayout>
  );
}
