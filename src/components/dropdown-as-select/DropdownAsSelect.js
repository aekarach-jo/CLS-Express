import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

const DropdownAsSelect = ({ variant, className, options, onSelect, defaultValue, placeHolder, ...props }) => {
  const [selectedItem, setSelectedItem] = useState(defaultValue);
  useEffect(() => {
    if (!defaultValue) {
      setSelectedItem({
        value: 0,
        text: placeHolder,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectItem = (event, item) => {
    setSelectedItem(item);
    onSelect({ event, selectedItem: item });
  };
  if (selectedItem) {
    return (
      <Dropdown className={className} {...props}>
        <Dropdown.Toggle variant={variant}>{selectedItem.text}</Dropdown.Toggle>
        <Dropdown.Menu>
          {options.map((option, optionIndex) => (
            <Dropdown.Item key={`option.${optionIndex}`} active={option === selectedItem} onClick={(eventKey, event) => onSelectItem(event, option)}>
              {' '}
              {option.text}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
  return '';
};

export default DropdownAsSelect;
