import { apiClient } from "@/app/api-client";

/**
 * Complaint submission request interface
 */
export interface ComplaintRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Complaint submission response interface
 */
export interface ComplaintResponse {
  message: string;
  data: {
    ticketNumber: string;
    submittedAt: string;
  };
}

export const complaintApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    submitComplaint: builder.mutation<ComplaintResponse, ComplaintRequest>({
      query: (body) => ({
        url: "/complaint/submit",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSubmitComplaintMutation } = complaintApi;

