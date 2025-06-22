/* eslint-disable react/destructuring-assignment */
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const DatepickerRangeMultiple = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  return (
    <>
      <Row className="g-2">
        <Col>
          <DatePicker
            className="form-control"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
        <Col>
          <DatePicker
            className="form-control"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={subtractDays(startDate, 30)}
            maxDate={addDays(startDate, 30)}
            dateFormat="dd/MM/yyyy"
          />
        </Col>
      </Row>
    </>
  );
};

export const DatepickerRangeSingle = (props) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    console.log(start, end);

    if (start && end) {
      props.onChange({ startDate: start, endDate: end });
    } else if (!start && !end) {
      props.onChange({ startDate: start, endDate: end });
    }
  };

  return (
    <>
      <DatePicker
        isClearable
        className={`form-control rounded-sm ${props.className}`}
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        minDate={startDate ? subtractDays(startDate, 30) : null}
        maxDate={startDate ? addDays(startDate, 30) : null}
        dateFormat="dd/MM/yyyy"
      />
    </>
  );
};
