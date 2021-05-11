import React from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import Home from './screens/Home';
import MailingList from './screens/MailingList';
import ShitenTantoList from './screens/ShitenTantoList';
import './custom.css';

const App = () => {
  return (
    <Layout>
      <Route exact path="/" component={Home} />
      <Route path="/mailing_list" component={MailingList} />
      <Route path="/shitentanto_list" component={ShitenTantoList} />
      {/* TestRoute */}
    </Layout>
  );
};

export default App;
