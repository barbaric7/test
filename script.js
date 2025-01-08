// script.js
const firebaseConfig = {
    apiKey: "AIzaSyDpjPHBPiLJLIlOfoENG9O1pMqt4X1hjDs",
    authDomain: "messagingportal-4da7a.firebaseapp.com",
    projectId: "messagingportal-4da7a",
    storageBucket: "messagingportal-4da7a.firebasestorage.app",
    messagingSenderId: "727884305223",
    appId: "1:727884305223:web:deb7b5fd14c2c5156fb262",
    measurementId: "G-4MWYXL2F3Z"
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  let currentUserId = "";
  
  function registerUser() {
    const username = document.getElementById("username").value;
    if (username) {
      const uniqueId = generateUniqueId();
      auth.createUserWithEmailAndPassword(uniqueId + "@example.com", "password")
        .then(userCredential => {
          currentUserId = uniqueId;
          db.collection("users").doc(uniqueId).set({ username, messages: [] });
          showUniqueId(uniqueId);
        })
        .catch(error => console.error("Error registering user:", error));
    }
  }
  
  function loginUser() {
    const userId = document.getElementById("login-id").value;
    auth.signInWithEmailAndPassword(userId + "@example.com", "password")
      .then(userCredential => {
        currentUserId = userId;
        window.location.href = "msg-screen.html";
      })
      .catch(error => console.error("Error logging in:", error));
  }
  
  function generateUniqueId() {
    return "user-" + Math.random().toString(36).substr(2, 6); // Generates a simple unique ID
  }
  
  function showUniqueId(id) {
    document.getElementById("unique-id").textContent = id;
    document.getElementById("unique-id-container").style.display = "block";
  }
  
  function copyToClipboard() {
    const uniqueId = document.getElementById("unique-id").textContent;
    navigator.clipboard.writeText(uniqueId).then(() => {
      alert("Unique ID copied!");
    });
  }
  
  function sendMessage() {
    const friendId = document.getElementById("friend-id").value;
    const message = document.getElementById("message-input").value;
    if (friendId && message) {
      db.collection("messages").add({
        sender: currentUserId,
        receiver: friendId,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        document.getElementById("message-input").value = "";
        displayMessages(friendId);
      });
    }
  }
  
  function displayMessages(friendId) {
    db.collection("messages").where("sender", "in", [currentUserId, friendId])
      .where("receiver", "in", [currentUserId, friendId])
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
        const messagesContainer = document.getElementById("messages");
        messagesContainer.innerHTML = "";
        snapshot.forEach(doc => {
          const msgData = doc.data();
          const messageElement = document.createElement("div");
          messageElement.classList.add(msgData.sender === currentUserId ? "sent" : "received");
          messageElement.textContent = msgData.message;
          messagesContainer.appendChild(messageElement);
        });
      });
  }
  