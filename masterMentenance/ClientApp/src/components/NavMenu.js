import React, { useCallback, useState } from 'react';
import { Collapse, Container, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

export const NavMenu = () => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleNavbar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <header>
      <Navbar
        // className='navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3'
        className="box-shadow mb-4 border-bottom"
        expand="sm"
        light>
        <Container className="themed-container">
          <NavbarBrand tag={Link} to="/">
            マスターメンテナンス
          </NavbarBrand>
          <NavbarToggler onClick={toggleNavbar} className="mr-2" />
          <Collapse id="myCollapsible" className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!collapsed} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink tag={Link} className="text-dark" to="/">
                  ホーム
                </NavLink>
              </NavItem>
              {/* <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/mailing_list">
                    メーリングリスト
                  </NavLink>
                </NavItem> */}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
