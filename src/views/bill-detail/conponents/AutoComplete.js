import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useQuery } from 'react-query';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { request } from 'utils/axios-utils';
import { Spinner } from 'react-bootstrap';

const searchPhoneFn = async (query) => {
  const resp = await request({ url: `/customer`, params: { filters: `${query && `phone:like:${query},`}active:eq:1,verify:eq:1` } });
  return resp.data.data;
};

const useAutocomplete = ({ query, ...queryOptions }) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const q = useQuery([`empAutocompleteData`, debouncedQuery], () => searchPhoneFn(debouncedQuery), {
    enabled: !!debouncedQuery,
    refetchOnWindowFocus: false,
    cacheTime: 0,
    ...queryOptions,
  });
  return q;
};

const AutoComplete = ({
  searchUrl,
  as,
  onChange,
  onSuggestionSelected,
  onSearch,
  enabledSearch = true,
  isLoading = false,
  isDisable = false,
  value,
  //
}) => {
  const [valueState, setValueState] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState();

  const { data, isLoading: internalIsLoading } = useAutocomplete({ searchUrl, query: valueState, enabled: enabledSearch });

  isLoading = isLoading || internalIsLoading;

  useEffect(() => {
    if (data) {
      setSuggestions(data);
    }
  }, [data]);

  useEffect(() => {
    if (value) {
      setValueState(value);
    }
  }, [value]);

  const internalOnChange = (event, { newValue }) => {
    setValueState(newValue);
    // onChange?.(debouncedQuery);
  };

  const onKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(valueState);
    }
  };

  useEffect(() => {
    if (valueState !== '') {
      const handler = setTimeout(() => {
        setDebouncedQuery(valueState);
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }
    return undefined;
  }, [valueState]);
  const renderSuggestion = (suggestion) => <div>{suggestion?.phone}</div>;

  const getSuggestionValue = (suggestion) => suggestion?.phone || '';

  const onSuggestionsFetchRequested = ({ value: val }) => {
    // console.debug('onSuggestionsFetchRequested', val);
    setValueState(val);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleSuggestionSelected = (event, { suggestion }) => {
    onChange?.(suggestion);
    onSuggestionSelected?.(suggestion);
  };

  return (
    <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground border">
      <span className="position-absolute" onClick={() => onSearch?.(valueState)} style={{ marginTop: 7, marginLeft: 19, color: 'gray' }}>
        {isLoading ? <Spinner variant="sencondary" as="span" size="sm" animation="border" /> : <CsLineIcons variant="sencondary" icon="search" />}
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
          disabled: isDisable,
          onKeyPress,
          className: 'form-control px-7 w-100',
        }}
        renderInputComponent={as}
        onSuggestionSelected={handleSuggestionSelected}
      />
    </div>
  );
};

export default AutoComplete;
