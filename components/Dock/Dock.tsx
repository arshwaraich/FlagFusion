"use client";

import COUNTRIES_LIST from '@/public/countries.json';
import { ArrowRightCircleIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { ReactNode, useState } from 'react';
import s from './Dock.module.scss';

const DockButton = ({ children }: { children?: ReactNode }) => {
  return (
    <button className={s.button}>
      {children}
    </button>
  );
};

const COUNTRIES: { [key: string]: string } = COUNTRIES_LIST;

const Dock = () => {
  const [from, setFrom] = useState('AW');
  const [to, setTo] = useState('PL');

  return (
    <div className={s.dock}>
      <select
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        style={{backgroundImage: `url(/svg/icon/${from}.svg)`}}>
        {
          Object.keys(COUNTRIES)
          .filter((key) => key!== to)
          .map((key) => (
            <option value={key} key={key}>{COUNTRIES[key]}</option>
          ))
        }
      </select>
      <ArrowRightCircleIcon className={s.icon} />
      <select
        value={to}
        onChange={(e) => setTo(e.target.value)}
        style={{backgroundImage: `url(/svg/icon/${to}.svg)`}}>
        {
          Object.keys(COUNTRIES)
          .filter((key) => key!== from)
          .map((key) => (
            <option value={key} key={key}>{COUNTRIES[key]}</option>
          ))
        }
      </select>
      <SwatchIcon className={s.icon} />
      <DockButton>
        <div className={s.flagcolor}/>
      </DockButton>
    </div>
  );
};

export default Dock;
