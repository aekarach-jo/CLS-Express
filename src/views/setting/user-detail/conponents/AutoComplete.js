import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { Spinner } from 'react-bootstrap';

const empResponseTranformer = (response) => {
  return response.data;
};

const searchEmpFn = async (query) => {
  const resp = await request({ url: `/employee/find`, params: { name: query, limit: 10 } });

  return empResponseTranformer(resp).data;
};

const useEmpAutocomplete = ({ query, ...queryOptions }) =>
  useQuery([`empAutocompleteData`, query], () => searchEmpFn(query), {
    enabled: !!query,
    refetchOnWindowFocus: false,
    cacheTime: 0,
    ...queryOptions,
  });

const AutoComplete = ({
  searchUrl,
  as,
  onChange,
  onSuggestionSelected,
  onSearch,
  enabledSearch = true,
  isLoading = false,
  value,
  //
}) => {
  const [valueState, setValueState] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);

  const { data, isLoading: internalIsLoading } = useEmpAutocomplete({ searchUrl, query: valueState, enabled: enabledSearch });

  isLoading = isLoading || internalIsLoading;

  useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]);

  const internalOnChange = (event, { newValue }) => {
    setValueState(newValue);
    onChange?.(newValue);
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(valueState);
    }
  };

  const renderSuggestion = (suggestion) => <div>{suggestion?.name}</div>;

  const getSuggestionValue = (suggestion) => suggestion?.name || '';

  const onSuggestionsFetchRequested = ({ value: val }) => {
    // console.debug('onSuggestionsFetchRequested', val);

    setValueState(val);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = (event, { suggestion }) => {
    // onSelect(suggestion);
    // console.debug('handleSuggestionSelected', suggestion);
    onSuggestionSelected?.(suggestion);
  };

  return (
    <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground border">
      <span className="position-absolute" onClick={() => onSearch?.(valueState)} style={{ marginTop: 7, marginLeft: 19, color: 'gray' }}>
        {!isLoading ? <Spinner variant="sencondary" as="span" size="sm" animation="border" /> : <CsLineIcons variant="sencondary" icon="search" />}
      </span>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        focusInputOnSuggestionClick={false}
        inputProps={{
          placeholder: '',
          value: valueState,
          onChange: internalOnChange,
          onKeyPress,
          className: 'form-control px-7',
        }}
        renderInputComponent={as}
        onSuggestionSelected={handleSuggestionSelected}
      />

      {/* <span
        className={classNames('search-delete-icon', {
          'd-none': !valueState,
        })}
      >
        <CsLineIcons icon="close" />
      </span> */}
    </div>
  );
};

export default AutoComplete;
