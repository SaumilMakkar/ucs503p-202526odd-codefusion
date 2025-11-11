import { apiClient } from "@/app/api-client";
import { GetAllReportResponse, UpdateReportSettingParams, SendWhatsAppReportPayload } from "./reportType";

export const reportApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    
    getAllReports: builder.query<GetAllReportResponse, {pageNumber: number, pageSize: number}>({
      query: (params) => {
        const { pageNumber = 1, pageSize = 20 } = params;
        return ({
          url: "/reports/all",
          method: "GET",
          params: { pageNumber, pageSize },
        });
      },
    }),

    updateReportSetting: builder.mutation<void, UpdateReportSettingParams>({
      query: (payload) => {
        console.log("updateReportSetting API call with payload:", payload);
        return {
          url: "/reports/update-setting",
          method: "PUT",
          body: payload,
        };
      },
    }),

    triggerReportGeneration: builder.mutation<void, void>({
      query: () => ({
        url: "/reports/trigger-generation",
        method: "POST",
      }),
    }),

    sendTestWhatsApp: builder.mutation<void, { from: string; to: string; phoneNumber?: string }>({
      query: ({ from, to, phoneNumber }) => ({
        url: "/reports/send-test-whatsapp",
        method: "GET",
        params: { from, to, phoneNumber },
      }),
    }),

    sendWhatsAppReport: builder.mutation<void, SendWhatsAppReportPayload>({
      query: ({ from, to, phoneNumber }) => ({
        url: "/reports/send-whatsapp-report",
        method: "POST",
        body: { from, to, phoneNumber },
      }),
    }),
  }),
});

export const {
    useGetAllReportsQuery,
    useUpdateReportSettingMutation,
    useTriggerReportGenerationMutation,
    useSendTestWhatsAppMutation,
    useSendWhatsAppReportMutation
} = reportApi;
