"use client";

import COUNTRIES_LIST from '@/public/countries.json';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import { ArrowRightCircleIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import s from './Dock.module.scss';

const COUNTRIES: {
  code: string,
  name: string,
  flagColorHexCodes: string[]
}[] = COUNTRIES_LIST.sort((a, b) => a.name > b.name ? 1 : -1);

export const Actions = () => {
  return (
    <div className={`${s.dock} ${s.dock__right}`}>
      <button>
        <ArrowPathIcon className={s.icon} />
      </button>
      <button>
        <ArrowDownTrayIcon className={s.icon} />
      </button>
    </div>
  );
}

const Dock = () => {
  const [from, setFrom] = useState('AW');
  const [to, setTo] = useState('PL');
  const [color, setColor] = useState('#FF0000');

  return (
    <div className={`${s.dock} ${s.dock__center}`}>
      <select
        value={from}
        onChange={(e) => setFrom(e.target.value)}
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
        onChange={(e) => setTo(e.target.value)}
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
          .map((hex) => (
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
