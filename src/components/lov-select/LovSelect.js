import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import useMaterialLovData from 'hooks/api/master/lov/useMaterialLov';
import { useIntl } from 'react-intl';

function mapOptions(lovList, lovLabel, lovValue) {
  return (lovList || []).map((lov) => ({
    label: lov[lovLabel],
    value: lov[lovValue],
  }));
}

const LovSelect = ({ name, value, lov, lovLabel = 'name', lovValue = 'code', isClearable, isDisabled, onChange, placeholder, menuPlacement, ...props }) => {
  const { formatMessage: f } = useIntl();

  const [internalValue, setInternalValue] = useState();
  const { useMaterialLov } = useMaterialLovData();
  const { data, isFetching } = useMaterialLov({ isGroup: true });
  const selectPlaceholder = useMemo(() => placeholder || f({ id: 'common.select-placeholder' }), [f, placeholder]);

  const options = useMemo(() => {
    // console.debug(`LovSelect : ${name}`, data);
    return mapOptions(data?.[lov] || [], lovLabel, lovValue);
  }, [data, lov, lovLabel, lovValue]);

  // console.log('internal value :', internalValue);

  useEffect(() => {
    // console.debug('find new value', data, lov, lovValue, value);
    const findOption = options?.find((item) => item.value === value);
    // console.debug('usefx options :', options);
    // console.debug('usefx findoption :', findOption);
    setInternalValue(findOption);
  }, [lov, lovValue, options, value]);

  const internalOnChange = useCallback(
    (e) => {
      const { value: _value } = e || {};
      onChange?.(_value);
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

export default LovSelect;
