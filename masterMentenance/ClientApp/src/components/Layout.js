import React from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';

export const Layout = (props) => {
  return (
    <main>
      <NavMenu />
      <Container>{props.children}</Container>
    </main>
  );
};
