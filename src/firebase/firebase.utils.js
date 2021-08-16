import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const config = {
  apiKey: 'AIzaSyBHFy9J2sDM4ZPwTZgi7cOy5MnCpGxuh_o',
  authDomain: 'password-app-cb11b.firebaseapp.com',
  databaseURL: 'https://password-app-cb11b.firebaseio.com',
  projectId: 'password-app-cb11b',
  storageBucket: 'password-app-cb11b.appspot.com',
  messagingSenderId: '603329390409',
  appId: '1:603329390409:web:3ab26cc3d9aa0a4e115c98'
}

firebase.initializeApp(config)

export const createUserProfileDocument = async (userAuth, additionalData) => {
  if (!userAuth) return

  const userRef = firestore.doc(`users/${userAuth.uid}`)
  const snapShot = await userRef.get()

  if (!snapShot.exists) {
    const { displayName, email } = userAuth
    const createdAt = new Date()
    try {
      await userRef.set({
        displayName,
        email,
        createdAt,
        ...additionalData
      })
    } catch (error) {
      console.log('error creating user', error.message)
    }
  }

  return userRef
}

export const auth = firebase.auth()
export const firestore = firebase.firestore()

const provider = new firebase.auth.GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })
export const signInWithGoogle = () => auth.signInWithPopup(provider)

export default firebase
