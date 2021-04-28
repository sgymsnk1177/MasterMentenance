import React from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from 'reactstrap';
const Home = () => {
  return (
    <>
      <ul>
        <Link>
          <NavLink tag={Link} className='text-dark' to='/mailing_list'>
            1. メーリングリスト設定
          </NavLink>
          {/* <a href='/mailing_list'>
            <span>メーリングリスト設定</span>
          </a> */}
        </Link>
      </ul>
    </>
  );
};
export default Home;
