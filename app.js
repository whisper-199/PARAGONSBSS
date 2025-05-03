// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFG079giO5cY3P3EuYgdf0OlWlBQ42H3I",
  authDomain: "paragons-4f705.firebaseapp.com",
  projectId: "paragons-4f705",
  storageBucket: "paragons-4f705.firebasestorage.app",
  messagingSenderId: "536780033764",
  appId: "1:536780033764:web:118f43ebeb5d973c4966f1",
  measurementId: "G-7LNV7MRC61"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      document.getElementById("uploadSection").style.display = "block";
      loadProfilePicture(userCredential.user.uid);
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
}

function uploadImage() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) {
    alert("Please select an image file.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const storageRef = storage.ref(`profilePics/${user.uid}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed',
    snapshot => {
      document.getElementById("uploadStatus").textContent = "Uploading...";
    },
    error => {
      document.getElementById("uploadStatus").textContent = "Error: " + error.message;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        document.getElementById("profile-pic").src = downloadURL;
        document.getElementById("uploadStatus").textContent = "Upload successful!";
      });
    }
  );
}

function loadProfilePicture(uid) {
  const storageRef = storage.ref(`profilePics/${uid}`);
  storageRef.getDownloadURL()
    .then(url => {
      document.getElementById("profile-pic").src = url;
    })
    .catch(() => {
      document.getElementById("profile-pic").src = "https://via.placeholder.com/200";
    });
}
const db = firebase.firestore(); // Or firebase.database() for Realtime DB

async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const name = document.getElementById("displayName").value;
  const hobbies = document.getElementById("hobbies").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const instagram = document.getElementById("instagram").value;
  const twitter = document.getElementById("twitter").value;
  const file = document.getElementById("profileImage").files[0];

try {
  const docRef = db.collection("profiles").doc(user.uid);

  if (file) {
    const imageRef = storage.ref(`profileImages/${user.uid}`);
    const snapshot = await imageRef.put(file);
    const url = await snapshot.ref.getDownloadURL();
    await docRef.set({
      name,
      hobbies,
      whatsapp,
      instagram,
      twitter,
      profileImage: url,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } else {
    await docRef.set({
      name,
      hobbies,
      whatsapp,
      instagram,
      twitter,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
  document.getElementById("profileStaus").textContent = "Profile saved successfully!";
} catch (error) {
  console.error("Error saving profile: ", error);
  document.getElementById("profileStaus").textContent = "Error updating profile.";
}

    alert("Profile saved successfully!");
  }
  document.getElementById("registerLink").addEventListener("click", function(e) {e.preventDefault();
  document.getElementById("profileCardsContainer").style.display = "none";
  });
  function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }
  
    const name = document.getElementById("displayName").value;
    const hobbies = document.getElementById("hobbies").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const instagram = document.getElementById("instagram").value;
    const twitter = document.getElementById("twitter").value;
  
    db.collection("profiles").doc(user.uid).set({
      name,
      hobbies,
      whatsapp,
      instagram,
      twitter
    })
    .then(() => {
      alert("Profile saved successfully!");
    })
    .catch(error => {
      console.error("Error saving profile: ", error);
      alert("Error saving profile: " + error.message);
    });
  }