import { Button } from "@/components/ui/button";
import { useUpdateReportSettingMutation, useTriggerReportGenerationMutation, useSendTestWhatsAppMutation } from "@/features/report/reportAPI";
import { Loader, Send } from "lucide-react";
import { toast } from "sonner";
import { formatISO } from "date-fns";

const ReportControls = () => {
  const [updateReportSetting, { isLoading: isUpdating }] = useUpdateReportSettingMutation();
  const [triggerReportGeneration, { isLoading: isGenerating }] = useTriggerReportGenerationMutation();
  const [sendTestWhatsApp, { isLoading: isSending }] = useSendTestWhatsAppMutation();

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

  const handleSendAllTimeWhatsApp = async () => {
    try {
      const to = new Date();
      const from = new Date("1970-01-01");
      await sendTestWhatsApp({
        from: formatISO(from, { representation: "date" }),
        to: formatISO(to, { representation: "date" })
      }).unwrap();
      toast.success("All-time report sent to your WhatsApp");
    } catch (error: any) {
      console.error("Send WhatsApp error:", error);
      toast.error(error?.data?.message || "Failed to send WhatsApp message");
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
        Generate Report No
      </Button>
      
    </div>
  );
};

export default ReportControls;