import AW from '@/public/svg/aw.svg';
import Image from 'next/image';
import s from './Board.module.scss';

const Board = () => {
  return (
    <div className={s.container}>
      <Image src={AW} alt="AW" className={s.flag} />
    </div>
  );
};

export default Board;
