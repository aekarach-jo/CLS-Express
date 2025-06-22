const { useIntl } = require('react-intl');

const useFormat = () => {
  const { formatNumber } = useIntl();

  /**
   * Create number format function
   * @param {string|number} value Numbers
   * @param {number} defValue Default number
   * @param {import('react-intl').FormatNumberOptions} options Options
   * @returns string
   */
  const createNumberFn = (value, defValue = 0, options = {}) => (!value ? defValue : formatNumber(value, { style: 'decimal', ...options }));

  const createCurrencyFn = (value, defValue = 0) => (!value ? defValue : formatNumber(value, { style: 'currency', currency: 'THB' }));

  return { formatNumber: createNumberFn, formatCurrency: createCurrencyFn };
};

export default useFormat;
