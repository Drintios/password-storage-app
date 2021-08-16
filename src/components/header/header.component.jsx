import React from 'react';
import { AppBar, Typography, Toolbar, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebase/firebase.utils';

import './header.styles.scss';

const Header = ({ currentUser }) => {
  let history = useHistory();

  return (
    <AppBar
      className='header'
      position='static'
      onClick={() => history.push('/')}
    >
      <Toolbar>
        {currentUser ? (
          <>
            <Typography variant='h6' className='header__title'>
              {currentUser.displayName}'s passwords
            </Typography>
            <Button color='inherit' onClick={() => auth.signOut()}>
              Log out
            </Button>
          </>
        ) : (
          <Typography variant='h6'>Passwords app</Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
