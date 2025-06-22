import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useProductLovData from 'hooks/api/master/lov/useProductLov';
import { useIntl } from 'react-intl';
import { request } from 'utils/axios-utils';
import { useQuery } from 'react-query';

const searchPhoneFn = async (query) => {
  const resp = await request({ url: `/customer`, params: { filters: `active:eq:1,verify:eq:1` } });
  return resp.data.data;
};

const useAutocomplete = () => {
  const q = useQuery([`customerAutocompleteData`], () => searchPhoneFn(), {
    enabled: true,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  });
  return q;
};

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
    detail: lov,
  }));
}

const LovCustomerSelect = ({
  name,
  value,
  lov,
  lovLabel = 'phone',
  lovValue = 'phone',
  isClearable,
  isDisabled,
  onChange,
  placeholder,
  menuPlacement,
  ...props
}) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { data, isFetching, refetch } = useAutocomplete();

  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);
  const options = useMemo(() => {
    return mapOptions(data || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);

  // useEffect(() => {
  //   refetch();
  //   if (!isFetching) {
  //     props.setValueChange(false);
  //   }
  // }, [props.valueChange]);

  useEffect(() => {
    const findOption = options?.find((item) => item.value === value);
    setInternalValue(findOption);
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      const { value: _value } = e || {};
      onChange?.(e);
    },
    [onChange]
  );

  return (
    <Select
      name={name} //
      isDisabled={isDisabled}
      classNamePrefix="react-select"
      options={options}
      isLoading={isFetching}
      {...props}
      isClearable={isClearable}
      placeholder={selectPlaceholder}
      menuPlacement={menuPlacement}
      value={internalValue}
      onChange={internalOnChange}
    />
  );
};

export default LovCustomerSelect;
