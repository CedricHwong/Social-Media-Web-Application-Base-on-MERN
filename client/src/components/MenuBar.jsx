import React, { useState, useContext } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/auth';

function MenuBar() {

  const { user, logout } = useContext(AuthContext);
  const path = window.location.pathname.substring(1);
  const [activeItem, setActiveItem] = useState(path);

  const handleItemClick = (e, { name }) => setActiveItem(name);

  const menuBar = user
  ? (
    <Menu pointing secondary size="massive" color="teal">
      <Menu.Item name={user.username} active as={Link} to="/" />

      <Menu.Menu position="right">
        <Menu.Item name="logout" onClick={logout} />
      </Menu.Menu>
    </Menu>
  )
  : (
    <Menu pointing secondary size="massive" color="teal">
      <Menu.Item
        name="home"
        active={!activeItem || activeItem === 'home'}
        onClick={handleItemClick}
        as={Link}
        to="/"
      />

      <Menu.Menu position="right">
        {['login', 'register'].map((name, i) => <Menu.Item
          key={i}
          name={name}
          active={activeItem === name}
          onClick={handleItemClick}
          as={Link}
          to={'/' + name}
        />)}
      </Menu.Menu>
    </Menu>
  );

  return menuBar;
}

export default MenuBar;
