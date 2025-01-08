// Firebase configuration and initialization
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
const auth = firebase.auth();
const db = firebase.firestore();

// Current User ID
let currentUserId = "";

// Register User
function registerUser() {
    const username = document.getElementById("username").value;
    if (username) {
        const uniqueId = generateUniqueId();
        const email = uniqueId + "@example.com"; // Unique email based on user ID
        const password = "password"; // Use a simple password for development

        // Create new user with Firebase Authentication
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                currentUserId = uniqueId; // Set current user ID

                // Add user data to Firestore with additional info
                db.collection("users").doc(uniqueId).set({
                    username: username,
                    messages: [],
                })
                .then(() => {
                    showUniqueId(uniqueId); // Show the unique ID on the screen
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

// Login User
function loginUser() {
    const userId = document.getElementById("login-id").value;
    const email = userId + "@example.com"; // Construct email with user ID
    const password = "password"; // Simple password for testing

    // Sign in the user with Firebase Authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUserId = userId; // Set current user ID
            window.location.href = "msg-screen.html"; // Redirect to the messaging screen
        })
        .catch((error) => {
            console.error("Error logging in:", error);
            alert("Login failed. Please check your ID.");
        });
}

// Generate Unique ID
function generateUniqueId() {
    return "user-" + Math.random().toString(36).substr(2, 6); // Simple unique ID generation
}

// Show the Unique ID after Registration
function showUniqueId(uniqueId) {
    const uniqueIdContainer = document.getElementById("unique-id-container");
    uniqueIdContainer.innerHTML = `Your unique ID is: <strong>${uniqueId}</strong>`;
    const copyButton = document.getElementById("copy-button");
    copyButton.style.display = "block"; // Show the copy button
}

// Copy Unique ID to Clipboard
function copyUniqueId() {
    const uniqueId = document.getElementById("unique-id-container").textContent;
    const textArea = document.createElement("textarea");
    textArea.value = uniqueId.split(": ")[1]; // Get the actual unique ID
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Unique ID copied to clipboard!");
}

// Start Listening for Messages
function startListening() {
    const receiverId = document.getElementById("receiver-id").value;
    const messagesContainer = document.getElementById("messages-container");

    if (receiverId && currentUserId) {
        db.collection("users")
            .doc(receiverId)
            .onSnapshot((doc) => {
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

// Send Message
function sendMessage() {
    const receiverId = document.getElementById("receiver-id").value;
    const messageText = document.getElementById("message-input").value;

    if (receiverId && messageText && currentUserId) {
        const newMessage = {
            text: messageText,
            sender: currentUserId,
            timestamp: new Date().toISOString()
        };

        // Save message to Firestore for sender and receiver
        db.collection("users").doc(currentUserId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMessage)
        });

        db.collection("users").doc(receiverId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(newMessage)
        });

        // Clear the input field after sending the message
        document.getElementById("message-input").value = "";
    }
}

// Logout User
function logoutUser() {
    auth.signOut()
        .then(() => {
            window.location.href = "login.html"; // Redirect to login page after logout
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
}

// Auth State Listener (Optional: Can be used for auto-login feature)
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserId = user.email.split("@")[0]; // Extract user ID from email
        console.log("User is logged in:", user);
    } else {
        console.log("No user is logged in");
    }
});
