/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import Table from 'components/table/Table';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { request } from 'utils/axios-utils';
import { Form } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { useGlobalFilter, usePagination, useRowState, useSortBy, useTable } from 'react-table';
import ConfirmDeleteModal from 'components/confirm-delete-modal/ConfirmDeleteModal';
import moment from 'moment';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom';
import useConvert from 'hooks/useConvert';
import { toast } from 'react-toastify';
import ConfirmModal from 'components/confirm-modal/ConfirmModal';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const searchBill = async ({ filter, page = 1, per_page = 10, sortBy = {} }) => {
  const sorts = sortBy.sortField ? `${sortBy.sortField}:${sortBy.sortDirection}` : 'created_at:desc';

  const res = await request({
    url: '/bill',
    method: 'GET',
    params: { ...filter, per_page, page: page + 1, sorts },
  });
  return res.data;
};

const Bill = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'bill.title' });
  const description = '';
  const { useConvertCurrency } = useConvert();
  const { push } = useHistory();

  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [getId, setGetId] = useState();
  const [pageCount, setPageCount] = useState(1);
  const [pageC, setPageC] = useState(1);
  const [show, setShow] = useState(false);

  const [selectToShipping, setSelectToShipping] = useState([]);

  const token = localStorage.getItem('token');
  const roleResources = JSON.parse(token)?.user?.role_resources;
  const role = roleResources?.find((item) => item.resource_name.toLowerCase() === 'bill');

  const handleShipped = async (id, data) => {
    try {
      const response = await request({
        url: `/shipping`,
        method: 'POST',
        data: { bill_no: [id.toString()] },
      });
      if (response) {
        await request({
          url: `/payment`,
          method: 'POST',
          data: {
            bill: [id.toString()],
            active: true,
            draft: true,
            payment_type: [
              {
                name: null,
                amount_cny: 0,
                amount_lak: 0,
                currency: 'lak',
              },
            ],
          },
        }).then(() => {
          push(`/bill/${data.id}?view`);
        });
      }
    } catch (error) {
      refetch();
    }
  };

  const handleSendMessage = (phone, billData) => {
    if (!phone) {
      toast.error('No phone number available for this customer');
      return;
    }

    // phone = '2091050433'

    // Format phone number: always take last 8 digits and prepend 85620
    let cleanPhone = phone.toString().replace(/[^0-9]/g, ''); // Remove all non-digits

    // Take the last 8 digits
    if (cleanPhone?.length >= 8) {
      cleanPhone = cleanPhone.slice(-8);
    }

    // Prepend 85620
    const formattedPhone = `+85620${cleanPhone}`;

    let parcelList = '';
    if (billData.parcels && billData.parcels?.length > 0) {
      parcelList = billData.parcels.map((parcel, index) => `${index + 1}. ${parcel.track_no} (${parcel.weight}kg)`).join('\n');
    }

    const message =
      `📮 ສະບາຍດີ ຈາກບໍລິສັດ CLS Express ຂົນສົ່ງ ຈີນ-ລາວ. ພັດສະດຸຮອດປາຍທາງແລ້ວ
  📍 ຮັບເຄື່ອງໄດ້ທີ່: https://maps.app.goo.gl/zJQE1w3VS1ZWhkSS7?g_st=com.google.maps.preview.copy
  ❗ຮັບພາຍໃນ 3 ວັນຫາກເກີນກຳນົດ ພັດສະດຸຈະຖືກຕີກັບຕົ້ນທາງ (ຂໍຂອບໃຈ)
  ❗ຕ່າງແຂວງ (ໂອນ = ຝາກ) ❗ແຈ້ງບ່ອນຝາກ (ຝາກຕາມຄິວ ຖ້າຝາກບໍ່ທັນມື້ໂອນ ແມ່ນຝາກມື້ຖັດໄປ) 📮 
  ❗ໂອນແຈ້ງບິນ = ຈ່າຍ-ຝາກ ✅
  ❗ເປີດຈັນ-ວັນເສົາ 9:00-6:00
  ❗ປິດທຸກວັນທິດ. (ຂອບໃຈລູກຄ້າທີ່ໃຊ້ບໍລິການ)

  Bill No. : ${billData.bill_no}
  ${billData.name}  ${billData.phone}
${parcelList ? `${parcelList}` : ''}
  
  ຍອດລວມ ${useConvertCurrency(billData.amount_lak, 0)} Kip

  ຊ່ອງທາງການຊຳລະ ແລະ ຂໍ້ມູນເພີ່ມເຕີມສຳຫຼັບການຄິດໄລ່ສິນຄ້າ: https://www.facebook.com/share/1Avdz3u7oH/?mibextid=wwXIfr`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (billData.bill_status_notifications?.length === 0) {
      if (isMobile) {
        window.open(`sms:${formattedPhone}?body=${encodeURIComponent(message)}`);
      } else {
        const whatsappMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone.replace(/[^0-9]/g, '')}&text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
      }
    }

    try {
      request({
        url: `/bill/notification`,
        method: 'POST',
        data: {
          bill_no: [billData.bill_no],
          cancel: billData.bill_status_notifications?.length > 0,
        },
      }).then(() => {
        refetch();
      });
      billData.statusWhatApp = true;
      toast.success(`Message prepared for ${phone}`);
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
      toast.error('Failed to update WhatsApp status');
    }
  };

  const columns = useMemo(() => {
    return [
      {
        Header: f({ id: 'bill.field.no' }),
        accessor: 'id',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => {
          return (
            <div className="text-medium" style={{ width: '3rem' }}>
              <Form.Check
                hidden={cell.row.original.status !== 'ready' && cell.row.original.status !== 'sending'}
                className="position-absolute px-4"
                style={{ left: 0 }}
                checked={cell.row.original.checked}
                onClick={(e) => {
                  setSelectToShipping((prev) => {
                    cell.row.original.checked = e.target.checked;
                    const index = prev.findIndex((item) => item.id === cell.row.original.id);
                    if (index === -1) {
                      return [...prev, cell.row.original];
                    }
                    return prev.filter((item) => item.id !== cell.row.original.id);
                  });
                }}
                type="checkbox"
                label=""
              />
              <div className="ms-1">{cell.row.original.num || '-'}</div>
            </div>
          );
        },
      },
      {
        Header: f({ id: 'bill.field.bill' }),
        accessor: 'bill_no',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '5rem' }}>
            {cell.value || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'bill.field.name' }),
        accessor: 'name',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'bill.field.phone' }),
        accessor: 'phone',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => <div className="text-medium">{cell.value || '-'}</div>,
      },
      {
        Header: f({ id: 'bill.field.amount' }),
        accessor: 'amount_lak',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-start',
        Cell: ({ cell }) => (
          <div className="text-medium text-end" style={{ width: '5rem' }}>
            {useConvertCurrency(cell.value, 2) || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'bill.field.status' }),
        accessor: 'status',
        sortable: false,
        headerClassName: 'text-medium text-muted-re text-center',
        Cell: ({ row }) => {
          return (
            <div className="text-medium text-white text-center" style={{ minWidth: '8rem' }}>
              {row.original.status === 'success' && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#C4F8E2', color: '#06A561' }}>
                  Success
                </div>
              )}
              {row.original.status === 'ready' && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#F99600', color: 'white' }}>
                  Ready
                </div>
              )}
              {row.original.status === 'shipped' && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#5A607F', color: 'white' }}>
                  Shipped
                </div>
              )}
              {row.original.status === 'waiting_payment' && (
                <div className="rounded-sm w-80 m-auto" style={{ background: '#5a7f75', color: 'white' }}>
                  Waiting Payment
                </div>
              )}
              {row.original.status === "sending" && (
                <div className="rounded-sm w-50 m-auto" style={{ background: '#4f66bd', color: 'white' }}>
                  Sending
                </div>
              )}
            </div>
          );
        },
      },
      {
        Header: f({ id: 'bill.field.createAt' }),
        accessor: 'created_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '9rem' }}>
            {moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}
          </div>
        ),
      },
      {
        Header: f({ id: 'bill.field.updateAt' }),
        accessor: 'updated_at',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell }) => (
          <div className="text-medium" style={{ width: '11rem' }}>
            {moment(cell?.value || '-').format('YYYY-MM-DD HH:mm:ss') || '-'}
          </div>
        ),
      },
      {
        Header: '',
        accessor: 'action',
        sortable: false,
        headerClassName: 'text-medium text-muted-re',
        Cell: ({ cell, row }) => (
          <div className="text-medium d-flex flex-row gap-1 icon-hover" style={{ width: '5rem' }}>
            <div>
              {cell.row.original.status === 'shipped' && cell.row.original.payment_no ? (
                <NavLink
                  to={`${role?.can_view === 0 ? `/payment` : `/payment/${cell.row.original.payment_no}?edit`}`}
                  className=" text-truncate h-100 d-flex align-items-center"
                >
                  {/* <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} /> */}
                  <CsLineIcons icon="credit-card" className="text-dark" />
                </NavLink>
              ) : (
                <CsLineIcons icon="credit-card" className="text-muted" />
              )}
            </div>
            <div>
              <NavLink to={`${role?.can_view === 0 ? `/bill` : `/bill/${row.values.id}?view`}`} className=" text-truncate h-100 d-flex align-items-center">
                <img src="/img/icons/show.png" alt="show" style={role?.can_view === 0 ? { opacity: '0.5' } : { cursor: 'pointer' }} />
              </NavLink>
            </div>
            <div>
              <a
                className=" text-truncate h-100 d-flex align-items-center"
                style={(cell.row.original.status !== 'ready' && cell.row.original.status !== 'sending') ? { opacity: '0.5' } : { cursor: 'pointer' }}
                onClick={async () => {
                  if (cell.row.original.status === 'ready' || cell.row.original.status === 'sending') {
                    handleShipped(row.values.bill_no, cell.row.original);
                  }
                }}
              >
                <img src="/img/icons/truck.png" alt="trunk" />
              </a>
            </div>
            <div>
              <a
                className=" text-truncate h-100 d-flex align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleSendMessage(cell.row.original.phone, cell.row.original)
                }
                }
              >
                {(cell.row.original.bill_status_notifications?.length > 0 && cell.row.original.status === 'sending') ?
                  <CsLineIcons icon="refresh-horizontal" className="text-warning" />
                  :
                  <CsLineIcons icon="send" className="text-success" />
                }
              </a>
            </div>
          </div>
        ),
      },
    ];
  }, [f]);

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
      pageCount,
      pageC,
      total,
      setSelectToShipping,
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

  const { isFetching, refetch } = useQuery(
    ['searchBill', filter, pageSize, sortBy, page],
    () => searchBill({ filter, per_page: pageSize, page, sortBy: sortByFromTable(sortBy) }),
    {
      retry: 0,
      refetchOnWindowFocus: false,
      onSuccess(resp) {
        const { data: result } = resp;
        const newArr = result?.data?.map((item, index) => ({ ...item, num: result.from + index }));
        setPageC(result.last_page);
        setPageCount(result.last_page);
        setTotal(result.total);
        setData(newArr);
      },
      onError(err) {
        console.error('Search error :', err);
      },
    }
  );

  useEffect(() => {
    if (page !== 0) {
      setFilter((currentFilter) => ({
        ...currentFilter,
        page,
      }));
    }
  }, [page]);

  useEffect(() => {
    if (globalFilter !== undefined) {
      setFilter((currentFilter) => {
        const newFilter = { ...currentFilter, page: globalFilter !== undefined && 0 };
        if (globalFilter !== '') {
          newFilter.page = 1;
          newFilter.searchText = globalFilter;
        } else {
          delete newFilter.searchText;
        }
        return newFilter;
      });
    }
  }, [globalFilter]);

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setShow(false);
  };
  const options = [
    { label: 'Ready', value: true },
    { label: 'Shipped', value: false },
  ];

  const handleConfirmDelete = async () => {
    await request({ url: `/bill/${getId}`, method: 'DELETE' });
    refetch();
    setIsDeleting(false);
  };

  const onClickShipped = async () => {
    const filterItemTpShipping = selectToShipping.filter((item) => (item.status === 'ready' || item.status === 'sending'));
    const selectToShipp = filterItemTpShipping.map((item) => item.bill_no);
    const allPhonesSame = filterItemTpShipping.every((item, index, array) => item.phone === array[0].phone);

    if (selectToShipp?.length > 0) {
      try {
        const response = await request({
          url: `/shipping-payment`,
          method: 'POST',
          data: { bill_no: selectToShipp },
        });

        if (allPhonesSame) {
          push(`/payment/${response.data.data}`);
        } else {
          setSelectToShipping([]);
          data.map((item) => {
            item.checked = false;
            return item;
          });
          refetch();
        }
      } catch (error) {
        setSelectToShipping([]);
        data.map((item) => {
          item.checked = false;
          return item;
        });
        console.error('Download error:', error);
        toast.error('Please select ready status');
        refetch();
      }
    } else {
      refetch();
      toast.error('Please select ready status');
      setSelectToShipping([]);
      data.map((item) => {
        item.checked = false;
        return item;
      });
    }
    setShow(false);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        // buttons={{ export: { onSubmit: () => handleExport() } }}
        addButton={{ label: f({ id: 'bill.field.add' }), link: '/bill/new' }}
        isHideBtnAdd={role?.can_create === 0}
      />
      <Table
        tableInstance={tableInstance}
        isLoading={isFetching}
        hideControlsDateRange
        hideControlsStatusParcel
        hideControlsStatusVerify
        hideControlsStatus
        isCheckAll
        isShipping={selectToShipping?.length > 0}
        onClickShipped={setShow}
        statusOptions={options}
      />
      <ConfirmModal
        show={show}
        className="rounded-sm"
        titleText="Shipping"
        size="md"
        confirmText="Are you sure you want to shipping ?"
        onConfirm={onClickShipped}
        onCancel={handleDeleteCancel}
      />
      <ConfirmDeleteModal
        show={isDeleting}
        className="rounded-sm"
        titleText="Delete"
        size="md"
        confirmText="Are you sure you want to delete ?"
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default Bill;
