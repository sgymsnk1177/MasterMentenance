import React from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from 'reactstrap';
const Home = () => {
  return (
    <>
      <ul>
        <li className="home_link">
          <Link to="/mailing_list"> メーリングリスト設定</Link>
        </li>
        <li className="home_link">
          <Link to="/shitentanto_list"> 支店担当設定</Link>
        </li>
      </ul>
    </>
  );
};
export default Home;
