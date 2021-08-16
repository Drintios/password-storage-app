import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  ContentSave,
  ContentCopy,
  Eye,
  EyeOff,
  Delete,
  Pencil,
} from 'mdi-material-ui';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import CryptoJS from 'crypto-js';
import Moment from 'react-moment';
import { useHistory } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

import { firestore } from '../../firebase/firebase.utils.js';

import './password.styles.scss';

const Password = ({ match, userId }) => {
  let history = useHistory();
  const [copied, setCopied] = useState(false);
  const [copiedTimeout, setCopiedTimeout] = useState(undefined);
  const [passwordData, setPasswordData] = useState(false);
  const [passwordInputType, setPasswordInputType] = useState('password');
  const [disabledInput, setDisabledInput] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [name, setName] = useState('');
  const [passwordDoc, setPasswordDoc] = useState(null);
  const [passwordCollection, setPasswordCollection] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const decryptPassword = (password) => {
      return CryptoJS.AES.decrypt(password, userId).toString(CryptoJS.enc.Utf8);
    };

    if (match.params.passwordId !== 'create') {
      const passwordRef = firestore
        .collection('passwords')
        .doc(match.params.passwordId);
      const unsubscribe = passwordRef.onSnapshot((doc) => {
        if (doc.exists) {
          const passwordDecrypt = decryptPassword(doc.data().password);
          setPasswordDoc(passwordRef);
          setPassword(passwordDecrypt);
          setPasswordStrength(zxcvbn(passwordDecrypt).score);
          setName(doc.data().name);
          setPasswordData({
            passwordDecrypt,
            ...doc.data(),
          });
        } else {
          setPasswordData(false);
        }
      });
      return () => {
        unsubscribe();
      };
    } else {
      setPasswordCollection(firestore.collection('passwords'));
    }
  }, [match.params.passwordId, userId]);

  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, userId).toString();
  };

  const handleChange = (event) => {
    const { value, name } = event.target;
    if (name === 'password') {
      setPasswordStrength(zxcvbn(value).score);
      setPassword(value);
    } else {
      setName(value);
    }
  };

  const toggleInputType = () => {
    passwordInputType === 'password'
      ? setPasswordInputType('text')
      : setPasswordInputType('password');
  };

  const deletePassword = () => {
    passwordDoc.delete();
    history.push('/');
  };

  const editSavePassword = async () => {
    if (name && password) {
      if (!disabledInput) {
        try {
          await passwordDoc.set(
            {
              password: encryptPassword(password),
              security: passwordStrength,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (error) {
          console.log('Error saving password: ', error.message);
        }
      }
      if (match.params.passwordId === 'create') {
        try {
          await passwordCollection.add({
            name,
            password: encryptPassword(password),
            updatedAt: new Date(),
            security: passwordStrength,
            userID: userId,
          });
          history.push('/');
        } catch (error) {
          console.log('Error creating password: ', error.message);
        }
      }
      setDisabledInput(!disabledInput);
    } else {
      setNameError(!name);
      setPasswordError(!password);
    }
  };

  const copyPassword = () => {
    if (copiedTimeout) {
      clearTimeout(copiedTimeout);
    }
    setCopied(true);
    setCopiedTimeout(
      setTimeout(() => {
        setCopied(false);
      }, 3000)
    );
  };

  if (passwordData) {
    return (
      <div className='password__wrapper'>
        {copied && (
          <Alert severity='success'>Password copied to clipboard</Alert>
        )}
        <div className='password password--form'>
          <Typography variant='body1'>Name:</Typography>
          <Typography variant='body2'>{name}</Typography>
          {disabledInput && <Typography variant='body1'>Password:</Typography>}
          <div className='password__password'>
            {disabledInput && (
              <IconButton onClick={toggleInputType}>
                {passwordInputType === 'text' ? <EyeOff /> : <Eye />}
              </IconButton>
            )}
            {disabledInput ? (
              <input
                name='password'
                onChange={handleChange}
                type={passwordInputType}
                value={password}
                disabled={disabledInput}
              />
            ) : (
              <TextField
                error={passwordError}
                label='Password'
                variant='outlined'
                required={true}
                onChange={handleChange}
                type={passwordInputType}
                helperText={`Security: ${passwordStrength} / 4`}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={toggleInputType}>
                        {passwordInputType === 'text' ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <div>
              <IconButton onClick={editSavePassword}>
                {disabledInput ? <Pencil /> : <ContentSave />}
              </IconButton>
              <CopyToClipboard text={password} onCopy={copyPassword}>
                <IconButton>
                  <ContentCopy />
                </IconButton>
              </CopyToClipboard>
              <IconButton onClick={deletePassword} color='secondary'>
                <Delete />
              </IconButton>
            </div>
          </div>
          <Typography variant='body2' className='password__updated'>
            Last update:
            <Moment format='DD/MM/YYYY'>
              {passwordData.updatedAt.toDate()}
            </Moment>
          </Typography>
          <Typography variant='body2' className='password__security'>
            Security: {disabledInput ? passwordData.security : passwordStrength}{' '}
            / 4
          </Typography>
        </div>
      </div>
    );
  } else if (match.params.passwordId === 'create') {
    return (
      <>
        <h1>Creating new password</h1>
        <form className='password password--form'>
          <TextField
            error={nameError}
            label='Name'
            variant='outlined'
            required={true}
            onChange={handleChange}
          />
          <TextField
            error={passwordError}
            label='Password'
            variant='outlined'
            required={true}
            onChange={handleChange}
            type={passwordInputType}
            helperText={`Security: ${passwordStrength} / 4`}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={toggleInputType}>
                    {passwordInputType === 'text' ? <EyeOff /> : <Eye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            onClick={editSavePassword}
            variant='contained'
            startIcon={<ContentSave />}
          >
            Save
          </Button>
        </form>
      </>
    );
  }

  return <div>Password not found!</div>;
};

export default Password;
