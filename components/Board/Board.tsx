import s from './Board.module.scss';
import AW from '../../data/svg/aw.svg';
import Image from 'next/image';

const Board = () => {
  return (
    <div className={s.container}>
      <Image src={AW} alt="AW" className={s.flag} />
    </div>
  );
};

export default Board;
