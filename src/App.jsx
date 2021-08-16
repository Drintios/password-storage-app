import React, { useState, useEffect } from 'react';
import { Box, Container, Button, Grid, Typography } from '@material-ui/core';
import { Google } from 'mdi-material-ui';
import { Switch, Route } from 'react-router-dom';
import PasswordList from './components/password-list/password-list.component';
import Password from './components/password/password.component';
import Header from './components/header/header.component';
import {
  auth,
  createUserProfileDocument,
  signInWithGoogle,
} from './firebase/firebase.utils';
import './App.scss';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot((snapShot) => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data(),
          });
        });
      }

      setCurrentUser(userAuth);
    });

    return () => {
      unsubscribeFromAuth();
    };
  }, []);
  return (
    <Box className='app'>
      {currentUser && <Header currentUser={currentUser} />}
      <Container maxWidth={false}>
        {currentUser ? (
          <Switch>
            <Route
              exact
              path='/'
              render={(props) => (
                <PasswordList {...props} userId={currentUser.id} />
              )}
            />
            <Route
              path='/password/:passwordId'
              render={(props) => (
                <Password {...props} userId={currentUser.id} />
              )}
            />
          </Switch>
        ) : (
          <Grid
            container
            alignItems='center'
            justifyContent='center'
            className='app__login-wrap'
          >
            <Grid item className='app__login-content'>
              <Typography variant='h3'>Passwords storage app</Typography>
              <Button
                variant='contained'
                onClick={signInWithGoogle}
                startIcon={<Google />}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default App;
