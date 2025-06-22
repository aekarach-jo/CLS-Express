import React, { useEffect } from 'react';
import Dropzone, { defaultClassNames } from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import DropzonePreview from 'components/dropzone/DropzonePreview';

const DropzoneTextFiles = ({ setFiles, cancelFiles, setCancalFiles, isLoading }) => {
  // const getUploadParams = () => ({ url: 'https://httpbin.org/post' });

  const onChangeStatus = ( fileWithMeta, status) => {
    if (status === 'done') {
      setFiles(fileWithMeta);
    }
  };

  useEffect(() => {
    if (cancelFiles) {
      document.querySelector('.btn-remove')?.click();
      setCancalFiles(false);
    }
  }, [cancelFiles]);

  return (
    <Dropzone
      PreviewComponent={(e) => DropzonePreview({ meta: e.meta, fileWithMeta: e.fileWithMeta })}
      submitButtonContent={null}
      accept=".xlsx, .xls, .csv"
      submitButtonDisabled
      maxFiles={1}
      disabled={isLoading}
      SubmitButtonComponent={null}
      inputWithFilesContent={null}
      onChangeStatus={onChangeStatus}
      classNames={{ inputLabelWithFiles: defaultClassNames.inputLabel }}
      inputContent={() => {
        return (
          <div key="1" className="d-flex flex-column">
            <p className="my-2 border rounded-sm m-auto p-2 px-3" style={{ color: '#1e5eff', border: '1px solid #1e5eff' }}>
              Add File
            </p>
            <div>Or drag and drop files</div>
          </div>
        );
      }}
    />
  );
};

export default DropzoneTextFiles;
