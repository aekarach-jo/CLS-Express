/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import React, { useEffect } from 'react';
import './paymentSlip.css';
import { request } from 'utils/axios-utils';
import { useQuery } from 'react-query';
import { useFormik } from 'formik';
import moment from 'moment';
import useConvert from 'hooks/useConvert';

const initialData = {
  name: '',
  phone: '',
  address: '',
  cash: '',
  transfer: '',
  amount: '',
  payment_type: [],
  bill: [],
};

const getPayment = async (id) => {
  const res = await request({ url: `/payment/${id}`, method: 'GET' });
  return {
    ...initialData,
    data: res.data.data,
  };
};

const PaymentSlip = React.forwardRef((props, ref) => {
  const { data: dataValue } = props;
  const { useConvertCurrency } = useConvert();

  const useSetPaymentData = (id) =>
    useQuery(['editCustomerData', id], () => getPayment(id), {
      enabled: !!id,
      initialData,
      refetchOnWindowFocus: false,
      retry: 0,
      onSuccess(data) {
        data?.data.bill_payment.forEach((item) => {
          item.checked = true;
        });
        data.name = data?.data.bill_payment[0]?.name;
        data.phone = data?.data.bill_payment[0]?.phone;
        data.address = data?.data.bill_payment[0]?.address;
        data.searchPhone = data?.data.bill_payment[0]?.phone;
        if (data?.data?.payments[0]?.method === 'cash') {
          data.cash = data?.data.payments[0]?.amount_lak;
        }
        if (data?.data?.payments[1]?.method === 'transffer') {
          data.transfer = data?.data.payments[1]?.amount_lak;
        }
        if (data?.data?.payments[0]?.method === 'wechat_pay' || data?.data?.payments[0]?.method === 'alipay') {
          data.amount = data?.data.payments[0]?.amount_cny;
        }
        data.billItem = data?.data.bill_payment.find((item) => item.bill_no === dataValue?.bill_no);
        data.paymentItem = data?.data.payments[0];
      },
      onError(err) {
        console.error('Error:', err);
      },
    });

  const { data: initResult, isFetching, refetch } = useSetPaymentData(dataValue?.payment_no);

  const formik = useFormik({ initialValues: initResult, enableReinitialize: true });
  const { values } = formik;
  const sumAmount = values?.billItem?.parcels?.reduce((acc, item) => acc + Math.ceil(item.price_bill / 1000) * 1000, 0);

  useEffect(() => {
    const sizeA4 = document.getElementById('size-a4');
    const sizeA5 = document.getElementById('size-a5');
    const sizeReceipt = document.getElementById('size-receipt');

    if (props.printType === 'A4') {
      if (sizeA4) sizeA4.style.display = 'block';
      if (sizeA5) sizeA5.style.display = 'none';
      if (sizeReceipt) sizeReceipt.style.display = 'none';
    } else if (props.printType === 'A5') {
      if (sizeA4) sizeA4.style.display = 'none';
      if (sizeA5) sizeA5.style.display = 'block';
      if (sizeReceipt) sizeReceipt.style.display = 'none';
    } else if (props.printType === 'slip') {
      if (sizeA4) sizeA4.style.display = 'none';
      if (sizeA5) sizeA5.style.display = 'none';
      if (sizeReceipt) sizeReceipt.style.display = 'block';
    }
  }, [props.printType]);

  const logoInfo = () => (
    <div className="d-flex flex-row align-items-center justify-content-between mb-3">
      <img className="logo" src="/img/logo/zto-logo.png" alt="logo" width={200} height={100} />
      <h1 style={{ fontSize: '34px', fontWeight: '500' }}>Receipt</h1>
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="header-reciept my-2">
      <div className="w-50">
        <p className='mb-1'>Customer: {values?.billItem?.name}</p>
        <p className='mb-1'>Address: {values?.billItem?.address}</p>
      </div>
      <div className="w-50 text-end">
        <p className='mb-1'>Phone: {values?.billItem?.phone}</p>
        <p className='mb-1'>Date: {moment(values?.paymentItem?.created_at).format('YYYY-MM-DD')}</p>
      </div>
      <div className="w-50 text-end">
        <p className='mb-1'>No.: {values?.paymentItem?.payment_no}</p>
        <p className='mb-1'>Bill No.: {values?.billItem?.bill_no}</p>
      </div>
    </div>
  );
  const paymentMethodsInfo = () => (
    <div className="payment-methods">
      <div className="d-flex flex-row align-items-start justify-content-between gap-1">
        <div>Payment:</div>
        <div>{values?.paymentItem?.method === 'cash' ? `( / )` : `(  )`} Cash</div>
        <div>{values?.paymentItem?.method === 'transfer' ? `( / )` : `(  )`} Transfer</div>
        <div>{values?.paymentItem?.method === 'alipay' ? `( / )` : `(  )`} Alipay</div>
        <div>{values?.paymentItem?.method === 'wechat' ? `( / )` : `(  )`} Wechat</div>
        <div>ຍອດຊຳລະ: {useConvertCurrency(sumAmount, 0)}</div>
      </div>
    </div>
  );



  const renderParcels = () => {
    const parcels = values?.billItem?.parcels || [];
    const totalColumns = 5; // จำนวนคอลัมน์ต่อแถว
    const totalRows = 6; // จำนวนแถวต่อหน้า
    const totalCells = totalColumns * totalRows; // จำนวนช่องทั้งหมดต่อหน้า

    // แบ่งข้อมูลออกเป็นกลุ่มละ 30 รายการ
    const chunks = [];
    for (let i = 0; i < parcels.length; i += totalCells) {
      chunks.push(parcels.slice(i, i + totalCells));
    }

    return chunks.map((chunk, pageIndex) => {
      // เติมข้อมูลว่างให้ครบ 30 ช่องในแต่ละหน้า
      while (chunk.length < totalCells) {
        chunk.push({ track_no: '', weight: '' });
      }

      // จัดเรียงข้อมูลใหม่ให้แต่ละคอลัมน์เต็มก่อน
      const columns = Array.from({ length: totalColumns }, () => []);
      chunk.forEach((parcel, index) => {
        const columnIndex = Math.floor(index / totalRows); // คำนวณคอลัมน์ที่ข้อมูลควรอยู่
        columns[columnIndex].push(parcel);
      });

      return (
        <div key={pageIndex} className={pageIndex > 0 ? 'page-break mt-3' : ''}>
          {logoInfo()}
          {renderCustomerInfo()}
          <table className="mb-0">
            <thead>
              <tr>
                <th style={{ fontSize: '13px' }} className="w-20">Description/项目</th>
                <th style={{ fontSize: '13px' }} className="w-20">Qty/数量</th>
                <th style={{ fontSize: '13px' }} className="w-20">Weight/重量</th>
                <th style={{ fontSize: '13px' }} className="w-20">P.U/单价</th>
                <th style={{ fontSize: '13px' }} className="w-20">Total Amount / 总价</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontSize: '11px' }}>Expresscost / 快递运费</td>
                <td style={{ fontSize: '13px' }}>{values?.billItem?.parcels?.length}</td>
                <td style={{ fontSize: '13px' }}>{values?.billItem?.total_weight}</td>
                <td style={{ fontSize: '13px' }}>{useConvertCurrency(values?.data?.customer_rate, 0)}</td>
                <td style={{ fontSize: '13px' }}>{useConvertCurrency(values?.billItem?.amount_lak, 0)}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                {Array.from({ length: totalColumns }).map((_, index) => (
                  <th key={index} style={{ fontSize: '12px' }} className="w-20">
                    <div className="d-flex flex-row justify-content-between">
                      <span>Track No</span>
                      <span>Weight</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} style={{ fontSize: '10px', height: '25px' }} className="w-20">
                      <div className="d-flex flex-row justify-content-between align-items-center">
                        <div>{column[rowIndex]?.track_no || ''}</div>
                        <div>{column[rowIndex]?.weight ? useConvertCurrency(column[rowIndex]?.weight, 2) : ''}</div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    });
  };

  return (
    <>
      {props.printType === 'A4' && (
        <div ref={ref} id="size-a4">
          <div className="header-reciept">
            <div className="w-40">
              <img className="logo" src="/img/logo/zto-logo.png" alt="logo" />
            </div>
            <div className="w-60">
              <div className="text-detail d-flex flex-column gap-1 justify-content-end align-items-end">
                <div className="title-receipt">Receipt</div>
                <div className="text-detail d-flex flex-row gap-0 justify-content-end align-items-end">
                  <div>
                    <p>No.:</p>
                    <p>Date:</p>
                    <p>Bill No.:</p>
                  </div>
                  <div className="text-end">
                    <p>{values?.paymentItem?.payment_no}</p>
                    <p>{moment(values?.paymentItem?.created_at).format('YYYY-MM-DD')}</p>
                    <p>{values?.billItem?.bill_no}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="thick-hr" />
          <div className="text-detail d-flex flex-row gap-4 justify-content-start align-items-start">
            <div>
              <p>Customer:</p>
              <p>Address:</p>
              <p>Phone:</p>
            </div>
            <div className="text-end">
              <p>{values?.billItem?.name}</p>
              <p>{values?.billItem?.address}</p>
              <p>{values?.billItem?.phone}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th colSpan="2" className="text-center">
                  Track no.
                </th>
                <th colSpan="1">Weight (KG)</th>
                <th colSpan="1">Amount (Lak)</th>
              </tr>
            </thead>
            <tbody>
              {values?.billItem?.parcels?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td colSpan="2" className="text-center">
                      {item?.track_no}
                    </td>
                    <td colSpan="1">{useConvertCurrency(item?.weight, 2)}</td>
                    <td colSpan="1">{useConvertCurrency(Math.ceil(item.price_bill / 1000) * 1000, 2)}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="2" className="blank">
                  &nbsp;
                </td>
                <td colSpan="1" className="total-line">
                  Discount
                </td>
                <td className=" text-end"> </td>
              </tr>
              <tr>
                <td colSpan="2" className="blank">
                  &nbsp;
                </td>
                <td colSpan="1" className="total-line">
                  Total Amount
                </td>
                <td className=" text-end">{useConvertCurrency(sumAmount, 2)}</td>
              </tr>
            </tbody>
          </table>
          <h2 className="mb-5">Note:</h2>
          <ul>
            <li>{values?.paymentItem?.method === 'cash' ? `( / )` : `(  )`} Cash</li>
            <li>{values?.paymentItem?.method === 'transfer' ? `( / )` : `(  )`} Transfer</li>
            <li>{values?.paymentItem?.method === 'alipay' ? `( / )` : `(  )`} Alipay</li>
            <li>{values?.paymentItem?.method === 'wechat' ? `( / )` : `(  )`} Wechat</li>
          </ul>
          <div className="d-flex flex-row justify-content-evenly mt-3">
            <div eclassName="flx-column">
              <div className="signature-line">........................................</div>
              <div className="text-center">ຜູ້ຮັບເງິນ</div>
            </div>
            <div eclassName="flx-column">
              <div className="signature-line">........................................</div>
              <div className="text-center">ຜູ້ຈ່າຍເງິນ</div>
            </div>
          </div>
          <hr className="thick-hr-footer" />
        </div>
      )}
      {props.printType === 'A5' && (
        <div ref={ref} id="size-a5">
          {renderParcels()}
          {paymentMethodsInfo()}
        </div>
      )}
      {props.printType === 'slip' && (
        <div ref={ref} id="size-receipt">
          <div className="header-reciept">
            <div className="w-40">
              <img className="logo" src="/img/logo/zto-logo.png" alt="logo" />
            </div>
            <div className="w-60">
              <div className="text-detail d-flex flex-column gap-1 justify-content-end align-items-end">
                <div className="title-receipt">Receipt</div>
                <div className="text-detail d-flex flex-row gap-0 justify-content-end align-items-end">
                  <div>
                    <p>No.:</p>
                    <p>Date:</p>
                    <p>Bill No.:</p>
                  </div>
                  <div className="text-end">
                    <p>{values?.paymentItem?.payment_no}</p>
                    <p>{moment(values?.paymentItem?.created_at).format('YYYY-MM-DD')}</p>
                    <p>{values?.billItem?.bill_no}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="thick-hr" />
          <div className="text-detail d-flex flex-row gap-4 justify-content-start align-items-start">
            <div>
              <p>Customer:</p>
              <p>Address:</p>
              <p>Phone:</p>
            </div>
            <div className="text-end">
              <p>{values?.billItem?.name}</p>
              <p>{values?.billItem?.address}</p>
              <p>{values?.billItem?.phone}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th colSpan="2" className="text-center">
                  Track no.
                </th>
                <th colSpan="1">Weight (KG)</th>
                <th colSpan="1">Amount (Lak)</th>
              </tr>
            </thead>
            <tbody>
              {values?.billItem?.parcels?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td colSpan="2" className="text-center">
                      {item?.track_no}
                    </td>
                    <td colSpan="1">{useConvertCurrency(item?.weight, 2)}</td>
                    <td colSpan="1">{useConvertCurrency(Math.ceil(item.price_bill / 1000) * 1000, 2)}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="2" className="blank">
                  &nbsp;
                </td>
                <td colSpan="1" className="total-line">
                  Discount
                </td>
                <td className=" text-end"> </td>
              </tr>
              <tr>
                <td colSpan="2" className="blank">
                  &nbsp;
                </td>
                <td colSpan="1" className="total-line">
                  Total Amount
                </td>
                <td className=" text-end">{useConvertCurrency(sumAmount, 2)}</td>
              </tr>
            </tbody>
          </table>
          <h2 className="mb-5">Note:</h2>
          <ul>
            <li>{values?.paymentItem?.method === 'cash' ? `( / )` : `(  )`} Cash</li>
            <li>{values?.paymentItem?.method === 'transffer' ? `( / )` : `(  )`} Transfer</li>
            <li>{values?.paymentItem?.method === 'alipay' ? `( / )` : `(  )`} Alipay</li>
            <li>{values?.paymentItem?.method === 'wechat_pay' ? `( / )` : `(  )`} Wechat</li>
          </ul>
          <div className="d-flex flex-row justify-content-evenly mt-3">
            <div eclassName="flx-column">
              <div className="signature-line">........................</div>
              <div className="text-center">ຜູ້ຮັບເງິນ</div>
            </div>
            <div eclassName="flx-column">
              <div className="signature-line">........................</div>
              <div className="text-center">ຜູ້ຈ່າຍເງິນ</div>
            </div>
          </div>
          <hr className="thick-hr-footer" />
        </div>
      )}
    </>
  );
});

export default PaymentSlip;
PaymentSlip.displayName = 'PaymentSlip';
