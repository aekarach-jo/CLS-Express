import { useMutation, useQuery } from 'react-query';

const { request } = require('utils/axios-utils');

const genCuttingLayoutReq = async (data) => {
  const resp = await request({
    url: '/production/genCuttingLayout',
    method: 'post',
    data,
  });

  return resp.data?.data?.layoutDetail;
};

const useGenCuttingLayoutQuery = ({ materialId, productId, producedAmount, startX, startY, startTextX, startTextY, storeData }, queryOptions = {}) =>
  useQuery(
    ['genCuttingLayout', materialId, productId, producedAmount, storeData],
    () => genCuttingLayoutReq({ materialId, productId, producedAmount, startX, startY, startTextX, startTextY, storeData, isStore: !!storeData }),
    {
      refetchOnWindowFocus: false,
      ...queryOptions,
    }
  );

/**
  @typedef {{
    id: string,
    no: string,
    type: "ITEM" | "GROUP",
    producedItem: string,
    detail: string[],
    isDeleted: boolean,
    createdAt: string,
    createdBy: string,
    updatedAt: string,
    updatedBy: string,
  }} ProductionAddResp

  @typedef {{
    locationx: number,
    locationy: number,
    width: number,
    height: number,
  }} Layout

  @typedef {{
    locationx: number,
    locationy: number,
    text: string,
  }} TextPos

  @typedef {{
    item: number,
    isMaterialRotate: boolean,
    isCuttingRotate: boolean,
    isTwoSide: boolean,
    grainSize: string,
    cuttingPieces: number,
    efficiency: number,
    cavity: number,
    producedAmount: number,
    printedAmount: number,
    materialUsedAmount: number,
    materialUnusedPieces: number,
    layoutList: Layout[],
    textXList: TextPos[],
    textYList: TextPos[],
  }} LayoutDetail

  @typedef {{
    item: number,
    materialId: string,
    selectedLayout: number,
    layoutDetail: LayoutDetail[],
  }} Detail

  @typedef {{
    type: 'ITEM' | 'GROUP',
    producedItemId: string,
    detail: Detail[],
  }} ProductionAddReq
 */

/**
 * Add or save Production data.
 *
 * @param {ProductionAddReq} data Add payload
 * @returns {Promise<ProductionAddResp>}
 */
const productionAddReq = async (data) => {
  const resp = await request({
    url: '/production/add',
    method: 'post',
    data,
  });

  return resp.data?.data;
};

const useProductionAddMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(productionAddReq, {
    ...mutationOptions,
  });

const productionEditReq = async ({ id, data }) => {
  const resp = await request({
    url: `/production/${id}/edit`,
    method: 'post',
    data,
  });

  return resp.data?.data;
};

const useProductionEditMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(productionEditReq, {
    ...mutationOptions,
  });

const productionListReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: '/production/list',
    params: {
      ...filter,
      page: page + 1,
      limit,
    },
  });

  return resp.data;
};

const useProductionListQuery = (
  { page = 0, limit = 10, sortField, sortDirection } = {},
  /** @type {import('react-query/types').UseQueryOptions} */ queryOptions = {}
) =>
  useQuery(['productionList', page, limit, sortField, sortDirection], () => productionListReq({ page, limit, sortField, sortDirection }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const productionGetReq = async (id) => {
  const resp = await request({
    url: `/production/${id}`,
  });

  return resp.data?.data;
};

const useProductionGetQuery = (id, /** @type {import('react-query/types').UseQueryOptions} */ queryOptions = {}) =>
  useQuery(['production', id], () => productionGetReq(id), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useProductionData = () => {
  return {
    useGenCuttingLayoutQuery,
    useProductionAddMutation,
    useProductionEditMutation,
    useProductionListQuery,
    useProductionGetQuery,
  };
};

export default useProductionData;
