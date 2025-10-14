import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from './store';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const auth = (getState() as RootState).auth
      console.log("🔐 API Client Auth:", auth);
      
      if (auth?.accessToken) {
        headers.set('Authorization', `Bearer ${auth.accessToken}`);
        console.log("✅ Token added to headers");
      } else {
        console.log("❌ No token found - request will fail");
      }
      return headers;
    },
  }); 

export const apiClient = createApi({
    reducerPath: 'api', // Add API client reducer to root reducer
    baseQuery: baseQuery,
    refetchOnMountOrArgChange: true, // Refetch on mount or arg change
    tagTypes: ['transactions','analytics','billingSubscription'], // Tag types for RTK Query
    endpoints: () => ({}), // Endpoints for RTK Query
  })
  