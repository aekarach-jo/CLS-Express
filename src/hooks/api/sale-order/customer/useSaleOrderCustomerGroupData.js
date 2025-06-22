import { useMutation } from 'react-query';
import { request } from 'utils/axios-utils';
import queryClient from 'utils/query-client';

const responseTransformer = (resp) => {
  const { data } = resp;
  return data;
};

const createGroupFn = async ({ name, detail = [] }) => {
  const resp = await request({ url: `/saleOrder/groupCreate`, method: 'post', data: { name, detail } });
  return responseTransformer(resp.data);
};

const moveGroupFn = async ({ fromSaleOrderGroupId, toSaleOrderGroupId, saleOrderDetailId }) => {
  const resp = await request({
    url: `/saleOrder/groupMove`,
    method: 'post',
    data: { fromId: fromSaleOrderGroupId, toId: toSaleOrderGroupId, detail: saleOrderDetailId },
  });
  return responseTransformer(resp.data);
};

const removeGroupFn = async ({ saleOrderGroupId }) => {
  const resp = await request({ url: `/saleOrder/groupDelete`, method: 'post', data: { id: saleOrderGroupId } });
  return responseTransformer(resp.data);
};

const addItemToGroupFn = async ({ saleOrderGroupId, saleOrderDetailId }) => {
  const resp = await request({ url: `/saleOrder/groupIn`, method: 'post', data: { id: saleOrderGroupId, detail: saleOrderDetailId } });
  return responseTransformer(resp.data);
};

const removeItemFromGroupFn = async ({ saleOrderGroupId, saleOrderDetailId }) => {
  const resp = await request({ url: `/saleOrder/groupOut`, method: 'post', data: { id: saleOrderGroupId, detail: saleOrderDetailId } });
  return responseTransformer(resp.data);
};

const useCreateGroupMutation = (mutationOptions = {}) =>
  useMutation(createGroupFn, {
    ...mutationOptions,
    onSuccess: (resp) => {
      queryClient.invalidateQueries('itemListToProduce');
      mutationOptions.onSuccess?.(resp);
    },
  });

const useMoveGroupMutation = (mutationOptions = {}) =>
  useMutation(moveGroupFn, {
    ...mutationOptions,
  });

const useRemoveGroupMutation = (mutationOptions = {}) =>
  useMutation(removeGroupFn, {
    ...mutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries('itemListToProduce');
      mutationOptions.onSuccess?.();
    },
  });

const useAddItemToGroupMutation = (mutationOptions = {}) =>
  useMutation(addItemToGroupFn, {
    ...mutationOptions,
  });

const useRemoveItemFromGroupMutation = (mutationOptions = {}) =>
  useMutation(removeItemFromGroupFn, {
    ...mutationOptions,
  });

const useSaleOrderCustomerGroupData = () => {
  return {
    useCreateGroupMutation,
    useMoveGroupMutation,
    useRemoveGroupMutation,
    useAddItemToGroupMutation,
    useRemoveItemFromGroupMutation,
  };
};

export default useSaleOrderCustomerGroupData;
