/* eslint-disable operator-assignment */
import React, { useState } from 'react';
import { SERVICE_URL } from 'config';
import { request } from 'utils/axios-utils';
import { useQuery } from 'react-query';
import useProductPlanOptions from './useProductPlanOptions';

const searchProductionPlan = async (lotNo) => {
  const res = await request({
    url: `${SERVICE_URL}/productionPlan/find`,
    params: {
      productionOrderNo: lotNo,
    },
  });
  return res.data;
};

const useSumActualProduction = ({ lotNo = undefined, stepIn = undefined }) => {
  const searchProductionLot = useQuery(['filterPlanLotNo', lotNo], () => searchProductionPlan(lotNo), {
    enabled: !!lotNo,
    refetchOnWindowFocus: false,
    onSuccess(resp) {
      const { data: result } = resp;
      const filterProductionOrderItemList = result?.[0]?.productSubType?.[0] || [];
      const newArr = filterProductionOrderItemList?.machine?.flatMap((obj) => obj.planDate);
      const newArrItemList = newArr.flatMap((obj) => obj.itemList);
      let sum = 0;
      let currentStep = stepIn?.value || stepIn;
      while (currentStep !== null) {
        // eslint-disable-next-line no-loop-func
        const item = newArrItemList.find((i) => i.step === currentStep);
        if (item) {
          sum += item?.operationDoc?.defectAmount || 0;
          currentStep = item.previousStep;
        } else {
          break;
        }
      }
      resp.actual = sum || 0;
      resp.data = newArrItemList;
      console.log(resp);
    },
    onError(err) {
      console.error('Error fetching list', err);
    },
  });
  return searchProductionLot;
};

const useCalculateOperation = ({ lots = [], currentStep = undefined, actual = 0, actualProducedAmount = 0, defect = 0 }) => {
  console.log(lots);
  const currentStepData = lots.find((i) => i.step === currentStep);
  console.log(`${currentStepData?.step}1`);
  const previousStepData = lots.find((i) => i.step === currentStepData?.previousStep);
  const nextStepData = lots.find((i) => i.step === Number(`${currentStepData?.step}1`));
  let cavity = 1;
  if (
    currentStep === 11 ||
    currentStep === 111 ||
    currentStep === 12 ||
    currentStep === 121 ||
    currentStep === 13 ||
    currentStep === 131 ||
    currentStep === 14 ||
    currentStep === 141 ||
    currentStep === 15 ||
    currentStep === 151 ||
    currentStep === 16 ||
    currentStep === 161 ||
    currentStep === 17 ||
    currentStep === 171 ||
    currentStep === 18 ||
    currentStep === 181 ||
    currentStep === 19 ||
    currentStep === 191 ||
    currentStep === 20 ||
    currentStep === 201 ||
    currentStep === 26 ||
    currentStep === 261
  ) {
    cavity = currentStepData?.productCavity || 1;
    // previousStepData.operationDoc.actualProducedAmount = previousStepData?.operationDoc?.actualProducedAmount / previousStepData?.productCavity;
  }
  console.log(currentStepData);
  console.log(previousStepData);
  console.log(nextStepData);
  const defectD = defect || 0;
  const amountToproduceA = currentStepData?.isFirstStep
    ? currentStepData?.productionProducedAmount + currentStepData?.productionAdditionalPrintedAmount * currentStepData?.productCavity
    : previousStepData?.operationDoc?.actualProducedAmount;
  const actualProductionB =
    currentStepData?.operationDoc?.defectAmount !== actual
      ? currentStepData?.productionProducedAmount + currentStepData?.productionAdditionalPrintedAmount * currentStepData?.productCavity - actual
      : amountToproduceA - defectD;
  const actualProduceAmountC = actualProducedAmount || 0;

  const val = {
    a_amountToproduce: amountToproduceA / cavity || 0,
    b_actualProduction: actualProductionB / cavity || 0,
    c_actualProduceAmount: actualProduceAmountC || 0,
    d_defect: defectD || 0,
    e_additionalPrintedAmount: currentStepData?.productionAdditionalPrintedAmount / cavity || 0,
    f_sumaryDefect: actual / cavity || 0,
    g_differenceProduceAmount: (currentStepData?.productionProducedAmount - actualProducedAmount) / cavity || 0,
    h_previousActualProduceAmount: previousStepData?.operationDoc?.actualProducedAmount / cavity || 0,
    i_nextStepDefect: nextStepData?.operationDoc?.defectAmount / cavity || 0,
    j_nextStepHasChanged: nextStepData?.status === 'COMPLETED' && currentStepData?.status === 'CONFIRMED',
  };
  console.log(val);
  return val;
};

const useActualProduction = () => {
  return { useSumActualProduction, useCalculateOperation };
};

export default useActualProduction;
