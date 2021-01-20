import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import Home from './components/Home';
import MailingList from './components/MailingList';
// import FetchData from './components/FetchData';
import './custom.css';

const App = () => {
  return (
    <Layout>
      <Route exact path='/' component={Home} />
      <Route path='/mailing_list' component={MailingList} />
      {/* TestRoute */}
      {/* <Route path='/fetchdata' component={FetchData} /> */}
    </Layout>
  );
};

export default App;
