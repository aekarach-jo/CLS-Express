/* eslint-disable no-else-return */
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import Select from 'react-select';
import { DatepickerRangeSingle } from 'components/datepicker/DatepickerRange';
import moment from 'moment';
import ControlsSearch from './ControlsSearch';

const statusOptions = [
  { value: 1, label: 'Active' },
  { value: 0, label: 'Inactive' },
];

const statusPacking = [
  { value: 1, label: 'Checked' },
  { value: 0, label: 'Pending' },
];

const statusBillOptions = [
  { value: 'success', label: 'Success' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'ready', label: 'Ready' },
  { value: 'waiting_payment', label: 'Waiting Payment' },
];

const statusParcelOptions = [
  { value: 'success', label: 'Success' },
  { value: 'return', label: 'Return' },
  { value: 'ready', label: 'Ready' },
  { value: 'pending', label: 'Pending' },
];

const statusVerifyOptions = [
  { value: 'verify', label: 'Verify' },
  { value: 'pending', label: 'Pending' },
];

const statusPaymentOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
];

const FilterForm = ({
  isPaymentStatus,
  tableInstance,
  hideControlSearch,
  isDepartment,
  isCustomerLevel,
  hideControlsStatusBill,
  isVerify,
  isControlsStatusPacking,
  hideControlsStatus,
  hideControlsStatusVerify,
  hideControlsStatusParcel,
  hideControlsDateRange,
  isShipping,
  isLoading,
  isCurrencyDate,
  onClickShipped,
}) => {
  const { formatMessage: f } = useIntl();

  const { gotoPage, setFilter, filter } = tableInstance;
  const { location } = useHistory();
  const [billFilterStatus, setBillFilterStatus] = React.useState();

  const onSetFilter = (dataResult, type, isParcel) => {
    if (location.pathname === '/bill') {
      setBillFilterStatus(dataResult);
      sessionStorage.setItem('billFilterStatus', statusBillOptions.find((s) => s.value === dataResult?.value)?.value);
    }
    if (dataResult?.value === 'success') {
      setFilter({
        ...filter,
        filters:
          filter?.filters
            ?.split(',')
            .filter((fa) => !fa.includes('status:neq:success'))
            .join(',') || 'status:eq:success',
      });
    }
    let result = dataResult?.detail?.id || dataResult?.value;
    if (result === 1 && (type === 'active' || type === 'verify')) {
      result = 1;
    } else if (result === 0 && (type === 'active' || type === 'verify')) {
      result = 0;
    } else if (result === undefined) {
      result = null;
    }

    const currentFilter = filter?.filters?.split(',').find((fa) => fa.includes(`${type}:eq:`));
    console.log(currentFilter);

    if (currentFilter && currentFilter.includes(`${type}:eq:`) && result !== null) {

      const updatedFilters = filter?.filters
        .split(',')
        .filter((fa) => !fa.includes(`${type}:eq:`))
        .join(',');

      setFilter({ ...filter, filters: `${updatedFilters ? `${updatedFilters},` : ''}${type}:eq:${result}`, page: 0 });
    } else if (result === null) {
      const updatedFilters = filter?.filters
        .split(',')
        .filter((fa) => !fa.includes(`${type}:eq:`))
        .join(',');
      if (updatedFilters) {
        setFilter({ filters: updatedFilters, page: 0 });
      } else {
        setFilter({ ...filter, page: 0, filters: undefined });
      }
      if (isParcel === 'isParcel') {
        setFilter({
          ...filter,
          filters: 'status:neq:success',
        });
      }
    } else {
      const cleanedFilters = filter?.filters
        ?.split(',')
        .filter((fa) => !fa.startsWith(`${type}:`))
        .join(',');
      setFilter({
        ...filter,
        filters: `${cleanedFilters ? `${cleanedFilters},` : ''}${type}:eq:${result}`,
        page: 0,
      });
    }
    if (result === undefined) {
      setFilter({ page: 0 });
    }
    gotoPage(0);
  };

  const onSetFilterDateRange = (dataResult) => {
    const startData = dataResult.startDate ? moment(dataResult.startDate).format('YYYY-MM-DD 00:00:00') : null;
    const endDate = dataResult.endDate ? moment(dataResult.endDate).format('YYYY-MM-DD 23:59:59') : null;
    if (!startData && !endDate) {
      setFilter({});
    } else {
      setFilter({
        ...filter,
        start_at: `${startData}`,
        end_at: `${endDate}`,
      });
    }
    gotoPage(0);
  };

  useEffect(() => {
    if (location.pathname === '/bill') {
      const statusFilterBill = sessionStorage.getItem('billFilterStatus');
      const findStatusBill = statusBillOptions.find((s) => s.value === statusFilterBill);
      if (findStatusBill) {
        onSetFilter(findStatusBill, 'status');
      }
    }
  }, []);

  return (
    <Row>
      {!hideControlSearch && (
        <Col md="4" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">Search</Form.Label>
          <div className="d-inline-block float-md-start ps-1 me-1 mb-1 mb-md-0 search-input-container w-100 shadow bg-foreground">
            <ControlsSearch tableInstance={tableInstance} />
          </div>
        </Col>
      )}
      {isDepartment && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'user.field.department' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={isDepartment || []} required onChange={(e) => onSetFilter(e, 'department_id')} />
        </Col>
      )}
      {isCustomerLevel && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'role.field.level' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={isCustomerLevel || []} required onChange={(e) => onSetFilter(e, 'customer_level_id')} />
        </Col>
      )}
      {isVerify && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'role.field.verify' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={isVerify || []} required onChange={(e) => onSetFilter(e, 'verify')} />
        </Col>
      )}
      {!hideControlsStatus && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={statusOptions || []} required onChange={(e) => onSetFilter(e, 'active')} />
        </Col>
      )}
      {!hideControlsStatusBill && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select
            isClearable
            classNamePrefix="react-select"
            options={statusBillOptions || []}
            value={billFilterStatus}
            required
            onChange={(e) => onSetFilter(e, 'status')}
          />
        </Col>
      )}
      {!hideControlsStatusVerify && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={statusVerifyOptions || []} required onChange={(e) => onSetFilter(e, 'status')} />
        </Col>
      )}
      {!hideControlsStatusParcel && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select
            isClearable
            classNamePrefix="react-select"
            options={statusParcelOptions || []}
            required
            onChange={(e) => onSetFilter(e, 'status', 'isParcel')}
          />
        </Col>
      )}
      {isControlsStatusPacking && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={statusPacking || []} required onChange={(e) => onSetFilter(e, 'packing')} />
        </Col>
      )}
      {isPaymentStatus && (
        <Col md="2" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.status' })}</Form.Label>
          <Select isClearable classNamePrefix="react-select" options={statusPaymentOptions || []} required onChange={(e) => onSetFilter(e, 'status')} />
        </Col>
      )}
      {!hideControlsDateRange && (
        <Col md="3" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.dateRange' })}</Form.Label>
          <DatepickerRangeSingle
            tableInstance={tableInstance}
            className="ps-2"
            onChange={(e) => onSetFilterDateRange(e, { startAt: 'start_at', endAt: 'end_at' })}
          />
        </Col>
      )}
      {isCurrencyDate && (
        <Col md="3" sm="12" xs="12">
          <Form.Label className="px-2 m-0 fs-7">{f({ id: 'common.dateRange' })}</Form.Label>
          <DatepickerRangeSingle
            tableInstance={tableInstance}
            className="ps-2"
            onChange={(e) => onSetFilterDateRange(e, { startAt: 'start_at', endAt: 'end_at' })}
            maxDate={moment().add(31, 'days').toDate()}
          />
        </Col>
      )}
      {isShipping && (
        <Col md={6} sm="12" xs="12">
          <Button
            variant="primary"
            className="float-end btn-icon btn-icon-start pt-1 w-100 w-md-auto mb-1 ms-1 mt-3 rounded-sm"
            onClick={() => onClickShipped(true)}
            disabled={isLoading}
          >
            <img src="/img/icons/truck-white.png" alt="truck" /> <span>Shipping</span>
          </Button>
        </Col>
      )}
    </Row>
  );
};

export default FilterForm;
