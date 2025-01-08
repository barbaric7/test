// script.js
const auth = firebase.auth();
const db = firebase.firestore();

let currentUserId = "";

function registerUser() {
    const username = document.getElementById("username").value;
    if (username) {
        const uniqueId = generateUniqueId();
        const email = uniqueId + "@example.com"; 
        const password = "password"; 

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                currentUserId = uniqueId;

                db.collection("users").doc(uniqueId).set({
                    username: username,
                    messages: [],
                })
                .then(() => {
                    showUniqueId(uniqueId);
                })
                .catch((error) => {
                    console.error("Error adding user to Firestore:", error);
                });
            })
            .catch((error) => {
                console.error("Error creating user:", error);
            });
    } else {
        alert("Please enter a username!");
    }
}

function loginUser() {
    const userId = document.getElementById("login-id").value;
    const email = userId + "@example.com"; 
    const password = "password"; 

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUserId = userId;
            window.location.href = "msg-screen.html";
        })
        .catch((error) => {
            console.error("Error logging in:", error);
            alert("Login failed. Please check your ID.");
        });
}

function generateUniqueId() {
    return "user-" + Math.random().toString(36).substr(2, 6);
}

function showUniqueId(uniqueId) {
    const uniqueIdContainer = document.getElementById("unique-id-container");
    uniqueIdContainer.innerHTML = `Your unique ID is: <strong>${uniqueId}</strong>`;
    const copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block";
}

function copyUniqueId() {
    const uniqueId = document.getElementById("unique-id-container").textContent;
    const textArea = document.createElement("textarea");
    textArea.value = uniqueId.split(": ")[1];
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Unique ID copied to clipboard!");
}

function startListening() {
    const receiverId = document.getElementById("receiver-id").value;
    const messagesContainer = document.getElementById("messages-container");

    if (receiverId && currentUserId) {
        db.collection("users").doc(receiverId).onSnapshot((doc) => {
            if (doc.exists) {
                const messages = doc.data().messages;
                messagesContainer.innerHTML = "";
                messages.forEach((msg) => {
                    const msgDiv = document.createElement("div");
                    msgDiv.classList.add("message");
                    msgDiv.innerText = msg.text;
                    messagesContainer.appendChild(msgDiv);
                });
            }
        });
    }
}

function sendMessage() {
    const receiverId = document.getElementById("receiver-id").value;
    const messageText = document.getElementById("message-input").value;

    if (receiverId && messageText && currentUserId) {
        const newMessage = {
            text: messageText,
            sender: currentUserId,
            timestamp: new Date().toISOString()
        };

        db.collection("users").doc(currentUserId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMessage)
        });

        db.collection("users").doc(receiverId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMessage)
        });

        document.getElementById("message-input").value = "";
    }
}

function logoutUser() {
    auth.signOut()
        .then(() => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
}
