import dynamic from "next/dynamic";
import React, { ComponentProps, useCallback, useEffect, useState } from "react";
import s from './Board.module.scss';

const Board = ({
  from,
  color
}: {
  from: string,
  color?: string
}) => {
  const [SvgComponent, setSvgComponent] = useState<React.ComponentType<ComponentProps<'svg'>>>();


  const changeColor = useCallback((event: Event) => {
    const target = event.target as SVGElement;
    if (target.getAttribute('fill') && color) {
      target.setAttribute('fill', color);
    }
  }, [color]);

  useEffect(() => {
    const svg = document.getElementById('color-change-svg');
    if (!svg) return;

    const applyListeners = (element: Element) => {
      if (element.getAttribute('fill')) {
        element.addEventListener('click', changeColor);
      }
      element.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          applyListeners(child as Element);
        }
      });
    };

    applyListeners(svg);

    return () => {
      const removeListeners = (element: Element) => {
        if (element.getAttribute('fill')) {
          element.removeEventListener('click', changeColor);
        }
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
  }, [from]);

  return (
    <div className={`${s.container} ${!SvgComponent ? s.container__loading : ''}`}>
      {SvgComponent ?
        <SvgComponent id='color-change-svg' className={s.flag} /> : <React.Fragment />}
    </div>
  );
};

export default Board;
