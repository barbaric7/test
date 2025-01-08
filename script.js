// Firebase Configuration (Use your Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyDpjPHBPiLJLIlOfoENG9O1pMqt4X1hjDs",
    authDomain: "messagingportal-4da7a.firebaseapp.com",
    projectId: "messagingportal-4da7a",
    storageBucket: "messagingportal-4da7a.firebasestorage.app",
    messagingSenderId: "727884305223",
    appId: "1:727884305223:web:deb7b5fd14c2c5156fb262",
    measurementId: "G-4MWYXL2F3Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firestore and Auth references
const db = firebase.firestore();
const auth = firebase.auth();

// Registration Function
function registerUser() {
    const username = document.getElementById("username").value;
    if (username) {
        const uniqueId = generateUniqueId();
        const email = uniqueId + "@example.com"; // Fake email using unique ID
        const password = "password"; // Static password for simplicity

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                currentUserId = uniqueId;

                // Store the username and messages in Firestore
                db.collection("users").doc(uniqueId).set({
                    username: username,
                    messages: [],
                })
                .then(() => {
                    // Show the unique ID and redirect to the message screen
                    showUniqueId(uniqueId);
                    window.location.href = "msg-screen.html";
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

// Login Function
function loginUser() {
    const userId = document.getElementById("userId").value;
    const password = "password"; // Static password for simplicity

    if (userId) {
        const email = userId + "@example.com"; // Fake email using unique ID

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // If login is successful, redirect to the message screen
                window.location.href = "msg-screen.html";
            })
            .catch((error) => {
                console.error("Error logging in:", error);
                alert("Invalid ID or password");
            });
    } else {
        alert("Please enter your unique ID!");
    }
}

// Show the Unique ID to the user
function showUniqueId(uniqueId) {
    const uniqueIdDisplay = document.getElementById("uniqueIdDisplay");
    uniqueIdDisplay.textContent = `Your Unique ID: ${uniqueId}`;
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.addEventListener("click", function() {
        navigator.clipboard.writeText(uniqueId);
        alert("Unique ID copied to clipboard!");
    });
}

// Generate a Unique ID (short and memorable)
function generateUniqueId() {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Check if user is logged in and redirect to message page if logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // If the user is logged in, redirect them to the message screen
        window.location.href = "msg-screen.html";
    }
});

// Send message function
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    const receiverId = document.getElementById("receiverId").value;

    if (message && receiverId) {
        // Save the message to Firestore
        db.collection("users").doc(receiverId).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                sender: currentUserId,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
        })
        .then(() => {
            console.log("Message sent to receiver!");
            messageInput.value = ""; // Clear message input
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
    } else {
        alert("Please enter a message and receiver ID!");
    }
}

// Listen for new messages in Firestore (real-time)
function listenForMessages() {
    const messagesContainer = document.getElementById("messagesContainer");
    const userRef = db.collection("users").doc(currentUserId);

    // Listen for real-time updates of the user's messages
    userRef.onSnapshot((doc) => {
        if (doc.exists) {
            const messages = doc.data().messages || [];
            messagesContainer.innerHTML = ""; // Clear the messages container

            // Display all messages
            messages.forEach((msg) => {
                const messageElement = document.createElement("div");
                messageElement.classList.add("message");
                messageElement.textContent = `${msg.sender}: ${msg.message}`;
                messagesContainer.appendChild(messageElement);
            });
        }
    });
}

// Start listening for messages after login
if (window.location.pathname === "/msg-screen.html") {
    listenForMessages();
}
