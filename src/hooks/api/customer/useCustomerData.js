import { useMutation, useQuery } from 'react-query';

const { request } = require('utils/axios-utils');

const sortByFromTable = ([field] = []) => {
  if (!field) {
    return {};
  }

  return {
    sortField: field.id,
    sortDirection: field.desc ? 'desc' : 'asc',
  };
};

const searchCustomerReq = async ({ filter, page = 0, limit = 10, sortBy = {} }) => {
  const resp = await request({
    url: '/customer/find',
    params: {
      ...filter,
      page: page + 1,
      limit,
      ...sortBy,
    },
  });

  return resp.data?.data;
};

const deleteCustomerReq = async ({ id }) => {
  const resp = await request({
    url: `/customer/${id}/delete`,
    method: 'post',
  });

  return resp.data;
};

const useSearchCustomerQuery = ({ filter, pageIndex, pageSize, sortBy }, queryOptions = {}) =>
  useQuery(
    ['customerList', filter, pageIndex, pageSize, sortBy],
    () => searchCustomerReq({ filter, page: pageIndex, limit: pageSize, sortBy: sortByFromTable(sortBy) }),
    {
      refetchOnWindowFocus: false,
      ...queryOptions,
    }
  );

const getCustomerReq = async (customerId) => {
  const resp = await request({ url: `/customer/${customerId}` });

  return resp.data?.data;
};

const useGetCustomerQuery = (customerId, queryOptions = {}) =>
  useQuery(`editCustomerData`, () => getCustomerReq(customerId), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useDeleteCustomerMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(deleteCustomerReq, {
    ...mutationOptions,
  });

const useCustomerData = () => {
  return { searchCustomerReq, useSearchCustomerQuery, getCustomerReq, useGetCustomerQuery, useDeleteCustomerMutation };
};

export default useCustomerData;
