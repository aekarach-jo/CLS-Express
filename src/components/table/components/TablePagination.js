import React, { useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ControlsPageSize from './ControlsPageSize';

const TablePagination = ({ tableInstance }) => {
  const {
    data,
    gotoPage,
    canPreviousPage,
    previousPage,
    pageCount,
    total,
    nextPage,
    canNextPage,
    state: { pageIndex },
  } = tableInstance;

  // if (pageCount <= 1) {
  //   return <></>;
  // }

  const [screenSize, setScreenSize] = useState('');
  const [onShowFullPage, setShowFullPage] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;

      if (width < 576) {
        setScreenSize('sm');
      } else if (width >= 577) {
        setScreenSize('md');
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // useEffect(() => {
  //   if(pageIndex + 1 === pageCount){
  //     setShowFullPage(true)
  //   }
  // }, [pageIndex])

  return (
    <Pagination className="justify-content-start mb-0 mt-3 w-70">
      {/* <Pagination.First className="shadow" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
        <CsLineIcons icon="arrow-double-left" />
      </Pagination.First> */}
      <Pagination.Prev className="shadow" disabled={!canPreviousPage} onClick={() => previousPage()}>
        <CsLineIcons icon="arrow-left" />
      </Pagination.Prev>
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        {[...Array(pageCount)].map((x, i) => (
          <div key={i}>
            {screenSize === 'sm' && (
              <>
                {i < 2 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
                {onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
                {i === 2 && i !== pageCount - 1 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => setShowFullPage(true)}>
                    {pageIndex + 1 > 2 && (
                      <div
                        style={
                          pageIndex + 1 < 10 && pageIndex + 1 !== pageCount - 1
                            ? { position: 'absolute', fontSize: '10px', left: '15px' }
                            : { position: 'absolute', fontSize: '10px', left: '12px' }
                        }
                      >
                        {pageIndex + 1}
                      </div>
                    )}
                    ...
                  </Pagination.Item>
                )}
                {i === pageCount - 1 && i > 2 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
              </>
            )}
            {screenSize === 'md' && (
              <>
                {i < 10 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
                {onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
                {i === 10 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => setShowFullPage(true)}>
                    {pageIndex + 1 > 10 && <div style={{ position: 'absolute', fontSize: '10px', left: '12px' }}>{pageIndex + 1}</div>}
                    ...
                  </Pagination.Item>
                )}
                {i === pageCount - 1 && i > 10 && !onShowFullPage && (
                  <Pagination.Item key={`pagination${i}`} className="shadow" active={pageIndex === i} onClick={() => gotoPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <Pagination.Next className="shadow" onClick={() => nextPage()} disabled={!canNextPage}>
        <CsLineIcons icon="arrow-right" />
      </Pagination.Next>
      {/* <Pagination.Last className="shadow" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
        <CsLineIcons icon="arrow-double-right" />
      </Pagination.Last> */}
      <div className="position-absolute d-flex flex-row gap-2 justify-content-center align-items-center" style={{ right: '24px', bottom: '24px' }}>
        <ControlsPageSize tableInstance={tableInstance} />
        <div className="mt-3 opacity-75">{total} Results</div>
      </div>
    </Pagination>
  );
};
export default TablePagination;
