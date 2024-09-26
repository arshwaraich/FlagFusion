"use client";

import COLORS_LIST from '@/public/colors.json';
import COUNTRIES_LIST from '@/public/countries.json';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { ArrowRightCircleIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { SVG_ID } from '../Board/Board';
import s from './Dock.module.scss';

const COLORS: {
  [key: string]: string[];
} = COLORS_LIST;

const COUNTRIES: {
  code: string,
  name: string,
  flagColorHexCodes: string[]
}[] = COUNTRIES_LIST
  .sort((a, b) => a.name > b.name ? 1 : -1)
  .map((country) => ({
    code: country.code,
    name: country.name,
    flagColorHexCodes: COLORS[country.code.toLowerCase()]
  }));

export const Actions = ({
  from,
  to,
  resetFn
}: {
  from: string,
  to: string,
  resetFn: () => void,
}) => {
  const downloadSVG = () => {
    // Get the SVG element (or construct your SVG content as a string)
    const svgElement = document.getElementById(SVG_ID);

    if (!svgElement) {
      console.error('SVG element not found!');
      return;
    }

    // Serialize the SVG element to a string
    const svgData = new XMLSerializer().serializeToString(svgElement);

    // Create a Blob from the SVG data
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Set the file name for download
    const fromName = COUNTRIES.find((country) => country.code === from)?.name;
    const toName  = COUNTRIES.find((country) => country.code === to)?.name;
    link.download = (fromName && toName) ? `${fromName} + ${toName}.svg` : 'FlagFusion.svg';

    // Append link to body and trigger the download by clicking the link
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the link element
    document.body.removeChild(link);
  };

  const resetFlag = () => {
    resetFn();
  }

  return (
    <div className={`${s.dock} ${s.dock__right}`}>
      <button onClick={resetFlag}>
        <ArrowPathIcon className={s.icon} />
      </button>
      <button onClick={downloadSVG}>
        <ArrowDownTrayIcon className={s.icon} />
      </button>
    </div>
  );
}

const Dock = ({
  from,
  setFrom,
  to,
  setTo,
  color,
  setColor
}: {
  from: string,
  setFrom: (value: string) => void,
  to: string,
  setTo: (value: string) => void,
  color?: string,
  setColor: (value: string | undefined) => void
}) => {
  return (
    <div className={`${s.dock} ${s.dock__center}`}>
      <select
        value={from}
        onChange={(e) => { setFrom(e.target.value); setColor(undefined) }}
        style={{ backgroundImage: `url(/svg/icon/${from}.svg)` }}>
        {
          COUNTRIES
            .filter((c) => c.code !== to)
            .map((c) => (
              <option value={c.code} key={c.code}>{c.name}</option>
            ))
        }
      </select>
      <ArrowRightCircleIcon className={s.icon} />
      <select
        value={to}
        onChange={(e) => { setTo(e.target.value); setColor(undefined) }}
        style={{ backgroundImage: `url(/svg/icon/${to}.svg)` }}>
        {
          COUNTRIES
            .filter((c) => c.code !== from)
            .map((c) => (
              <option value={c.code} key={c.code}>{c.name}</option>
            ))
        }
      </select>
      <SwatchIcon className={s.icon} />
      {
        COUNTRIES
          .find(c => c.code === to)?.flagColorHexCodes
          ?.map((hex) => (
            <button
              className={hex === color ? s.selectedButton : ''}
              key={hex}
              onClick={() => setColor(hex)}>
              <div className={s.flagcolor} style={{ backgroundColor: hex }} />
            </button>
          ))
      }
    </div>
  );
};

export default Dock;
