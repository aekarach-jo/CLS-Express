const useConvertCurrency = (value = 0, deciaml) => {
  const currency = new Intl.NumberFormat('en-US', { minimumFractionDigits: deciaml, maximumFractionDigits: deciaml }).format(Number(value));
  return currency.includes('NaN') ? '-' : currency;
};

const useConvert = () => {
  return { useConvertCurrency };
};

export default useConvert;
