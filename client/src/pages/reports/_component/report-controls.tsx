import { Button } from "@/components/ui/button";
import { useUpdateReportSettingMutation, useTriggerReportGenerationMutation } from "@/features/report/reportAPI";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const ReportControls = () => {
  const [updateReportSetting, { isLoading: isUpdating }] = useUpdateReportSettingMutation();
  const [triggerReportGeneration, { isLoading: isGenerating }] = useTriggerReportGenerationMutation();

  const handleEnableReports = async () => {
    try {
      await updateReportSetting({ isEnabled: true }).unwrap();
      toast.success("Reports have been enabled successfully!");
    } catch (error: any) {
      console.error("Error enabling reports:", error);
      toast.error(error.data?.message || "Failed to enable reports");
    }
  };

  const handleGenerateReport = async () => {
    try {
      await triggerReportGeneration().unwrap();
      toast.success("Report generation triggered successfully! Check the table for new reports.");
    } catch (error: any) {
      console.error("Report generation error:", error);
      toast.error(error.data?.message || "Failed to trigger report generation");
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleEnableReports}
        disabled={isUpdating}
      >
        {isUpdating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        Enable Reports
      </Button>
      <Button 
        onClick={handleGenerateReport}
        disabled={isGenerating}
      >
        {isGenerating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        Generate Report Now
      </Button>
    </div>
  );
};

export default ReportControls;