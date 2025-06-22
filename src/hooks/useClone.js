const { useCallback } = require('react');

const useClone = () => {
  const cloneJson = useCallback((obj) => JSON.parse(JSON.stringify(obj)), []);

  return {
    cloneJson,
  };
};

export default useClone;
