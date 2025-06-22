import { useMutation, useQuery } from 'react-query';
import queryClient from 'utils/query-client';
import useConvertUOM from 'hooks/useConvertUOM';

const { request } = require('utils/axios-utils');

const { useConvertReamToSheet, useConvertSheetToReam } = useConvertUOM();

const context = '/cuttingList';

/**
 @typedef {{
  filter?: T,
  page?: number | string
  limit?: number | string
 }} SearchFilter<T>
 @template {any} T
 */

/**
 @typedef {{
  materialId?: string,
  materialCode?: string,
  materialName?: string,
  productName?: string,
  productCode?: string,
  prdouctionOrderNo?: string,
  startDueDate?: string,
  endDueDate?: string,
 }} CuttingMaterialFilter
 */

/**
 @typedef {{
  materialCode?: string,
  materialName?: string,
  productName?: string,
  prdouctionOrderNo?: string,
  startDueDate?: string,
  endDueDate?: string,
 }} CuttingProductFilter
 */

/**
 @typedef {{
  amount: string,
  status: 'NEW' | 'COMPLETED' | string,
  id: string,
  productName: string,
  productionOrderNo: string,
  dueDate: string,
  remaining: string,
 }} ProductItem

 @typedef {{
  productId: string,
  productCode: string,
  productName: string,
  productionOrderId: string,
  productionOrderNo: string,
  materialId: string,
  amount: number,
  dueDate: string,
  itemList?: ProductItem[],
 }} CuttingMaterialResponse

 @typedef {CuttingMaterialResponse & {priority: number}} CuttingMaterialWithPriorityResponse
*/

// Requests
/**
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @returns {Promise<CuttingMaterialWithPriorityResponse[]>}
 */
const summaryPendingListReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: `${context}/pendingList`,
    params: {
      ...filter,
      page: page + 1,
      limit,
    },
  });

  return resp.data?.data;
};

/**
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @returns {Promise<CuttingMaterialResponse[]>}
 */
const summaryFinishedListReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: `${context}/finishedList`,
    params: {
      ...filter,
      page: page + 1,
      limit,
    },
  });

  return resp.data?.data;
};

/**
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @returns {Promise<CuttingMaterialWithPriorityResponse[]>}
 */
const itemListToCuttingReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: `${context}/toCuttingList`,
    params: {
      ...filter,
    },
  });
  const detail = await request({
    url: `${context}/getDetailCutting`,
    params: {
      productionOrder: filter.productionOrderId,
    },
  });
  resp.data?.data.forEach((v1) => {
    v1.productionOrderList.forEach((v2) => {
      v1.productionOrderNo = v2.productionOrderNo;
      v1.priority = v2.priority;
      v1.relatedProductionOrder = detail.data?.data.relatedProductionOrder;
      v1.dueDate = v2.dueDate;
      v1.totalAmount = 0;
      v1.status = [];
      v1.matchStatus = false;
      v2.materialList.forEach((v3) => {
        v1.materialUsedAmount = v3.materialUsedAmount;
        v1.materialStoreUnit = v3.materialStoreUnit;
        let convertAmount = 0;
        // let convertRemaining = 0;
        v3.itemList.forEach((v4) => {
          v1.totalAmount += v4.amount;
          v1.amountUnit = v4.amount;
          if (v3.materialStoreUnit === 'รีม') {
            convertAmount = useConvertReamToSheet({ value: v4.amount });
            if (v1.totalAmount >= v1.materialUsedAmount) {
              v1.matchStatus = true;
            }
            if (v4.status !== 'NEW') {
              v1.matchSelect = true;
            }
            v1.matchPerItem = `${v1.totalAmount} / ${v1.materialUsedAmount}`;
          } else if (v3.materialStoreUnit === 'แผ่น') {
            convertAmount = useConvertSheetToReam({ value: v4.amount });
            if (v1.totalAmount / 500 >= v1.materialUsedAmount) {
              v1.matchStatus = true;
            }
            if (v4.status !== 'NEW') {
              v1.matchSelect = true;
            }
            v1.matchPerItem = `${v1.totalAmount / 500} / ${v1.materialUsedAmount}`;
          } else if (v3.materialStoreUnit === '-') {
            convertAmount = useConvertReamToSheet({ value: v4.amount });
            v1.matchPerItem = `${v1.totalAmount} / ${v1.materialUsedAmount}`;
          } else {
            convertAmount = useConvertReamToSheet({ value: v4.amount });
            v1.matchPerItem = `${v1.totalAmount} / ${v1.materialUsedAmount}`;
          }
          v4.convertAmount = `${convertAmount.ream} รีม ${convertAmount.sheet} แผ่น`;

          if (v4.status === 'REJECTED') {
            v1?.status?.push({ value: v4.status, label: 'FAILED' });
          } else {
            v1?.status?.push({ value: v4.status, label: v4.status });
          }
        });
      });
    });
    localStorage.setItem(`${v1.productionOrderNo}_toProduced`, v1.matchStatus);
  });
  return resp.data?.data;
};

/**
 * @param {{ productionOrder: string}} param0
 */
const getDetailForCuttingReq = async ({ productionOrder }) => {
  const resp = await request({
    // url: `${context}/getDetailCutting`,
    url: `${context}/getDetailCutting`,
    params: {
      productionOrder,
    },
  });

  return resp.data?.data;
};

const saveCuttingReq = async (data) => {
  const resp = await request({
    url: `${context}/saveCutting`,
    method: 'post',
    data,
  });

  return resp.data?.data;
};

const saveLayoutStatusCetting = async (data) => {
  const resp = await request({
    url: `${context}/saveCuttingDetail`,
    method: 'post',
    data,
  });

  return resp.data?.data;
};

const completeCuttingMutation = async ({ productionOrder }) => {
  const resp = await request({
    url: `${context}/completeCutting`,
    method: 'post',
    data: {
      productionOrder,
    },
  });

  return resp.data?.data;
};

const updateCuttingStatusMutation = async ({ formData }) => {
  const resp = await request({
    url: `${context}/saveCutting`,
    method: 'post',
    data: {
      ...formData,
    },
  });

  return resp.data?.data;
};
const reloadAllCachesPromises = () =>
  Promise.all([
    queryClient.invalidateQueries('itemListToCutting', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useDefectLov', { refetchActive: true, refetchInactive: true }),
  ]);
// React queries
/**
 *
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @param {import('react-query/types').UseQueryOptions} queryOptions
 * @returns {import('react-query/types').UseQueryResult<CuttingMaterialWithPriorityResponse[], unknow>}
 */
const useSummaryPendingListQuery = ({ filter, page, limit, sortBy }, queryOptions = {}) =>
  useQuery(['summaryPendingList', filter, page, limit, sortBy], () => summaryPendingListReq({ filter, page, limit, sortBy }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

/**
 *
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @param {import('react-query/types').UseQueryOptions} queryOptions
 * @returns {import('react-query/types').UseQueryResult<CuttingMaterialResponse[], unknow>}
 */
const useSummaryFinishedListQuery = ({ filter, page, limit, sortBy }, queryOptions = {}) =>
  useQuery(['summaryFinishedList', filter, page, limit, sortBy], () => summaryFinishedListReq({ filter, page, limit, sortBy }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

/**
 *
 * @param {SearchFilter<CuttingMaterialFilter>} param0
 * @param {import('react-query/types').UseQueryOptions} queryOptions
 * @returns {import('react-query/types').UseQueryResult<CuttingMaterialWithPriorityResponse[], unknow>}
 */
const useItemListToCuttingQuery = ({ filter, page, limit, sortBy }, queryOptions = {}) =>
  useQuery(['itemListToCutting', filter, page, limit, sortBy], () => itemListToCuttingReq({ filter, page, limit, sortBy }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

/**
 *
 * @param {{productionOrder: string}} param0
 * @param {import('react-query/types').UseQueryOptions} queryOptions
 */
const useGetDetailForCuttingQuery = ({ productionOrder }, queryOptions = {}) =>
  useQuery(['getDetailForCutting', productionOrder], () => getDetailForCuttingReq({ productionOrder }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useSaveCuttingDetailMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(saveCuttingReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useSaveLayoutStatusMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(saveLayoutStatusCetting, {
    onSettled(data) {
      queryClient.invalidateQueries(['getLayoutStatusCutting', data?.id]);
    },
    ...mutationOptions,
  });

const useCompleteCuttingMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(completeCuttingMutation, {
    ...mutationOptions,
  });

const useUpdateCuttingStatusMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(updateCuttingStatusMutation, {
    ...mutationOptions,
  });

const useCuttingData = () => {
  return {
    //
    useSummaryPendingListQuery,
    useSummaryFinishedListQuery,
    useItemListToCuttingQuery,
    useGetDetailForCuttingQuery,
    useSaveLayoutStatusMutation,
    useSaveCuttingDetailMutation,
    useCompleteCuttingMutation,
    useUpdateCuttingStatusMutation,
  };
};

export default useCuttingData;
