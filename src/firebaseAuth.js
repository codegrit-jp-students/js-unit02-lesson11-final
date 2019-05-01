import firebase from 'firebase/app';
import 'firebase/firebase-auth';

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
};

firebase.initializeApp(config);

export default class {
  // eslint-disable-next-line class-methods-use-this
  userState() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        document.getElementById('userState').innerText = `ログイン済(email: ${user.email})`;
        document.getElementById('signIn-button').classList.add('d-none');
        document.getElementById('signOut-button').classList.remove('d-none');
      } else {
        document.getElementById('userState').innerText = '未ログイン';
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById('userState').innerText = 'サインアップ成功';
      }).catch((error) => {
        const errorMessage = error.message;
        document.getElementById('userState').innerText = `サインアップ失敗: ${errorMessage}`;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById('signIn-button').classList.add('d-none');
        document.getElementById('signOut-button').classList.remove('d-none');
        this.userState();
      }).catch((error) => {
        const errorMessage = error.message;
        document.getElementById('userState').innerText = `サインイン失敗: ${errorMessage}`;
      });
  }

  // eslint-disable-next-line class-methods-use-this
  signOut() {
    document.getElementById('signIn-button').classList.remove('d-none');
    document.getElementById('signOut-button').classList.add('d-none');
    firebase.auth().signOut();
  }
}
