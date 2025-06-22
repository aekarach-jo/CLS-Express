/* eslint-disable no-restricted-syntax */
import DropzoneTextFiles from 'components/dropzone/DropzoneTextFiles';
import HtmlHead from 'components/html-head/HtmlHead';
import PageTitle from 'components/page-title/PageTitle';
import React, { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import { request } from 'utils/axios-utils';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const callImportData = async (data = {}) => {
  const formData = new FormData();
  if (data) {
    formData.append('file', data.file);
  }

  const res = await request({ url: `/extract`, method: 'POST', data: formData });
  return res;
};

const ImportData = () => {
  const { formatMessage: f } = useIntl();
  const title = f({ id: 'menu.import-data' });
  const [files, setFiles] = useState(false);
  const [cancelFiles, setCancalFiles] = useState(false);
  const [show, setShow] = useState(false);
  const [totalParcel, setTotalParcel] = useState(0);
  const description = '';

  const { mutate: saveFile, isLoading: isSaving } = useMutation((currentData) => callImportData(currentData), {
    onSuccess(res) {
      toast('success');
      setShow(true);
      setTotalParcel(res.data?.data?.totalParcel);
      setCancalFiles(true);
    },
    onError(error) {
      if (error.response) {
        toast.error(() => {
          return (
            <div style={{ width: 'auto' }}>
              {error.response.data.errors.map((item, index) => (
                <div className="mb-2" key={index}>
                  {item}
                  <hr />
                </div>
              ))}
            </div>
          );
        });
      }
    },
  });

  const ModalAlert = () => {
    return (
      <Modal className={classNames('small fade ')} show={show} onHide={() => setShow(false)} centered backdrop="static">
        <Modal.Body className="d-flex flex-column gap-3 text-center">
          <div className="d-flex jutify-center m-auto" style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#ECF2FF' }}>
            <CsLineIcons className="m-auto text-primary" icon="check" size="" />
          </div>
          <div>
            <Modal.Title className="font-weight-bold">Import Successfull</Modal.Title>
            <div style={{ fontFamily: 'Inter' }}>{`Added ${totalParcel} new item`}</div>
          </div>
          <div className="d-flex flex-row gap-2 justify-content-center">
            <Button variant="primary" className="text-white" onClick={() => setShow(false)}>
              {f({ id: 'common.continue' })}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <div>
      <HtmlHead title={title} description={description} />
      <PageTitle
        title={title}
        description={description}
        buttons={{
          cancel: { label: f({ id: 'common.cancel' }), onCancel: () => setCancalFiles(true) },
          import: { label: f({ id: 'common.import' }), onSubmit: () => saveFile(files) },
        }}
      />
      <Card
        className={classNames('mb-5', {
          'overlay-spinner': isSaving,
        })}
      >
        <DropzoneTextFiles setFiles={setFiles} setCancalFiles={setCancalFiles} cancelFiles={cancelFiles} isLoading={isSaving} />
      </Card>
      <ModalAlert />
    </div>
  );
};

export default ImportData;
