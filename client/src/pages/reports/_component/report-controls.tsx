import { Button } from "@/components/ui/button";
import { useTriggerReportGenerationMutation, useSendWhatsAppReportMutation } from "@/features/report/reportAPI";
import { Loader, Send } from "lucide-react";
import { toast } from "sonner";

const ReportControls = () => {
  const [triggerReportGeneration, { isLoading: isGenerating }] = useTriggerReportGenerationMutation();
  const [sendWhatsAppReport, { isLoading: isSending }] = useSendWhatsAppReportMutation();

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
      await sendWhatsAppReport({
        phoneNumber: "919501726922",
      }).unwrap();
      toast.success("All-time report sent to WhatsApp number +919501726922");
    } catch (error: any) {
      console.error("Send WhatsApp error:", error);
      toast.error(error?.data?.message || "Failed to send WhatsApp message");
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleGenerateReport}
        disabled={isGenerating}
      >
        {isGenerating && <Loader className="mr-2 h-4 w-4 animate-spin" />}
        Generate Report Now
      </Button>

      <Button
        className="bg-blue-500 text-white hover:bg-blue-600"
        variant="outline"
        onClick={handleSendAllTimeWhatsApp}
        disabled={isSending}
      >
        {isSending ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Send WhatsApp Report
      </Button>
    </div>
  );
};

export default ReportControls;