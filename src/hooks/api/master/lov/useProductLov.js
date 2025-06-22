import { groupBy } from 'lodash';
import { useMutation, useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import queryClient from 'utils/query-client';

/**
 * @typedef {'typegroup'} ProductLovCondition
 * @typedef {{
 *  condition: ProductLovCondition | undefined
 * }} ProductLovParams
 * @typedef {
 *  'PRODUCT_PRINT' |
 *  'PRODUCT_COATING'
 * } ProductType
 * @typedef {{
 *  abbr: string,
 *  code: string,
 *  name: string,
 *  isFixed?: boolean,
 *  isDeleted?: boolean,
 *  id: string,
 *  type: ProductType
 * }} ProductItem
 */

/**
 * Transform function
 * @param {ProductItem[]} data
 */
function transformLovByGroup(data) {
  return groupBy(data, 'type');
}

/**
 * @param {ProductLovParams} params
 */

const productReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/product/find',
    params,
  });
  const respData = resp.data?.data;

  return respData;
};

const productListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/product/list',
    params,
  });
  const respData = resp.data?.data;

  return isGroup ? transformLovByGroup(respData) : respData;
};
const productLovStickerLot = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/productionPlan/productionOrderList/?statusMulti=NOTSTART,INPROGRESS,COMPLETED,SUBMITTED&stickerPrintStatus=',
    params,
  });
  const respData = resp.data?.data;
  const arryData = [];
  respData?.forEach((e) => {
    e.productSubType[0].itemList.forEach((i) => {
      arryData.push(i);
    });
  });

  return arryData;
};
const creasingLovReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/product/list?type=PRODUCT_CREASING',
    params,
  });
  const respData = resp.data?.data;

  return isGroup ? transformLovByGroup(respData) : respData;
};

const patchingListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/product/list?type=PRODUCT_PATCHING',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};
const productionData = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/production/find',
    params,
  });
  const respData = resp.data?.data;
  return respData;
};
const productGroupData = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/lov/material/list?condition=typegroup',
    params,
  });
  const respData = resp.data?.data;
  return respData;
};
const stockSupplierListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/purchaseItem/findStockSupplier',
    params,
  });
  const respData = resp.data?.data;
  return respData;
};
const callInventory = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/material/find?type=RM',
    params,
  });
  const respData = resp.data?.data;
  return respData;
};
const productManageSelectData = async (params = {}, typeParams = {}, isGroup = false) => {
  const respData = await productListReq(params, isGroup);
  const respType = await productListReq(typeParams, isGroup);
  const list = [];
  respType.forEach((element) => {
    if (!element.isDeleted) {
      const obj = {
        value: element.id,
        label: element.name,
      };
      list.push(obj);
    }
  });
  respData.forEach((data, indexI) => {
    respType.forEach((element) => {
      if (element.id === data.linkId) {
        respData[indexI].typeName = { value: element.id, label: element.name };
      }
    });
  });
  respData.typeData = list;
  return isGroup ? transformLovByGroup(respData) : respData;
};
const productColorPrint = async (params = {}, isGroup = false) => {
  let respData = await productListReq({ type: 'PRODUCT_COLOR' }, isGroup);
  let respType = await productListReq({ type: 'PRODUCT_COLOR_GROUP' }, isGroup);
  respData = respData.PRODUCT_COLOR;
  respType = respType.PRODUCT_COLOR_GROUP;
  if (respData !== undefined) {
    const printResp = [];
    respData.forEach((data, indexI) => {
      respType.forEach((element) => {
        if (element.id === data.linkId) {
          respData[indexI].typeName = { value: element.id, label: element.name };
          if (element.name === 'สีพิมพ์') {
            printResp.push(respData[indexI]);
          }
        }
      });
    });
    respData = printResp;
  } else {
    respData = [];
  }
  return isGroup ? transformLovByGroup(respData) : respData;
};
const productColorCoat = async (params = {}, isGroup = false) => {
  let respData = await productListReq({ type: 'PRODUCT_COLOR' }, isGroup);
  let respType = await productListReq({ type: 'PRODUCT_COLOR_GROUP' }, isGroup);
  respData = respData.PRODUCT_COLOR;
  respType = respType.PRODUCT_COLOR_GROUP;
  if (respData !== undefined) {
    const coatResp = [];
    respData.forEach((data, indexI) => {
      respType.forEach((element) => {
        if (element.id === data.linkId) {
          respData[indexI].typeName = { value: element.id, label: element.name };
          if (element.name === 'สีเคลือบ') {
            coatResp.push(respData[indexI]);
          }
        }
      });
    });
    respData = coatResp;
  } else {
    respData = [];
  }
  // respData = coatResp;
  return isGroup ? transformLovByGroup(respData) : respData;
};
const machineListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/masterData/machine/list',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};
const defectListReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/productionPlan/lov/defect/list',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const defectTypeReq = async (params = {}, isGroup = false) => {
  const resp = await request({
    url: '/productionPlan/lov/messageType/list',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};

const storeLocationListReq = async (params = {}, isGroup = false) => {
  console.log(params);
  const resp = await request({
    url: '/storeLocation/find?isDeleted=false',
    params,
  });

  const respData = resp.data?.data;
  return respData;
};
const storeLocationMatListReq = async (productId = '', productPiecePerPack = 0, isGroup = false) => {
  const resProduct = await request({
    url: '/inventory/product/find',
    params: { productId },
  });
  // const resp = await request({
  //   url: '/inventory/material/find',
  // });
  // const respStore = await request({
  //   url: '/storeLocation/find?isDeleted=false',
  // });
  // const respData = resp.data?.data;
  // const combinedData = [...(resp.data?.data || []), ...(resProduct.data?.data || [])];
  resProduct.data?.data.forEach((element) => {
    let availableAmount = 0;
    element.batchNoList?.forEach((subElement) => {
      // eslint-disable-next-line no-underscore-dangle
      subElement.optionValue = { label: subElement.batchNo, value: subElement._id };
      subElement.optionAmount = Number(subElement.amount);
      subElement.amount = subElement.optionAmount / Number(productPiecePerPack);
      subElement.fraction = subElement.optionAmount % Number(productPiecePerPack);
      subElement.calculateAmount = subElement.optionAmount / Number(productPiecePerPack);
      subElement.calculateFrac = subElement.optionAmount % Number(productPiecePerPack);
      // subElement.baseAmount = subElement.amount;
      // subElement.amount = Number(subElement.amount) / Number(productPiecePerPack);
      console.log(subElement);
      subElement.lostAmount = 0;
      subElement.lostFrac = 0;
      availableAmount += subElement.amount;
      subElement.availableAmount = availableAmount;
    });
  });
  return resProduct.data?.data;
};

const printTypeSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'print',
      data,
    },
  });

  return resp.data?.data;
};

const coatingTypeSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'coating',
      data,
    },
  });

  return resp.data?.data;
};

const colorSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'color',
      data,
    },
  });

  return resp.data?.data;
};

const productTypeSaveReq = async (data = []) => {
  const resp = await request({
    url: '/masterData/lov/product/save',
    method: 'post',
    data: {
      condition: 'productType',
      data,
    },
  });

  return resp.data?.data;
};
const useSubtypeReq = async () => {
  const {
    data: { data },
  } = await request({
    url: '/masterData/lov/product/list?type=PRODUCT_SUBTYPE',
  });
  return data;
};

const useMachineLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('machineLovAll', () => machineListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useMachineLovFil = ({ filterPrint: params, isGroup } = {}, queryOptions = {}) =>
  useQuery('useMachineLovFil', () => machineListReq(params, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useDefectLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useDefectLov', () => defectListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useDefectType = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useDefectType', () => defectTypeReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProduct = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('productAll', () => productReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('productLovAll', () => productListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useCreasingLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useCreasingLov', () => creasingLovReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const usePacthingLov = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('usePacthingLov', () => patchingListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useStoreLocationLov = ({ params, isGroup } = {}, queryOptions = {}) =>
  useQuery('useStoreLocationLov', () => storeLocationListReq(params, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useStoreLocationLovMat = ({ productId, productPiecePerPack, isGroup } = {}, queryOptions = {}) =>
  useQuery('useStoreLocationLovMat', () => storeLocationMatListReq(productId, productPiecePerPack, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useProductColorCoat = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductColorCoat', () => productColorCoat({ type: 'PRODUCT_COLOR_COAT' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useProductColorPrint = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductColorPrint', () => productColorPrint({ type: 'PRODUCT_COLOR_PRINT' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useProductLovTypePrint = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('productLovTypePrint', () => productManageSelectData({ type: 'PRODUCT_COLOR' }, { type: 'PRODUCT_COLOR_GROUP' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLovTypeCoating = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductLovTypeCoating', () => productListReq({ type: 'PRODUCT_COATING' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useLovStickerLot = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useLovStickerLot', () => productLovStickerLot({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProductLovType = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductLovType', () => productManageSelectData({ type: 'PRODUCT_TYPE' }, { type: 'PRODUCT_GROUP' }, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useProductGroup = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useProductGroup', () => productGroupData(isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useProduction = ({ params, isGroup } = {}, queryOptions = {}) =>
  useQuery('useProduction', () => productionData(params, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useStockSupplier = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useStockSupplier', () => stockSupplierListReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const useInventory = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useInventory', () => callInventory({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });
const useSubtypeData = ({ isGroup } = {}, queryOptions = {}) =>
  useQuery('useSubtypeData', () => useSubtypeReq({}, isGroup), {
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...queryOptions,
  });

const reloadAllCachesPromises = () =>
  Promise.all([
    queryClient.invalidateQueries('machineLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useMachineLovFil', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useDefectLov', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useDefectType', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('productLovAll', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('productLovTypePrint', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useStoreLocationLov', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useStoreLocationLovMat', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useCreasingLov', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProductLovTypeCoating', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useLovStickerLot', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProductLovType', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('usePacthingLov', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProductColorCoat', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProductColorPrint', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useProduction', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useSubtypeData', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useStockSupplier', { refetchActive: true, refetchInactive: true }),
    queryClient.invalidateQueries('useInventory', { refetchActive: true, refetchInactive: true }),
  ]);

const usePrintTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(printTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useCoatingTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(coatingTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useColorSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(colorSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useProductTypeSaveMutation = (/** @type {import('react-query/types').MutationOptions} */ mutationOptions = {}) =>
  useMutation(productTypeSaveReq, {
    ...mutationOptions,
    onSuccess(...params) {
      return Promise.all([reloadAllCachesPromises(), mutationOptions.onSuccess?.(...params)]);
    },
  });

const useProductLovData = () => {
  return {
    useMachineLov,
    useMachineLovFil,
    useDefectLov,
    useDefectType,
    useProduct,
    useProductLov,
    useCreasingLov,
    usePacthingLov,
    useProductColorCoat,
    useProductColorPrint,
    useProductLovTypePrint,
    useProductLovTypeCoating,
    useLovStickerLot,
    useProductLovType,
    useProductGroup,
    useProduction,
    useStoreLocationLov,
    useStoreLocationLovMat,
    usePrintTypeSaveMutation,
    useCoatingTypeSaveMutation,
    useColorSaveMutation,
    useProductTypeSaveMutation,
    useStockSupplier,
    useSubtypeData,
    useInventory,
  };
};

export default useProductLovData;
