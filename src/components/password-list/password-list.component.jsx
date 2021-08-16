import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Fab,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Plus } from 'mdi-material-ui';
import { useHistory } from 'react-router-dom';
import Moment from 'react-moment';

import { firestore } from '../../firebase/firebase.utils';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const PasswordList = ({ userId }) => {
  const classes = useStyles();
  let history = useHistory();
  const [passwordList, setPasswordList] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore
      .collection('passwords')
      .where('userID', '==', userId ? userId : '')
      .onSnapshot((querySnapshot) => {
        let dataArray = [];
        querySnapshot.forEach((doc) => {
          dataArray.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setPasswordList(dataArray);
      });
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <List>
      {passwordList.length
        ? passwordList.map((password) => {
            return (
              <React.Fragment key={password.id}>
                <ListItem
                  button={true}
                  onClick={() => history.push(`password/${password.id}`)}
                >
                  <ListItemText
                    primary={
                      <Typography variant='subtitle2'>
                        {password.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='body2'>
                        Security: {password.security} | Last update:
                        <Moment format='DD/MM/YYYY'>
                          {password.updatedAt.toDate()}
                        </Moment>
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component='li' />
              </React.Fragment>
            );
          })
        : 'No passwords added...'}
      <Fab
        className={classes.fab}
        color='primary'
        onClick={() => history.push(`password/create`)}
      >
        <Plus />
      </Fab>
    </List>
  );
};

export default PasswordList;
