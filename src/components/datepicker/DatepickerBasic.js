import moment from 'moment';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatepickerBasic = ({ onChange, value, disabled = false }) => {
  const dateData = value ? moment(value).toDate() : null;
  const [startDate, setStartDate] = useState(dateData);

  useEffect(() => {
    if (value) {
      setStartDate(dateData);
    }
  }, [value]);

  const handleChange = (date) => {
    setStartDate(date);
    onChange(date);
  };
  return <DatePicker className="form-control py-0" selected={startDate} disabled={disabled} onChange={(date) => handleChange(date)} dateFormat="yyyy/MM/dd" />;
};

export default DatepickerBasic;
