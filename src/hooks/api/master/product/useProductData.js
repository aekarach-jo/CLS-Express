import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';

/**
 * @typedef {{
 *  name?: string,
 *  code?: string,
 *  customerId?: string,
 * }} FindProductFilter
 */

/**
 * @param {{
 *  filter: FindProductFilter
 * }} param0
 */
const findProductReq = async ({ filter, page = 0, limit = 10 }) => {
  const resp = await request({
    url: '/masterData/product/find',
    params: {
      ...filter,
      limit,
      page: page + 1,
    },
  });

  return resp.data?.data;
};

const useProductQuery = ({ filter, page = 0, limit = 10 } = {}, /** @type {import('react-query/types').UseQueryOptions} */ queryOptions = {}) =>
  useQuery(['masterProduct', filter, page, limit], () => findProductReq({ filter, page, limit }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useProductData = () => {
  return {
    useProductQuery,
  };
};

export default useProductData;
