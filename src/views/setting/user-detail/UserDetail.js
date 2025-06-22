/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom';
import { request } from 'utils/axios-utils';
import InformationForm from './conponents/InformationForm';

const UserDetail = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [department, setDepartment] = useState();
  const [role, setRole] = useState([]);
  const { id } = useParams();
  const { location } = useHistory();
  const mode = location.search.split('?')[1] || 'new';

  const getDepartment = async () => {
    const res = await request({ url: `/department`, method: 'GET', params: { filters: 'active:eq:1' } });
    return res.data.data;
  };
  const getRole = async () => {
    const res = await request({ url: `/role`, method: 'GET', params: { filters: 'active:eq:1' } });
    return res.data.data;
  };
  useEffect(async () => {
    const resultDepartment = await getDepartment();
    const resultRole = await getRole();
    const listDepartment = [];
    const listRole = [];

    for (const elementDepartment of resultDepartment) {
      if (!elementDepartment.isDeleted) {
        const objDepartment = {
          detail: elementDepartment,
          value: elementDepartment.id,
          label: elementDepartment.name,
        };
        listDepartment.push(objDepartment);
        setIsLoading(false);
      }
    }
    for (const elementRole of resultRole) {
      if (!elementRole.isDeleted) {
        const objRole = {
          detail: elementRole,
          value: elementRole.id,
          label: elementRole.name,
        };
        listRole.push(objRole);
        setIsLoading(false);
      }
    }
    setDepartment(listDepartment);
    setRole(listRole);
  }, []);

  return (
    <>
      {!isLoading ? (
        <InformationForm mode={mode} id={id} department={department} roleOption={role} />
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

export default UserDetail;
