import TM from '@/public/svg/TM.svg';
import Image from 'next/image';
import s from './Board.module.scss';

const Board = () => {
  return (
    <div className={s.container}>
      <Image src={TM} alt="TM" className={s.flag} />
    </div>
  );
};

export default Board;
