import dynamic from "next/dynamic";
import React, { ComponentProps, useCallback, useEffect, useState, WheelEvent } from "react";
import s from './Board.module.scss';

export const SVG_ID = 'color-change-svg';

const Board = ({
  reset,
  from,
  color
}: {
  reset: boolean,
  from: string,
  color?: string
}) => {
  const [SvgComponent, setSvgComponent] = useState<React.ComponentType<ComponentProps<'svg'>>>();
  const [scale, setScale] = useState(1);  // State to track zoom level

  const handleWheel = (e: WheelEvent) => {
    const zoomFactor = 0.1;
    const newScale = scale + (e.deltaY > 0 ? -zoomFactor : zoomFactor);

    // Clamp between 0.5 and 5x zoom
    const clampedScale = Math.max(0.5, Math.min(newScale, 3));

    setScale(clampedScale);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key down', e.key);
      const zoomFactor = 0.1;
      const newScale = scale + (
        e.key === '-'
          ? -zoomFactor
          : e.key === '='
            ? zoomFactor
            : 0);

      // Clamp between 0.5 and 5x zoom
      const clampedScale = Math.max(0.5, Math.min(newScale, 3));

      setScale(clampedScale);
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scale]);

  const changeColor = useCallback((event: Event) => {
    const target = event.target as SVGElement;
    if (color) {
      let el: SVGElement = target;
      if (el.getAttribute('stroke')) {
        el.setAttribute('stroke', color);
      }
      if (target.nodeName === "use") {
        el = (document.getElementById(
          target.getAttribute('xlink:href')
          ?.replace('#', '') || target.id
        ) || target) as SVGElement;
      }
      el.setAttribute('fill', color);
    }
  }, [color]);

  useEffect(() => {
    const svg = document.getElementById(SVG_ID);
    if (!svg) return;

    const applyListeners = (element: Element) => {
      // if (element.getAttribute('fill')) {
        element.addEventListener('click', changeColor);
      // }
      element.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          applyListeners(child as Element);
        }
      });
    };

    applyListeners(svg);

    return () => {
      const removeListeners = (element: Element) => {
        // if (element.getAttribute('fill')) {
          element.removeEventListener('click', changeColor);
        // }
        element.childNodes.forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            removeListeners(child as Element);
          }
        });
      };

      removeListeners(svg);
    };
  }, [changeColor]);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        // Dynamically import the SVG
        const ImportedSvg = await dynamic<ComponentProps<'svg'>>(() =>
          import(`@/public/svg/${from.toLowerCase()}.svg`)
        );
        setSvgComponent(() => ImportedSvg);
      } catch (error) {
        console.error('Failed to load SVG:', error);
      }
    };

    loadSvg();
  }, [from, reset]);

  return (
    <div
      onWheel={handleWheel}
      className={`${s.container} ${!SvgComponent ? s.container__loading : ''}`}>
      {
        SvgComponent
          ? <SvgComponent
            id={SVG_ID}
            style={{
              transform: `scale(${scale})`
            }}
            className={s.flag} />
          : <React.Fragment />
      }
    </div>
  );
};

export default Board;
