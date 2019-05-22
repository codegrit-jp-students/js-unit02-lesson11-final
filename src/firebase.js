/* eslint-disable class-methods-use-this */
/* eslint-disable no-shadow */
import moment from 'moment';
import firebase from 'firebase/app';
import 'firebase/firebase-auth';
import 'firebase/firebase-database';


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
  // constructor() {
  //   const testData = this.readDB.bind(this);
  //   console.log(testData);
  // }

  userState() {
    return new Promise((resolve) => {
      firebase.auth().onAuthStateChanged(user => resolve(user));
    });
  }

  signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    return new Promise((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => { resolve(email); })
        .catch(error => reject(error));
    });
  }

  signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => { resolve(email); })
        .catch(error => reject(error));
    });
  }

  signOut() {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
        .then(resolve())
        .catch(error => reject(error));
    });
  }

  // DBに本日の記録を書き込む
  writeDB(value) {
    const time = moment();
    const startOfToday = time.startOf('day');
    const startOfTodayClone = moment(startOfToday);
    const valOfToday = startOfTodayClone.valueOf();
    const { uid } = firebase.auth().currentUser;
    firebase
      .database()
      .ref(`history/${uid}/${valOfToday}`)
      .set(value);
  }


  // DBから記録を取得する
  async readDB() {
    const userid = firebase.auth().currentUser.uid;
    const time = moment();
    const startOfToday = time.startOf('day');
    const startOfTodayClone = moment(startOfToday);
    const oneDayAgo = startOfTodayClone.subtract(1, 'days');
    const valOfOneDayAgo = oneDayAgo.valueOf();
    const sevenDaysAgo = startOfTodayClone.subtract(7, 'days');
    const valOfSevenDaysAgo = sevenDaysAgo.valueOf();
    // const TodayClone = moment(time.startOf('day'));
    // const someDaysAgo = TodayClone.subtract(7, 'days');
    // const valOfSomeDaysAgo = someDaysAgo.valueOf();
    let val;
    await firebase.database()
      .ref(`history/${userid}`)
      .orderByKey()
      .startAt(valOfSevenDaysAgo.toString())
      .endAt(valOfOneDayAgo.toString())
      .once('value', (snapshot) => {
        val = snapshot.val();
      });
    return val;
  }

  // ログインしているかいないかの真偽値返すメソッド
  async isLoggedin() {
    const user = await this.userState();
    if (user) return true;
    return false;
  }
}
