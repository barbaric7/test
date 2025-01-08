// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDpjPHBPiLJLIlOfoENG9O1pMqt4X1hjDs",
    authDomain: "messagingportal-4da7a.firebaseapp.com",
    projectId: "messagingportal-4da7a",
    storageBucket: "messagingportal-4da7a.firebasestorage.app",
    messagingSenderId: "727884305223",
    appId: "1:727884305223:web:deb7b5fd14c2c5156fb262",
    measurementId: "G-4MWYXL2F3Z"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
