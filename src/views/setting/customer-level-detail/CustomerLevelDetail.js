import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom';
import InformationForm from './conponents/InformationForm';

const CustomerLevelDetail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [customerLevel, setCustomerLevel] = useState();
  const { id } = useParams();
  const { location } = useHistory();
  const mode = location.search.split('?')[1] || 'new';

  return (
    <>
      {isLoading ? (
        <InformationForm mode={mode} id={id} />
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

export default CustomerLevelDetail;
