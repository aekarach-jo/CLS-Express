import React, { useState } from 'react';
import { Badge, Col, Form, Nav, Row, Tab, ToggleButton } from 'react-bootstrap';
import { useTable, useGlobalFilter, useSortBy, usePagination, useRowSelect, useRowState } from 'react-table';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import classNames from 'classnames';

import ControlsPageSize from './components/ControlsPageSize';
import ControlsAdd from './components/ControlsAdd';
import ControlsEdit from './components/ControlsEdit';
import ControlsDelete from './components/ControlsDelete';
import ControlsSearch from './components/ControlsSearch';
import ModalAddEdit from './components/ModalAddEdit';
import CardContainer from './components/Card';
import TablePagination from './components/TablePagination';
import ResponsiveNav from './components/ResponsiveNav';
import TableDataNotFound from './components/TableDataNotFound';

const dummyData = [
  { id: 1, name: 'Basler Brot', sales: 213, stock: 15, category: 'Sourdough', tag: 'New' },
  { id: 2, name: 'Bauernbrot', sales: 633, stock: 97, category: 'Multigrain', tag: 'Done' },
  { id: 3, name: 'Kommissbrot', sales: 2321, stock: 154, category: 'Whole Wheat', tag: '' },
  { id: 4, name: 'Lye Roll', sales: 973, stock: 39, category: 'Sourdough', tag: '' },
  { id: 5, name: 'Panettone', sales: 563, stock: 72, category: 'Sourdough', tag: 'Done' },
  { id: 6, name: 'Saffron Bun', sales: 98, stock: 7, category: 'Whole Wheat', tag: '' },
  { id: 7, name: 'Ruisreikäleipä', sales: 459, stock: 90, category: 'Whole Wheat', tag: '' },
  { id: 8, name: 'Rúgbrauð', sales: 802, stock: 234, category: 'Whole Wheat', tag: '' },
  { id: 9, name: 'Yeast Karavai', sales: 345, stock: 22, category: 'Multigrain', tag: '' },
  { id: 10, name: 'Brioche', sales: 334, stock: 45, category: 'Sourdough', tag: '' },
  { id: 11, name: 'Pullman Loaf', sales: 456, stock: 23, category: 'Multigrain', tag: '' },
  { id: 12, name: 'Soda Bread', sales: 1152, stock: 84, category: 'Whole Wheat', tag: '' },
  { id: 13, name: 'Barmbrack', sales: 854, stock: 13, category: 'Sourdough', tag: '' },
  { id: 14, name: 'Buccellato di Lucca', sales: 1298, stock: 212, category: 'Multigrain', tag: '' },
  { id: 15, name: 'Toast Bread', sales: 2156, stock: 732, category: 'Multigrain', tag: '' },
  { id: 16, name: 'Cheesymite Scroll', sales: 452, stock: 24, category: 'Sourdough', tag: '' },
  { id: 17, name: 'Baguette', sales: 456, stock: 33, category: 'Sourdough', tag: '' },
  { id: 18, name: 'Guernsey Gâche', sales: 1958, stock: 221, category: 'Multigrain', tag: '' },
  { id: 19, name: 'Bazlama', sales: 858, stock: 34, category: 'Whole Wheat', tag: '' },
  { id: 20, name: 'Bolillo', sales: 333, stock: 24, category: 'Whole Wheat', tag: '' },
];

const TableCard = ({setShowModal, setProductId, tabs = [], ...tableConfig }) => {
  const columns = React.useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-30',
        Cell: ({ cell }) => {
          return (
            <a
              className="list-item-heading body"
              href="#!"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {cell.value}
            </a>
          );
        },
      },
      { Header: 'Sales', accessor: 'sales', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-10' },
      { Header: 'Stock', accessor: 'stock', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-10' },
      { Header: 'Category', accessor: 'category', sortable: true, headerClassName: 'text-muted text-small text-uppercase w-20' },
      {
        Header: 'Tag',
        accessor: 'tag',
        sortable: true,
        headerClassName: 'text-muted text-small text-uppercase w-10',
        Cell: ({ cell }) => {
          return <Badge bg="outline-primary">{cell.value}</Badge>;
        },
      },
      {
        Header: '',
        id: 'action',
        headerClassName: 'empty w-10',
        Cell: ({ row }) => {
          const { checked, onChange } = row.getToggleRowSelectedProps();
          return <Form.Check className="form-check float-end mt-1" type="checkbox" checked={checked} onChange={onChange} />;
        },
      },
    ];
  }, []);

  const [data, setData] = useState(dummyData);
  const [showFilter, toggleFilter] = useState(false);
  const [isOpenAddEditModal, setIsOpenAddEditModal] = useState(false);

  const defaultTableInstance = useTable(
    { columns, data, setData, isOpenAddEditModal, setIsOpenAddEditModal, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    useRowState
  );

  const tableInstance = tableConfig?.tableInstance || defaultTableInstance;

  const renderHeader = ({ tableInstance: tableInstanceHeader, filter }) => (
    <Row className="mb-3">
      <Col sm="12" md="5" lg="3" xxl="2">
        {!tableInstanceHeader?.hideSearch && (
          <div className="d-inline-block float-md-start me-1 mb-1 mb-md-0 search-input-container w-100 shadow bg-foreground">
            <ControlsSearch tableInstance={tableInstanceHeader} />
          </div>
        )}
      </Col>
      <Col sm="12" md="7" lg="9" xxl="10" className="text-end">
        <div className="d-inline-block me-0 me-sm-3 float-start float-md-none">
          <ControlsAdd tableInstance={tableInstanceHeader} /> <ControlsEdit tableInstance={tableInstanceHeader} />{' '}
          <ControlsDelete tableInstance={tableInstanceHeader} />
        </div>
        <div className="d-inline-block">
          {filter && (
            <div className="d-inline-block me-1 float-start float-md-none">
              <ToggleButton
                id="filterToggle"
                type="checkbox"
                variant="foreground"
                className="btn-icon btn-icon-only shadow"
                checked={showFilter}
                onClick={() => toggleFilter(!showFilter)}
              >
                <CsLineIcons icon="filter" />
              </ToggleButton>
            </div>
          )}
          <ControlsPageSize tableInstance={tableInstanceHeader} />
        </div>
      </Col>
    </Row>
  );

  const renderContainer = ({ isLoading, tableInstance: tableInstanceContainer }) => (
    <div
      className={classNames({
        'overlay-spinner': isLoading,
      })}
    >
      <Row>
        <Col xs="12">
          <CardContainer
            setShowModal={setShowModal}
            setProductId={setProductId}
            className="react-table rows"
            tableInstance={tableInstanceContainer}
          />
          <TableDataNotFound tableInstance={tableInstanceContainer} />
        </Col>
        <Col xs="12">
          <TablePagination tableInstance={tableInstanceContainer} />
        </Col>
      </Row>
    </div>
  );

  const renderFilter = ({ component, tableInstance: tableInstanceFilter, isLoading }) => {
    const FilterComponent = component;
    if (!component) return <></>;

    return (
      <Col className="mt-3">
        <FilterComponent tableInstance={tableInstanceFilter} show={showFilter} toggleFilter={!showFilter} isLoading={isLoading} />
      </Col>
    );
  };

  return (
    <>
      <Row>
        <Col>
          <div>
            {tabs.length > 0 ? (
              <Tab.Container defaultActiveKey={tabs[0].eventKey}>
                <Tab.Content>
                  {tabs.map(({ eventKey, tableInstance: tableInstanceTab, filter }) => (
                    <Tab.Pane key={eventKey} eventKey={eventKey}>
                      {tableInstanceTab && renderHeader({ tableInstance: tableInstanceTab, filter })}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
                <Tab.Content>
                  {tabs
                    .filter((tab) => tab.filter)
                    .map(({ eventKey, filter, isLoading, tableInstance: tableInstanceTab }) => (
                      <Tab.Pane key={eventKey} eventKey={eventKey}>
                        {renderFilter({ tableInstance: tableInstanceTab, component: filter, isLoading })}
                      </Tab.Pane>
                    ))}
                </Tab.Content>
                <Nav variant="tabs" className="nav-tabs-title nav-tabs-line-title pt-5 mx-3" activeKey={tabs[0].eventKey} as={ResponsiveNav}>
                  {tabs.map(({ eventKey, label }) => (
                    <Nav.Item key={eventKey}>
                      <Nav.Link eventKey={eventKey}>{label}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
                <Tab.Content>
                  {tabs.map(({ eventKey, isLoading, tableInstance: tableInstanceTab }) => (
                    <Tab.Pane key={eventKey} eventKey={eventKey}>
                      {tableInstanceTab && renderContainer({ tableInstance: tableInstanceTab, isLoading })}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Tab.Container>
            ) : (
              <>
                {renderHeader({ tableInstance, filter: tableConfig?.filter })}
                {renderFilter({ tableInstance, isLoading: tableConfig?.isLoading, component: tableConfig?.filter })}
                {renderContainer({ tableInstance, isLoading: tableConfig?.isLoading })}
              </>
            )}
          </div>
          {tableInstance?.selectedFlatRows && <ModalAddEdit tableInstance={tableInstance} />}
        </Col>
      </Row>
    </>
  );
};

export default TableCard;
