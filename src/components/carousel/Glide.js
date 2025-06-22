import React, { useCallback, useEffect } from 'react';
import GlideJs from '@glidejs/glide';
import '@glidejs/glide/dist/css/glide.core.min.css';
import { useWindowSize } from 'hooks/useWindowSize';
import { useSelector } from 'react-redux';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const Glide = ({
  className = '',
  options = {
    gap: 0,
    rewind: false,
    bound: true,
    perView: 6,
    breakpoints: {
      400: { perView: 1 },
      1000: { perView: 2 },
      1400: { perView: 3 },
      1900: { perView: 5 },
      3840: { perView: 6 },
    },
  },
  noDots = false,
  noControls = false,
  noKeyboard = false,
  setBoxItemIndex = () => {},
  boxItemIndex = 0,
  children,
}) => {
  const carouselRef = React.useRef();
  const glideRef = React.useRef();
  const { width } = useWindowSize();

  const { placementStatus, behaviourStatus, attrMobile } = useSelector((state) => state.menu);

  const init = () => {
    glideRef.current = new GlideJs(carouselRef.current, options);
    if (!noDots) {
      glideRef.current.on(['mount.before'], () => {
        const bulletCount = glideRef?.current?.selector?.querySelectorAll('.glide__slide').length;
        const bulletWrapper = glideRef?.current?.selector?.querySelectorAll('.glide__bullets')[0];

        if (!bulletWrapper) {
          return;
        }

        while (bulletWrapper.firstChild) {
          bulletWrapper.removeChild(bulletWrapper.firstChild);
        }

        for (let index = 0; index < bulletCount; index += 1) {
          const button = document.createElement('button');
          button.className = 'glide__bullet';
          button.setAttribute('data-glide-dir', `=${index}`);
          bulletWrapper.appendChild(button);
        }
      });
    }

    // Hiding them with d-none if it is needed
    if (glideRef && glideRef?.current) {
      const glideCurrent = glideRef.current;

      if (glideCurrent.on) {
        glideCurrent.on(['resize', 'build.after'], () => {
          const { perView } = glideRef?.current?.settings;
          const total = glideRef?.current?.selector?.querySelectorAll('.glide__slide').length;
          const sub = total - perView;

          // Adds or removes d-none class
          glideRef?.current?.selector?.querySelectorAll('.glide__bullet').forEach((el, i) => {
            if (i > sub) {
              el.classList.add('d-none');
            } else {
              el.classList.remove('d-none');
            }
          });
          // Prevents the empty last stop when resized for a larger breakpoint with more items
          if (glideRef.current.index > sub && sub >= 0) {
            glideRef.current.go(`=${sub}`);
          }
        });
      }
    }
    glideRef.current.mount();
    glideRef.current.go(`=${boxItemIndex}`);
  };
  const update = () => {
    glideRef.current.update();
  };
  const destroy = () => {
    glideRef.current.destroy();
  };

  // const handleKeydown = useCallback(
  //   (event) => {
  //     if (noKeyboard && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
  //       console.log(event.key);
  //       event.preventDefault();
  //     }
  //   },
  //   [noKeyboard]
  // );

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeydown);
  //   return () => {
  //     document.removeEventListener('keydown', handleKeydown);
  //   };
  // }, [handleKeydown]);

  useEffect(() => {
    init();
    return () => {
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (width && carouselRef.current && glideRef.current) {
      if (glideRef.current.selector.querySelectorAll('.glide__slide').length === 1) {
        setBoxItemIndex(0);
      } else {
        setBoxItemIndex(glideRef.current.index);
      }
      setTimeout(() => {
        destroy();
        init();
        update();
      }, 10);
    }
  }, [width, placementStatus, behaviourStatus, attrMobile, children]);

  return (
    <div ref={carouselRef} className={`glide ${className}`}>
      <div className="glide__track" data-glide-el="track">
        <div className="glide__slides">{children}</div>
        {!noControls && (
          <div className="text-center">
            <span className="glide__arrows slider-nav" data-glide-el="controls">
              <button type="button" className="btn btn-icon btn-icon-only btn-outline-primary" data-glide-dir="<">
                <CsLineIcons icon="chevron-left" />
              </button>
            </span>{' '}
            {!noDots && <span className="glide__bullets" data-glide-el="controls[nav]" />}{' '}
            <span className="glide__arrows slider-nav" data-glide-el="controls">
              <button type="button" className="btn btn-icon btn-icon-only btn-outline-primary" data-glide-dir=">">
                <CsLineIcons icon="chevron-right" />
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const Item = ({ className = '', children }) => <div className={`glide__slide ${className}`}>{children}</div>;

Glide.Item = Item;
Glide.Item.displayName = 'Item';

export default Glide;
