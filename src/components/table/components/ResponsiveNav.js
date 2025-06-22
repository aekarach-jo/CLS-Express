import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useWindowSize } from 'hooks/useWindowSize';

const MoreItemToggle = React.forwardRef(({ onClick, parentClassname }, ref) => (
  <a
    ref={ref}
    className={classNames('btn btn-icon btn-icon-only', {
      'btn-foreground mt-2': parentClassname.indexOf('nav-tabs-title') === -1,
      'btn-background pt-0 bg-transparent pe-0': parentClassname.indexOf('nav-tabs-title') > -1,
    })}
    href="#/"
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    <CsLineIcons icon="more-horizontal" size="20" />
  </a>
));

MoreItemToggle.displayName = 'MoreItemToggle';
// eslint-disable-next-line no-unused-vars
const ResponsiveNav = React.forwardRef(({ className, children }, ref) => {
  const innerRef = React.createRef();
  const [collapseIndex, setCollapseIndex] = useState(children.length);
  const [childSteps, setChildSteps] = useState([]);
  const { width } = useWindowSize();

  const setSteps = () => {
    const steps = [];
    const currentChildren = innerRef.current.children;
    let totalWidth = 0;
    for (let i = 0; i < currentChildren.length; i += 1) {
      totalWidth += currentChildren[i].clientWidth;
      steps.push(totalWidth);
    }
    setChildSteps(steps);
  };
  const checkCollapseIndex = () => {
    const navWidth = innerRef.current.clientWidth;
    let checkedCollapseIndex = childSteps.filter((x) => x < navWidth).length;
    if (checkedCollapseIndex < children.length) {
      checkedCollapseIndex = childSteps.filter((x) => x < navWidth - 50).length;
    }
    if (checkedCollapseIndex !== collapseIndex) {
      setCollapseIndex(checkedCollapseIndex);
    }
  };
  useEffect(() => {
    setSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (width && childSteps.length > 0) {
      checkCollapseIndex();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  return (
    <div ref={innerRef} className={className}>
      {children.slice(0, collapseIndex)}
      {collapseIndex !== children.length && (
        <Dropdown className={classNames('nav-item ms-auto pe-0')} alignRight>
          <Dropdown.Toggle as={MoreItemToggle} parentClassname={className} />
          <Dropdown.Menu>{children.slice(collapseIndex, children.length)}</Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
});

ResponsiveNav.displayName = 'ResponsiveNav';

export default ResponsiveNav;
