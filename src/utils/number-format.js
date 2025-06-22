/**
 * Create phone masking format for 'React-number-format'
 *
 * Every phone number starts with '02' will give format 9 digits. otherwise 10 digits.
 *
 * @link https://github.com/s-yadav/react-number-format
 * @link https://th.wikipedia.org/wiki/%E0%B8%AB%E0%B8%A1%E0%B8%B2%E0%B8%A2%E0%B9%80%E0%B8%A5%E0%B8%82%E0%B9%82%E0%B8%97%E0%B8%A3%E0%B8%A8%E0%B8%B1%E0%B8%9E%E0%B8%97%E0%B9%8C%E0%B9%83%E0%B8%99%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%97%E0%B8%A8%E0%B9%84%E0%B8%97%E0%B8%A2
 * @param {string} value Phone or Mobile phone number
 * @returns Phone masking format
 */
function mobileOrPhoneFormatMask(value) {
  if (`${value || ''}`.startsWith('02')) {
    return '(##) ###-####';
  }

  return '(###) ###-####';
}

export { mobileOrPhoneFormatMask };
