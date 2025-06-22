import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';

const EDIT_RM_DATA = 'RmData';

const rawMaterialListReq = async (params) => {
  const resp = await request({
    url: '/masterData/material/list',
    params,
  });

  return resp.data?.data;
};

const findRawMaterialInventoryReq = async () => {
  const resp = await request({
    url: `/inventory/material/find`,
  });

  return resp.data?.data;
};

const findRawMaterialInventorySupplierReq = async () => {
  const resp = await request({
    url: `/inventory/material/find`,
    params: {
      isSupplier: true,
    },
  });

  return resp.data?.data;
};

const findRawMaterialReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: `/masterData/material/find`,
    params: {
      typeMulti: 'RM,RMU',
    },
  });

  return resp.data?.data;
};

const getRawMaterialReq = async ({ id }) => {
  const resp = await request({
    url: `/masterData/material/${id}`,
  });
  return resp.data?.data;
};

const useFindRawMaterialQuery = ({ filter, page, limit, sortBy }, queryOptions = {}) =>
  useQuery(['searchRm', filter, page, limit, sortBy], () => findRawMaterialReq({ filter, page, limit, sortBy }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useRawMaterialListQuery = ({ page = 1, limit = 10, sortField, sortDirection } = {}, queryOptions = {}) =>
  useQuery('materialList', () => rawMaterialListReq({ page, limit, sortField, sortDirection }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
const useFindRawMaterialInventory = (queryOptions = {}) =>
  useQuery(['searchRmInventory'], () => findRawMaterialInventoryReq(), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useFindRawMaterialInventorySupplier = (queryOptions = {}) =>
  useQuery(['searchRmInventorySupplier'], () => findRawMaterialInventorySupplierReq(), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useGetRawMaterialQuery = ({ id }, queryOptions = {}) =>
  useQuery([EDIT_RM_DATA, id], () => getRawMaterialReq({ id }), {
    enabled: !!id,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useMaterialData = () => {
  return { useRawMaterialListQuery, useFindRawMaterialQuery, useGetRawMaterialQuery, useFindRawMaterialInventory, useFindRawMaterialInventorySupplier };
};

export default useMaterialData;
