import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom';
import InformationForm from './conponents/InformationForm';

const BillDetail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { location } = useHistory();
  const mode = location.search.split('?')[1] || 'new';

  return (
    <>
      <InformationForm mode={mode} id={id} />
    </>
  );
};

export default BillDetail;
