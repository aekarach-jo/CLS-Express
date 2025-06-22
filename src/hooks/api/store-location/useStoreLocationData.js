import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';

const storeLocationListReq = async (params) => {
  const resp = await request({
    url: '/storeLocation/list',
    params,
  });

  return resp.data?.data;
};

const findStoreLocationReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: '/storeLocation/find',
    params: {
      ...filter,
      page: page + 1,
    },
  });

  return resp.data?.data;
};

const useStoreLocationListQuery = ({ page = 1, limit = 10 } = {}, /** @type {import('react-query/types').UseQueryOptions} */ queryOptions = {}) =>
  useQuery('storeLocationList', () => storeLocationListReq({ page, limit }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useFindStoreLocationQuery = (
  /**
   * @type {{
   *  filter?: {
   *    code?: string,
   *    name?: string,
   *    companyId?: string,
   *    status?: boolean | 'true' | 'false',
   *  },
   *  page?: number | string
   *  limit?: number | string
   * }}
   */ { filter, page, limit },
  /**
   * @type {import('react-query/types').UseQueryOptions}
   */
  queryOptions = {}
) =>
  useQuery(['storeLocation', filter, page, limit], () => findStoreLocationReq({ filter, page, limit }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useStoreLocationData = () => {
  return {
    useStoreLocationListQuery,
    useFindStoreLocationQuery,
  };
};

export default useStoreLocationData;
