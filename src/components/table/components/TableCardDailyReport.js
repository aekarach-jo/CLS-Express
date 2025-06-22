/* eslint-disable no-restricted-globals */
import classNames from 'classnames';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import React, { useCallback, useMemo } from 'react';
import { Form, Table as TableR } from 'react-bootstrap';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import './style.css';
import useConvert from 'hooks/useConvert';

const Table = ({ tableInstance, className = 'react-table boxed', isCheckAll }) => {
  const { data, setData, setSelectToShipping, getTableProps, headerGroups, getTableBodyProps, dataObj } = tableInstance;
  const { useConvertCurrency } = useConvert();
  const handleCheckAll = (event) => {
    if (event.target.checked) {
      const addCheckallToDataList = data?.map((item) => {
        return {
          ...item,
          checked: true,
        };
      });
      setData(addCheckallToDataList);
      setSelectToShipping(addCheckallToDataList);
    } else {
      const addCheckallToDataList = data?.map((item) => {
        return {
          ...item,
          checked: false,
        };
      });
      setData(addCheckallToDataList);
      setSelectToShipping([]);
    }
  };

  const sumIncomeLak = useMemo(() => {
    return dataObj?.income_other.reduce((acc, item) => acc + Number(String(item.amount_lak || '0').replace(/,/g, '')), 0);
  }, [dataObj]);

  const sumIncomeCny = useMemo(() => {
    return dataObj?.income_other.reduce((acc, item) => acc + Number(String(item.amount_cny || '0').replace(/,/g, '')), 0);
  }, [dataObj]);

  const sumExpensesLak = useMemo(() => {
    return dataObj?.expenses_other.reduce((acc, item) => acc + Number(String(item.amount_lak || '0').replace(/,/g, '')), 0);
  }, [dataObj]);

  const sumExpensesCny = useMemo(() => {
    return dataObj?.expenses_other.reduce((acc, item) => acc + Number(String(item.amount_cny || '0').replace(/,/g, '')), 0);
  }, [dataObj]);

  const netOperatingLak = useMemo(() => {
    return Number((dataObj?.parcel_shipped_success.payment_total_lak || '0').replace(/,/g, '')) + Number(sumIncomeLak || 0) + Number(sumExpensesLak || 0);
  }, [dataObj, sumIncomeLak, sumExpensesLak]);

  const netOperatingCny = useMemo(() => {
    return Number((dataObj?.parcel_shipped_success.total_cny || '0').replace(/,/g, '')) + Number(sumIncomeCny || 0) + Number(sumExpensesCny || 0);
  }, [dataObj, sumIncomeCny, sumExpensesCny]);

  const netOperatingCnyConvertLak = useMemo(() => {
    return Number((dataObj?.parcel_shipped_success.total_lak || '0').replace(/,/g, '')) + Number(sumIncomeCny || 0) + Number(sumExpensesCny || 0);
  }, [dataObj, sumIncomeCny, sumExpensesCny]);

  const sumIncome = dataObj?.income_top_up.reduce((acc, item) => acc + Number(String(item.pay_cash + item.pay_transfer || '0').replace(/,/g, '')), 0);
  const totalLakForBuy = Number(String(dataObj?.import_parcels_forbuy.price_per_weight || '0').replace(/,/g, ''));

  return (
    <OverlayScrollbarsComponent
      options={{ scrollbars: { autoHide: 'leave' }, overflowBehavior: { x: 'hidden', y: 'scroll' } }}
      style={{ maxHeight: '680px', borderRadius: '10px' }}
    >
      <TableR responsive className={`${className}`} {...getTableProps()} style={{ background: 'white', borderRadius: '5px' }}>
        <thead>
          {headerGroups.map((headerGroup, headerIndex) => (
            <tr key={`header${headerIndex}`} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => {
                return (
                  <th
                    key={`th.${index}`}
                    {...column.getHeaderProps(isCheckAll && index === 0 ? {} : column.getSortByToggleProps())}
                    className={`${classNames(column.headerClassName, {
                      sorting_desc: column.isSortedDesc,
                      sorting_asc: column.isSorted && !column.isSortedDesc,
                      sorting: column.sortable,
                    })} position-relative`}
                  >
                    {isCheckAll && index === 0 && (
                      <Form.Check className="position-absolute" style={{ left: 0 }} type="checkbox" label="" onClick={handleCheckAll} />
                    )}
                    {column.render('Header')}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="sh-md-2 table-daily-report">
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td style={{ minWidth: '8rem' }}>{dataObj?.import_parcels.start_date || ''}</td>
            <td style={{ minWidth: '8rem' }}>{dataObj?.import_parcels.end_date || ''}</td>
            <td style={{ minWidth: '13rem' }}>{dataObj?.import_parcels.group || ''}</td>
            <td style={{ minWidth: '12rem' }}>{dataObj?.import_parcels.description || ''}</td>
            <td style={{ minWidth: '10rem' }}>{dataObj?.import_parcels.import_actual || ''}</td>
            <td style={{ minWidth: '7rem' }}>{dataObj?.import_parcels.qty_create_bill || ''}</td>
            <td style={{ minWidth: '7rem' }}>{dataObj?.import_parcels.weight_create_bill || ''}</td>
            <td style={{ minWidth: '7rem' }}>{dataObj?.import_parcels.total_lak || ''}</td>
            <td style={{ minWidth: '10rem' }}>{dataObj?.import_parcels.price_per_weight || ''}</td>
            <td style={{ minWidth: '7rem' }}>{dataObj?.import_parcels.payment_total_lak || ''}</td>
            <td style={{ minWidth: '7rem' }}>{dataObj?.import_parcels.payment_total_cny || ''}</td>
            <td style={{ minWidth: '5rem' }}>{dataObj?.import_parcels.payment_cash || ''}</td>
            <td style={{ minWidth: '5rem' }}>{dataObj?.import_parcels.payment_transfer || ''}</td>
            <td style={{ minWidth: '5rem' }}>{dataObj?.import_parcels.payment_alipay || ''}</td>
            <td style={{ minWidth: '8rem' }}>{dataObj?.import_parcels.payment_wechatpay || ''}</td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td>{dataObj?.parcel_shipped_success.start_date || ''}</td>
            <td>{dataObj?.parcel_shipped_success.end_date || ''}</td>
            <td>{dataObj?.parcel_shipped_success.group || ''}</td>
            <td>{dataObj?.parcel_shipped_success.description || ''}</td>
            <td>{dataObj?.parcel_shipped_success.import_actual || ''}</td>
            <td style={{ color: 'red' }}>{dataObj?.parcel_shipped_success.qty_create_bill || ''}</td>
            <td style={{ color: 'red' }}>{dataObj?.parcel_shipped_success.weight_create_bill || ''}</td>
            <td>{dataObj?.parcel_shipped_success.total_lak || ''}</td>
            <td>{dataObj?.parcel_shipped_success.price_per_weight || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_total_lak || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_total_cny || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_cash || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_transfer || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_alipay || ''}</td>
            <td>{dataObj?.parcel_shipped_success.payment_wechatpay || ''}</td>
          </tr>
          <tr style={{ boxShadow: 'none' }}>
            <td colSpan={15}>
              <hr style={{ border: '1px solid #000', opacity: 0.6 }} />
            </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td>{dataObj?.in_stock.start_date || ''}</td>
            <td>{dataObj?.in_stock.end_date || ''}</td>
            <td>{dataObj?.in_stock.group || ''}</td>
            <td>{dataObj?.in_stock.description || ''}</td>
            <td>{dataObj?.in_stock.import_actual || ''}</td>
            <td>{dataObj?.in_stock.qty_create_bill || ''}</td>
            <td>{dataObj?.in_stock.weight_create_bill || ''}</td>
            <td style={{ color: 'red' }}>{dataObj?.in_stock.total_lak || ''}</td>
            <td>{dataObj?.in_stock.price_per_weight || ''}</td>
            <td>{dataObj?.in_stock.payment_total_lak || ''}</td>
            <td>{dataObj?.in_stock.payment_total_cny || ''}</td>
            <td>{dataObj?.in_stock.payment_cash || ''}</td>
            <td>{dataObj?.in_stock.payment_transfer || ''}</td>
            <td>{dataObj?.in_stock.payment_alipay || ''}</td>
            <td>{dataObj?.in_stock.payment_wechatpay || ''}</td>
          </tr>
          <tr style={{ boxShadow: 'none' }}>
            <td colSpan={15}>
              <hr style={{ border: '1px solid #000', opacity: 0.6 }} />
            </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td>{dataObj?.import_parcels_forsale.start_date || ''}</td>
            <td>{dataObj?.import_parcels_forsale.end_date || ''}</td>
            <td>{dataObj?.import_parcels_forsale.group || ''}</td>
            <td>{dataObj?.import_parcels_forsale.description || ''}</td>
            <td>{dataObj?.import_parcels_forsale.import_actual || ''}</td>
            <td>{dataObj?.import_parcels_forsale.qty_create_bill || ''}</td>
            <td>{dataObj?.import_parcels_forsale.weight_create_bill || ''}</td>
            <td>{dataObj?.import_parcels_forsale.total_lak || ''}</td>
            <td>{dataObj?.import_parcels_forsale.price_per_weight || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_total_lak || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_total_cny || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_cash || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_transfer || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_alipay || ''}</td>
            <td>{dataObj?.import_parcels_forsale.payment_wechatpay || ''}</td>
          </tr>
          {dataObj?.income_other.map((item, index) => (
            <tr key={index} style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
              <td>{item.start_date || ''}</td>
              <td>{item.end_date || ''}</td>
              <td>
                {item.type || ''} ({item.sub_type})
              </td>
              <td>{item.description || ''}</td>
              <td>{item.import_actual || ''}</td>
              <td>{item.qty_create_bill || ''}</td>
              <td>{item.weight_create_bill || ''}</td>
              <td>{item.total_lak || ''}</td>
              <td>{item.price_per_weight || ''}</td>
              <td>{item.amount_lak || ''}</td>
              <td>{item.amount_cny || ''}</td>
              <td>{item.pay_cash || ''}</td>
              <td>{item.pay_transfer || ''}</td>
              <td>{item.pay_alipay || ''}</td>
              <td>{item.pay_wechat || ''}</td>
            </tr>
          ))}
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td>{dataObj?.import_parcels_forbuy.start_date || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.end_date || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.group || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.description || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.import_actual || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.qty_create_bill || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.weight_create_bill || ''}</td>
            <td style={{ color: 'red' }}>{dataObj?.import_parcels_forbuy.total_lak || ''}</td>
            <td style={{ color: 'red' }}>{dataObj?.import_parcels_forbuy.price_per_weight || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_total_lak || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_total_cny || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_cash || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_transfer || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_alipay || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.payment_wechatpay || ''}</td>
          </tr>
          {dataObj?.expenses_other.map((item, index) => (
            <tr key={index} style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
              <td>{item.start_date || ''}</td>
              <td>{item.end_date || ''}</td>
              <td>
                {item.type || ''} ({item.sub_type})
              </td>
              <td>{item.description || ''}</td>
              <td>{item.import_actual || ''}</td>
              <td>{item.qty_create_bill || ''}</td>
              <td>{item.weight_create_bill || ''}</td>
              <td>{item.total_lak || ''}</td>
              <td>{item.price_per_weight || ''}</td>
              <td>{item.amount_lak || ''}</td>
              <td>{item.amount_cny || ''}</td>
              <td>{item.pay_cash || ''}</td>
              <td>{item.pay_transfer || ''}</td>
              <td>{item.pay_alipay || ''}</td>
              <td>{item.pay_wechat || ''}</td>
            </tr>
          ))}
          <tr style={{ boxShadow: 'none' }}>
            <td colSpan={15}>
              <hr style={{ border: '1px solid #000', opacity: 0.6 }} />
            </td>
          </tr>
          {/* section  Net Operating Income and Expense */}
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="font-weight-bold">Total LAK</td>
            <td className="font-weight-bold">LAK</td>
            <td className="font-weight-bold">CNY</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="text-light bg-dark">Cash</td>
            <td className="text-light bg-dark">Transfer</td>
            <td className="text-light bg-dark">Alipay</td>
            <td className="text-light bg-dark">WeChat pay</td>
            <td> </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td className="font-weight-bold">Net Operating </td>
            <td>{useConvertCurrency(isNaN(netOperatingLak + netOperatingCnyConvertLak) ? 0 : netOperatingLak + netOperatingCnyConvertLak, 2)}</td>
            <td>{useConvertCurrency(isNaN(netOperatingLak) ? 0 : netOperatingLak, 2)}</td>
            <td>{useConvertCurrency(isNaN(netOperatingCny) ? 0 : netOperatingCny, 2)}</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_cash || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_transfer || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_alipay || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_wechatpay || ''}</td>
            <td> </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td className="font-weight-bold">Receivable</td>
            <td>{dataObj?.in_stock.total_lak || ''}</td>
            <td>{dataObj?.in_stock.total_lak || ''}</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td> </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td className="font-weight-bold">Payable</td>
            <td>{dataObj?.import_parcels_forbuy.total_lak || ''}</td>
            <td>{dataObj?.import_parcels_forbuy.total_lak || ''}</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td className="custom-text-background"> </td>
            <td> </td>
          </tr>
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td className="font-weight-bold">Net Profit</td>
            <td>
              {useConvertCurrency(
                Number(String(Number(netOperatingLak) + Number(netOperatingCnyConvertLak) || '0').replace(/,/g, '')) +
                  Number(String(dataObj?.in_stock.total_lak || '0').replace(/,/g, '')) -
                  Number(String(dataObj?.import_parcels_forbuy.total_lak || '0').replace(/,/g, '')),
                2
              )}
            </td>
            <td>
              {useConvertCurrency(
                Number(String(Number(netOperatingLak) || '0').replace(/,/g, '')) +
                  Number(String(dataObj?.in_stock.total_lak || '0').replace(/,/g, '')) -
                  Number(String(dataObj?.import_parcels_forbuy.total_lak || '0').replace(/,/g, '')),
                2
              )}
            </td>
            <td>{isNaN(netOperatingCny) ? 0 : netOperatingCny}</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_cash || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_transfer || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_alipay || ''}</td>
            <td className="custom-text-background">{dataObj?.parcel_shipped_success.payment_wechatpay || ''}</td>
            <td> </td>
          </tr>
          <tr style={{ boxShadow: 'none' }}>
            <td colSpan={15}>
              <hr style={{ border: '1px solid #000', opacity: 0.6 }} />
            </td>
          </tr>
          {dataObj?.income_top_up.map((item, index) => (
            <tr key={index} style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
              <td>{dataObj?.parcel_shipped_success.start_date || ''}</td>
              <td>{dataObj?.parcel_shipped_success.end_date || ''}</td>
              <td>
                {item.type || ''} ({item.sub_type})
              </td>
              <td>{item.description || ''}</td>
              <td>{item.import_actual || ''}</td>
              <td>{item.qty_create_bill || ''}</td>
              <td>{item.weight_create_bill || ''}</td>
              <td>{item.total_lak || ''}</td>
              <td>{item.price_per_weight || ''}</td>
              <td>{item.payment_total_lak || item.pay_cash + item.pay_transfer || ''}</td>
              <td>{item.payment_total_cny || ''}</td>
              <td>{item.pay_cash || ''}</td>
              <td>{item.pay_transfer || ''}</td>
              <td>{item.pay_alipay || ''}</td>
              <td>{item.pay_wechat || ''}</td>
            </tr>
          ))}
          <tr style={{ verticalAlign: 'middle', textAlign: 'end', boxShadow: 'none' }}>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> {totalLakForBuy - sumIncome || ''}</td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
            <td> </td>
          </tr>
        </tbody>
      </TableR>
    </OverlayScrollbarsComponent>
  );
};
export default Table;
