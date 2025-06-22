const { useState } = require('react');

const useSort = ({ threeState } = {}) => {
  const DIRECTION = {
    ASC: 'asc',
    DESC: 'desc',
  };
  const [column, setColumn] = useState(null);
  const [direction, setDirection] = useState(DIRECTION.ASC);

  const sort = (_column, _direction) => {
    setColumn(_column);

    if (threeState) {
      if (!_direction) {
        if (_column === column) {
          if (direction === DIRECTION.DESC) {
            setColumn(null);
            setDirection(null);
          } else {
            setDirection((prev) => (prev === DIRECTION.ASC ? DIRECTION.DESC : DIRECTION.ASC));
          }
        } else {
          setDirection(DIRECTION.ASC);
        }
      } else {
        setDirection(_direction);
      }
    } else if (_column !== column) {
      setDirection(DIRECTION.ASC);
    } else {
      setDirection((prev) => (prev === DIRECTION.ASC ? DIRECTION.DESC : DIRECTION.ASC));
    }
  };

  return {
    sort,
    sortColumn: column,
    sortDirection: direction,
  };
};

export default useSort;
