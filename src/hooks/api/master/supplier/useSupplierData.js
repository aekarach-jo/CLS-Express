import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';

const findSupplierReq = async ({ filter, page = 0, limit = 100 }) => {
  const resp = await request({
    url: `/masterData/supplier/find`,
    params: {
      ...filter,
      page: page + 1,
      limit,
    },
  });

  return resp.data?.data;
};

const useFindSupplierQuery = (
  /**
   * @type {{
   *  filter?: {
   *    name?: string,
   *    status?: 'ACTIVE' | 'INACTIVE',
   *    address?: string,
   *    phone?: string,
   *  },
   *  page?: number | string
   *  limit?: number | string
   * }}
   */ { filter, page = 0, limit = 100, sortBy },
  /**
   * @type {import('react-query/types').UseQueryOptions}
   */
  queryOptions = {}
) =>
  useQuery(['searchSupplier', filter, page, limit, sortBy], () => findSupplierReq({ filter, page, limit, sortBy }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useSupplierData = () => {
  return { useFindSupplierQuery };
};

export default useSupplierData;
