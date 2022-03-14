
import React from 'react';
import { Dropdown, Menu } from 'semantic-ui-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../context/auth';
import useFixRandImg from '../utils/fixRandImg';

function MenuBar({ ...props }) {

  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const activeItem = pathname.substring(1);
  const { randImgUrl } = useFixRandImg();

  return (
    <Menu {...props} pointing secondary size="massive" color="teal">
      <Menu.Item name="home"
        active={!activeItem || activeItem === 'home'}
        as={Link}
        to="/"
      />

      <Menu.Menu position="right">
        {user
        ? (
          <Dropdown item trigger={
            <Dropdown inline open={false} icon={null} style={{ pointerEvents: "none" }}
              defaultValue={0} options={[{
                text: user.username, key: 0, value: 0,
                image: { avatar: true, src: randImgUrl },
              }]} />
          }>
            <Dropdown.Menu>
              {activeItem !== `users/${user.id}` &&
                <Dropdown.Item text="Setting" as={Link} to={`/users/${user.id}`} icon="setting" />}
              <Dropdown.Item text="Logout" onClick={logout} icon="sign-out" />
            </Dropdown.Menu>
          </Dropdown>
        )
        : ['login', 'register'].map((name, i) => <Menu.Item
            key={i}
            name={name}
            active={activeItem === name}
            as={Link}
            to={'/' + name}
          />)
        }
      </Menu.Menu>
    </Menu>
  );
}

export default MenuBar;
