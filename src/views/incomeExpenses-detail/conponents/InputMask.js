import React from 'react';
import NumberFormat from 'react-number-format';

export const InputMask = ({ onChange }) => {
  const handleChange = (e) => {
    console.log(e);
    
    const { value } = e.target;
    onChange(value);
  };
  return <NumberFormat className="form-control" format="#.#####" mask="-" allowEmptyFormatting onChange={handleChange} />;
};
