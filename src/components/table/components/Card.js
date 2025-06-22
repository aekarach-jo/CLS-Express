import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const CardContainer = ({ tableInstance }) => {
  const { page, prepareRow } = tableInstance;

  return (
    <>
      {page.map((row, index) => {
        prepareRow(row);

        return (
          <Card key={`card.${index}`} className="mb-2">
            <Card.Body className="pt-0 pb-0 sh-40 sh-md-19">
              <Row className="g-0 h-100 align-content-center">
                {row.cells.map((cell, cellIndex) => (
                  <Col key={`col.${cellIndex}`} {...cell.column.headerProps} className={cell.column.colClassName}>
                    <div className={cell.column.headerClassName}>{cell.column.render('Header')}</div>
                    {cell.render('Cell')}
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </>
  );
};
export default CardContainer;
