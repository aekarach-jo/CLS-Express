/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import { request } from 'utils/axios-utils';
import { Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom';
import InformationForm from './conponents/InformationForm';

const CustomerDetail = ({ onHide, onGetCustomerData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [customerLevel, setCustomerLevel] = useState();
  const { id } = useParams();
  const { location } = useHistory();
  const mode = location.search.split('?')[1] || 'new';

  const getCustomerLevel = async () => {
    const res = await request({ url: `/customer_level`, params: { filters: 'active:eq:1' }, method: 'GET' });
    return res.data.data;
  };
  useEffect(async () => {
    const resultCustomerLevel = await getCustomerLevel();
    const listCustomerLevel = [];
    for (const elementCustomerLevel of resultCustomerLevel) {
      // eslint-disable-next-line no-var
      if (!elementCustomerLevel.isDeleted) {
        const objCustomerLevel = {
          detail: elementCustomerLevel,
          value: elementCustomerLevel.id,
          label: elementCustomerLevel.name,
        };
        listCustomerLevel.push(objCustomerLevel);
        setIsLoading(false);
      }
    }
    console.log(listCustomerLevel);

    setCustomerLevel(listCustomerLevel);
  }, []);

  return (
    <>
      {!isLoading ? (
        <InformationForm mode={mode} id={id} customerLevelOption={customerLevel} onHide={onHide} onGetCustomerData={onGetCustomerData} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spinner animation="border" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
    </>
  );
};

export default CustomerDetail;
