import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import useSaleOrderCustomerGroupData from './useSaleOrderCustomerGroupData';

const responseTransformer = (resp) => {
  const { data } = resp;
  return data;
};

const getToProduceList = async () => {
  const resp = await request({ url: `/saleOrder/toProducedList` });
  return responseTransformer(resp.data);
};

const postGetProducedItem = async ({ type, producedItemId }) => {
  if (type === 'group') {
    type = 'GROUP';
  } else {
    type = 'ITEM';
  }

  const resp = await request({
    url: '/saleOrder/getProducedItem',
    method: 'post',
    data: {
      type,
      producedItemId,
    },
  });

  return responseTransformer(resp.data);
};

const useGetToProduceList = (_, queryOptions = {}) =>
  useQuery('itemListToProduce', () => getToProduceList(), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useGetProducedItem = ({ type, producedItemId }, queryOptions = {}) =>
  useQuery(['producedItem', type, producedItemId], () => postGetProducedItem({ type, producedItemId }), {
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

const useSaleOrderCustomerData = () => {
  return { useSaleOrderCustomerGroupData, useGetToProduceList, useGetProducedItem };
};

export default useSaleOrderCustomerData;
