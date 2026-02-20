import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config/constants';
import { logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithAuthHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout());
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }
  return result;
};

export const lmsApi = createApi({
  reducerPath: 'lmsApi',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Subscriptions', 'Modules', 'BillingPlans', 'SubscriptionModules', 'PlanSubscriptions', 'SubscriptionLogs', 'BillingSubscriptionLogs', 'EmailConfig'],
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: (type) => (type ? `/api/subscriptions?type=${encodeURIComponent(type)}` : '/api/subscriptions'),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Subscriptions', id })),
              { type: 'Subscriptions', id: 'LIST' },
            ]
          : [{ type: 'Subscriptions', id: 'LIST' }],
    }),
    createSubscription: builder.mutation({
      query: (body) => ({ url: '/api/subscriptions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Subscriptions', id: 'LIST' }],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, data }) => ({ url: `/api/subscriptions/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Subscriptions', id }, { type: 'Subscriptions', id: 'LIST' }],
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({ url: `/api/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Subscriptions', id }, { type: 'Subscriptions', id: 'LIST' }],
    }),
    getSubscriptionDetails: builder.query({
      query: (id) => `/api/subscriptions/${id}/details`,
      providesTags: (_result, _err, id) => [{ type: 'Subscriptions', id }],
    }),
    getAssignedModules: builder.query({
      query: (subscriptionId) => `/api/subscriptions/${subscriptionId}/modules`,
      providesTags: (_result, _err, subscriptionId) => [{ type: 'SubscriptionModules', id: subscriptionId }],
    }),
    assignModules: builder.mutation({
      query: ({ subscriptionId, moduleIds }) => ({
        url: `/api/subscriptions/${subscriptionId}/modules`,
        method: 'PUT',
        body: { moduleIds },
      }),
      invalidatesTags: (_result, _err, { subscriptionId }) => [
        { type: 'SubscriptionModules', id: subscriptionId },
        { type: 'Subscriptions', id: 'LIST' },
        { type: 'SubscriptionLogs', id: 'LIST' },
      ],
    }),
    getEmailConfig: builder.query({
      query: (subscriptionId) => `/api/subscriptions/${subscriptionId}/email-config`,
      providesTags: (_result, _err, subscriptionId) => [{ type: 'EmailConfig', id: subscriptionId }],
    }),
    saveEmailConfig: builder.mutation({
      query: ({ subscriptionId, smtpHost, port, email, appPassword }) => ({
        url: `/api/subscriptions/${subscriptionId}/email-config`,
        method: 'PUT',
        body: { smtpHost, port, email, appPassword },
      }),
      invalidatesTags: (_result, _err, { subscriptionId }) => [{ type: 'EmailConfig', id: subscriptionId }],
    }),
    sendTestEmail: builder.mutation({
      query: ({ subscriptionId, to }) => ({
        url: `/api/subscriptions/${subscriptionId}/email-config/test`,
        method: 'POST',
        body: { to },
      }),
    }),
    getSubscriptionLogs: builder.query({
      query: (subscriptionId) => `/api/subscriptions/${subscriptionId}/logs`,
    }),
    getAllSubscriptionLogs: builder.query({
      query: () => '/api/subscription-logs',
      providesTags: (result) =>
        result ? [{ type: 'SubscriptionLogs', id: 'LIST' }] : [{ type: 'SubscriptionLogs', id: 'LIST' }],
    }),
    getModules: builder.query({
      query: () => '/api/modules',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Modules', id })), { type: 'Modules', id: 'LIST' }]
          : [{ type: 'Modules', id: 'LIST' }],
    }),
    createModule: builder.mutation({
      query: (body) => ({ url: '/api/modules', method: 'POST', body }),
      invalidatesTags: [{ type: 'Modules', id: 'LIST' }],
    }),
    updateModule: builder.mutation({
      query: ({ id, data }) => ({ url: `/api/modules/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Modules', id }, { type: 'Modules', id: 'LIST' }],
    }),
    deleteModule: builder.mutation({
      query: (id) => ({ url: `/api/modules/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Modules', id }, { type: 'Modules', id: 'LIST' }],
    }),
    getBillingPlans: builder.query({
      query: () => '/api/billing-plans',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'BillingPlans', id })),
              { type: 'BillingPlans', id: 'LIST' },
            ]
          : [{ type: 'BillingPlans', id: 'LIST' }],
    }),
    createBillingPlan: builder.mutation({
      query: (body) => ({ url: '/api/billing-plans', method: 'POST', body }),
      invalidatesTags: [{ type: 'BillingPlans', id: 'LIST' }],
    }),
    updateBillingPlan: builder.mutation({
      query: ({ id, data }) => ({ url: `/api/billing-plans/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'BillingPlans', id }, { type: 'BillingPlans', id: 'LIST' }],
    }),
    deleteBillingPlan: builder.mutation({
      query: (id) => ({ url: `/api/billing-plans/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'BillingPlans', id }, { type: 'BillingPlans', id: 'LIST' }],
    }),
    getAssignedSubscriptions: builder.query({
      query: (planId) => `/api/billing-plans/${planId}/subscriptions`,
      providesTags: (_result, _err, planId) => [{ type: 'PlanSubscriptions', id: planId }],
    }),
    assignSubscriptionsToPlan: builder.mutation({
      query: ({ planId, subscriptionIds }) => ({
        url: `/api/billing-plans/${planId}/subscriptions`,
        method: 'PUT',
        body: { subscriptionIds },
      }),
      invalidatesTags: (_result, _err, { planId }) => [
        { type: 'PlanSubscriptions', id: planId },
        { type: 'BillingPlans', id: 'LIST' },
        { type: 'BillingSubscriptionLogs', id: 'LIST' },
      ],
    }),
    getBillingSubscriptionLogs: builder.query({
      query: (planId) => `/api/billing-plans/${planId}/logs`,
    }),
    getAllBillingSubscriptionLogs: builder.query({
      query: () => '/api/billing-subscription-logs',
      providesTags: (result) =>
        result ? [{ type: 'BillingSubscriptionLogs', id: 'LIST' }] : [{ type: 'BillingSubscriptionLogs', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetSubscriptionDetailsQuery,
  useGetAssignedModulesQuery,
  useAssignModulesMutation,
  useGetEmailConfigQuery,
  useSaveEmailConfigMutation,
  useSendTestEmailMutation,
  useGetSubscriptionLogsQuery,
  useGetAllSubscriptionLogsQuery,
  useGetModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useGetBillingPlansQuery,
  useCreateBillingPlanMutation,
  useUpdateBillingPlanMutation,
  useDeleteBillingPlanMutation,
  useGetAssignedSubscriptionsQuery,
  useAssignSubscriptionsToPlanMutation,
  useGetBillingSubscriptionLogsQuery,
  useGetAllBillingSubscriptionLogsQuery,
} = lmsApi;
