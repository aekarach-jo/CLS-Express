import React from 'react';
import { useIntl } from 'react-intl';
import { useAsyncDebounce } from 'react-table';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ControlsSearch = ({ tableInstance }) => {
  const { formatMessage: f } = useIntl();

  const {
    setGlobalFilter,
    state: { globalFilter },
  } = tableInstance;

  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
  }, 200);

  return (
    <>
      <input
        className="form-control datatable-search"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={f({ id: 'common.search' })}
      />
      {value && value.length > 0 ? (
        <span
          className="search-delete-icon"
          onClick={() => {
            setValue('');
            onChange('');
          }}
        >
          <CsLineIcons icon="close" />
        </span>
      ) : (
        <span className="search-magnifier-icon pe-none">
          <CsLineIcons icon="search" />
        </span>
      )}
    </>
  );
};

export default ControlsSearch;
