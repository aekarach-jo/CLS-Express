import React from 'react';

const useConvertReamToSheet = ({ value }) => {
  const integerPart = Math.floor(Number(value));
  const decimalPart = ((Number(value) - Number(integerPart)) * 500).toFixed(0);
  return { ream: integerPart, sheet: Number(decimalPart) };
};

const useConvertSheetToReam = ({ value }) => {
  const number = Number(value) / 500;
  const integerPart = Math.floor(Number(number));
  const decimalPart = ((Number(number) - Number(integerPart)) * 500).toFixed(0);
  return { ream: integerPart, sheet: Number(decimalPart) };
};

const useConvertUOM = () => {
  return { useConvertReamToSheet, useConvertSheetToReam };
};

export default useConvertUOM;
