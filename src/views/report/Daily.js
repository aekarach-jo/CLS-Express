/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/TableDailyReport';
import React, { useEffect, useMemo, useState } from 'react';
import { request } from 'utils/axios-utils';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import { useQuery } from 'react-query';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const searchReportAccount = async ({ filter }) => {
  const res = await request({
    url: '/report/daily-report',
    method: 'GET',
    params: { ...filter },
  });
  return res.data;
};

const Daily = () => {
  const { formatMessage: f } = useIntl();
  const title = 'Report Daily';
  const description = '';
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [dataObj, setDataObj] = useState();

  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'accounting');

  const columns = useMemo(() => {
    return [
      {
        Header: 'Start Date',
        accessor: 'start_date',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'End Date',
        accessor: 'end_date',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },

      {
        Header: 'Group',
        accessor: 'group',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Description',
        accessor: 'description',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Import Actual',
        accessor: 'import_actual',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'QTY',
        accessor: 'qty',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Weight',
        accessor: 'weight',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Total LAK ',
        accessor: 'total_lak',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Total LAK / Weight',
        accessor: 'total_lak_weight',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Total (LAK)',
        accessor: 'totalLak',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Total (CNY)',
        accessor: 'totalCny',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Cash',
        accessor: 'cash',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Transfer',
        accessor: 'transfer',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'Alipay',
        accessor: 'alipay',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
      {
        Header: 'WeChat pay',
        accessor: 'wechatPay',
        sortable: false,
        headerClassName: 'text-medium text-light bg-dark text-end',
      },
    ];
  }, []);

  const tableInstance = useTable(
    {
      columns,
      data,
      filter,
      setData,
      setFilter,
      manualPagination: true,
      manualGlobalFilter: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetSortBy: false,
      filterTypes: ['name', 'phone'],
      setDataObj,
      dataObj,
      initialState: { pageIndex: 0, pageSize: 1000 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowState
  );
  const {
    state: { globalFilter, pageIndex: page, pageSize, sortBy },
  } = tableInstance;

  const sortByFromTable = ([field]) => {
    if (!field) {
      return {};
    }

    return {
      sortField: field.id,
      sortDirection: field.desc ? 'desc' : 'asc',
    };
  };

  const { isFetching } = useQuery(
    ['searchParcel', filter, pageSize, sortBy, page],
    () => searchReportAccount({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }), // ใช้ฟังก์ชันนี้แทนการเรียกโดยตรง
    {
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        console.log(result);
        setDataObj(result);
        setData(result.income_other);
      },
      onError(err) {
        console.log(err);

        console.error('Search error :', err);
      },
    }
  );

  useEffect(() => {
    setFilter((currentFilter) => {
      const newFilter = { ...currentFilter };
      if (globalFilter !== '') {
        newFilter.searchText = globalFilter;
      } else {
        delete newFilter.searchText;
      }
      return newFilter;
    });
  }, [globalFilter]);

  const handleExport = async () => {
    const exportData = [
      {
        'Start Date': dataObj?.import_parcels.start_date || '',
        'End Date': dataObj?.import_parcels.end_date || '',
        Group: dataObj?.import_parcels.group || '',
        Description: dataObj?.import_parcels.description || '',
        'Import Actual': dataObj?.import_parcels.import_actual || '',
        QTY: dataObj?.import_parcels.qty_create_bill || '',
        Weight: dataObj?.import_parcels.weight_create_bill || '',
        'Total LAK': dataObj?.import_parcels.total_lak || '',
        'Total LAK / Weight': dataObj?.import_parcels.price_per_weight || '',
        'Total (LAK)': dataObj?.import_parcels.payment_total_lak || '',
        'Total (CNY)': dataObj?.import_parcels.payment_total_cny || '',
        Cash: dataObj?.import_parcels.payment_cash || '',
        Transfer: dataObj?.import_parcels.payment_transfer || '',
        Alipay: dataObj?.import_parcels.payment_alipay || '',
        'WeChat pay': dataObj?.import_parcels.payment_wechatpay || '',
      },
      {
        'Start Date': dataObj?.parcel_shipped_success.start_date || '',
        'End Date': dataObj?.parcel_shipped_success.end_date || '',
        Group: dataObj?.parcel_shipped_success.group || '',
        Description: dataObj?.parcel_shipped_success.description || '',
        'Import Actual': dataObj?.parcel_shipped_success.import_actual || '',
        QTY: dataObj?.parcel_shipped_success.qty_create_bill || '',
        Weight: dataObj?.parcel_shipped_success.weight_create_bill || '',
        'Total LAK': dataObj?.parcel_shipped_success.total_lak || '',
        'Total LAK / Weight': dataObj?.parcel_shipped_success.price_per_weight || '',
        'Total (LAK)': dataObj?.parcel_shipped_success.payment_total_lak || '',
        'Total (CNY)': dataObj?.parcel_shipped_success.payment_total_cny || '',
        Cash: dataObj?.parcel_shipped_success.payment_cash || '',
        Transfer: dataObj?.parcel_shipped_success.payment_transfer || '',
        Alipay: dataObj?.parcel_shipped_success.payment_alipay || '',
        'WeChat pay': dataObj?.parcel_shipped_success.payment_wechatpay || '',
      },
      {
        'Start Date': dataObj?.in_stock.start_date || '',
        'End Date': dataObj?.in_stock.end_date || '',
        Group: dataObj?.in_stock.group || '',
        Description: dataObj?.in_stock.description || '',
        'Import Actual': dataObj?.in_stock.import_actual || '',
        QTY: dataObj?.in_stock.qty_create_bill || '',
        Weight: dataObj?.in_stock.weight_create_bill || '',
        'Total LAK': dataObj?.in_stock.total_lak || '',
        'Total LAK / Weight': dataObj?.in_stock.price_per_weight || '',
        'Total (LAK)': dataObj?.in_stock.payment_total_lak || '',
        'Total (CNY)': dataObj?.in_stock.payment_total_cny || '',
        Cash: dataObj?.in_stock.payment_cash || '',
        Transfer: dataObj?.in_stock.payment_transfer || '',
        Alipay: dataObj?.in_stock.payment_alipay || '',
        'WeChat pay': dataObj?.in_stock.payment_wechatpay || '',
      },
      {
        'Start Date': dataObj?.import_parcels_forsale.start_date || '',
        'End Date': dataObj?.import_parcels_forsale.end_date || '',
        Group: dataObj?.import_parcels_forsale.group || '',
        Description: dataObj?.import_parcels_forsale.description || '',
        'Import Actual': dataObj?.import_parcels_forsale.import_actual || '',
        QTY: dataObj?.import_parcels_forsale.qty_create_bill || '',
        Weight: dataObj?.import_parcels_forsale.weight_create_bill || '',
        'Total LAK': dataObj?.import_parcels_forsale.total_lak || '',
        'Total LAK / Weight': dataObj?.import_parcels_forsale.price_per_weight || '',
        'Total (LAK)': dataObj?.import_parcels_forsale.payment_total_lak || '',
        'Total (CNY)': dataObj?.import_parcels_forsale.payment_total_cny || '',
        Cash: dataObj?.import_parcels_forsale.payment_cash || '',
        Transfer: dataObj?.import_parcels_forsale.payment_transfer || '',
        Alipay: dataObj?.import_parcels_forsale.payment_alipay || '',
        'WeChat pay': dataObj?.import_parcels_forsale.payment_wechatpay || '',
      },
      {
        'Start Date': dataObj?.import_parcels_forbuy.start_date || '',
        'End Date': dataObj?.import_parcels_forbuy.end_date || '',
        Group: dataObj?.import_parcels_forbuy.group || '',
        Description: dataObj?.import_parcels_forbuy.description || '',
        'Import Actual': dataObj?.import_parcels_forbuy.import_actual || '',
        QTY: dataObj?.import_parcels_forbuy.qty_create_bill || '',
        Weight: dataObj?.import_parcels_forbuy.weight_create_bill || '',
        'Total LAK': dataObj?.import_parcels_forbuy.total_lak || '',
        'Total LAK / Weight': dataObj?.import_parcels_forbuy.price_per_weight || '',
        'Total (LAK)': dataObj?.import_parcels_forbuy.payment_total_lak || '',
        'Total (CNY)': dataObj?.import_parcels_forbuy.payment_total_cny || '',
        Cash: dataObj?.import_parcels_forbuy.payment_cash || '',
        Transfer: dataObj?.import_parcels_forbuy.payment_transfer || '',
        Alipay: dataObj?.import_parcels_forbuy.payment_alipay || '',
        'WeChat pay': dataObj?.import_parcels_forbuy.payment_wechatpay || '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');

    const wscols = [
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 20 }, // Group
      { wch: 30 }, // Description
      { wch: 15 }, // Import Actual
      { wch: 10 }, // QTY
      { wch: 10 }, // Weight
      { wch: 15 }, // Total LAK
      { wch: 20 }, // Total LAK / Weight
      { wch: 15 }, // Total (LAK)
      { wch: 15 }, // Total (CNY)
      { wch: 10 }, // Cash
      { wch: 15 }, // Transfer
      { wch: 15 }, // Alipay
      { wch: 15 }, // WeChat pay
    ];
    ws['!cols'] = wscols;

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dateRange = `${dataObj?.import_parcels.start_date || ''}_to_${dataObj?.import_parcels.end_date || ''}`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Daily_Report_${dateRange}.xlsx`);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle title={title} description={description} buttons={{ export: { onSubmit: () => handleExport(), isHide: role?.can_export === 0 } }} />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsStatusVerify
        hideControlsStatusBill
        hideControlsStatusParcel
        hideControlSearch
        hideControlsStatus
      />
    </>
  );
};

export default Daily;
