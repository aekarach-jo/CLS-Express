import React from 'react';
import { useIntl } from 'react-intl';
import { useAsyncDebounce } from 'react-table';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ControlsSearch = ({ tableInstance, onSetFilter }) => {
  const { formatMessage: f } = useIntl();

  const {
    filterTypes,
    setGlobalFilter,
    placeholderText,
    state: { globalFilter },
  } = tableInstance;

  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((val) => {
    setGlobalFilter(val || undefined);
    // onSetFilter(val, filterTypes || []);
  }, 500);

  return (
    <>
      <input
        className="form-control datatable-search w-100 border rounded-sm"
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${f({ id: 'common.search' })}${placeholderText || ''}`}
      />
      {value && value.length > 0 ? (
        <span
          className="search-delete-icon"
          onClick={() => {
            setValue('');
            onChange(' ');
          }}
        >
          <CsLineIcons icon="close" />
        </span>
      ) : (
        <span className="search-magnifier-icon">
          <CsLineIcons icon="search" />
        </span>
      )}
    </>
  );
};

export default ControlsSearch;
