// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyBFG079giO5cY3P3EuYgdf0OlWlBQ42H3I",
  authDomain: "paragons-4f705.firebaseapp.com",
  projectId: "paragons-4f705",
  storageBucket: "paragons-4f705.appspot.com",
  messagingSenderId: "536780033764",
  appId: "1:536780033764:web:118f43ebeb5d973c4966f1",
  measurementId: "G-7LNV7MRC61"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileForm = document.getElementById('profileForm');
const loginLink = document.getElementById('loginLink');
const logoutLink = document.getElementById('logoutLink');
const registerLink = document.getElementById('registerLink');
const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');
const cardContainer = document.getElementById('cardContainer');
const userNav = document.getElementById('userNav');
const userName = document.getElementById('userName');
const loadingCards = document.getElementById('loadingCards');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check auth state when page loads
    auth.onAuthStateChanged(handleAuthStateChange);
    
    // Set up event listeners
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        profileForm.style.display = 'none';
    });
    
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });
    
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            profileForm.style.display = 'block';
            loginForm.style.display = 'none';
            registerForm.style.display = 'none';
            loadProfileData();
        } else {
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
            profileForm.style.display = 'none';
        }
    });
    
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });
    
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });
});

// Auth State Handler
function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        registerLink.textContent = 'My Profile';
        profileForm.style.display = 'block';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        userNav.style.display = 'inline-block';
        // Fetch and display user's name
        db.collection('profiles').doc(user.uid).get().then(doc => {
            userName.textContent = doc.exists && doc.data().name ? doc.data().name : user.email;
        });
        loadProfileData();
        loadAllCards();
    } else {
        // User is signed out
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        registerLink.textContent = 'Register';
        profileForm.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        userNav.style.display = 'none';
        userName.textContent = '';
        loadAllCards();
    }
}

// Authentication Functions
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const status = document.getElementById('loginStatus');
    
    status.textContent = 'Logging in...';
    status.style.color = 'black';
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            status.textContent = 'Login successful!';
            status.style.color = 'green';
            loginForm.style.display = 'none';
        })
        .catch(error => {
            status.textContent = 'Error: ' + error.message;
            status.style.color = 'red';
        });
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const status = document.getElementById('registerStatus');
    
    status.textContent = 'Creating account...';
    status.style.color = 'black';
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Add user to Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            status.textContent = 'Registration successful!';
            status.style.color = 'green';
            registerForm.style.display = 'none';
        })
        .catch(error => {
            status.textContent = 'Error: ' + error.message;
            status.style.color = 'red';
        });
}

// Profile Functions
function loadProfileData() {
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('profiles').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('displayName').value = data.name || '';
                document.getElementById('hobbies').value = data.hobbies || '';
                document.getElementById('whatsapp').value = data.whatsapp || '';
                document.getElementById('instagram').value = data.instagram || '';
                document.getElementById('twitter').value = data.twitter || '';
            }
        });
}

async function saveProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to update your profile.');
        return;
    }
    
    const name = document.getElementById('displayName').value;
    const hobbies = document.getElementById('hobbies').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const instagram = document.getElementById('instagram').value;
    const twitter = document.getElementById('twitter').value;
    const file = document.getElementById('profileImage').files[0];
    const status = document.getElementById('profileStatus');
    
    status.textContent = 'Saving profile...';
    status.style.color = 'black';
    
    try {
        const profileData = {
            name,
            hobbies,
            whatsapp,
            instagram,
            twitter,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid
        };
        
        if (file) {
            // Upload image to storage
            const storageRef = storage.ref(`profileImages/${user.uid}`);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            profileData.photoURL = downloadURL;
        }
        
        // Save to Firestore
        await db.collection('profiles').doc(user.uid).set(profileData, { merge: true });
        
        status.textContent = 'Profile saved successfully!';
        status.style.color = 'green';
        loadAllCards();
        launchConfetti();
    } catch (error) {
        console.error('Error saving profile:', error);
        status.textContent = 'Error: ' + error.message;
        status.style.color = 'red';
    }
}

// Card Functions
function loadAllCards() {
    loadingCards.style.display = 'inline-block';
    cardContainer.innerHTML = '';
    cardContainer.appendChild(loadingCards);

    // First load static cards
    loadStaticCards();

    // Then load dynamic profile cards
    db.collection('profiles').get()
        .then(querySnapshot => {
            const currentUserId = auth.currentUser?.uid;
            let hasOwnCard = false;
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.userId === currentUserId) {
                    addCardToContainer(data, true);
                    hasOwnCard = true;
                } else {
                    addCardToContainer(data, false);
                }
            });
            loadingCards.style.display = 'none';
        })
        .catch(error => {
            console.error('Error loading profiles:', error);
            loadingCards.style.display = 'none';
        });
}

function loadStaticCards() {
    const staticCards = [
        {
            name: "Sulphyne",
            hobbies: "Reading, Writing, Adding commas to her money",
            whatsapp: "256761319412",
            photoURL: "Sulphyne.jpg"
        },
        {
            name: "Alan",
            hobbies: "Playing FIFA2025, EFOOTBALL, Fashion, Listening to music",
            whatsapp: "256770725060",
            photoURL: "Alan.jpg"
        },
        {
            name: "Comfort",
            hobbies: "Football, Music, Trips, Dancing",
            whatsapp: "256771750214",
            photoURL: "Comfort.jpg"
        },
        {
            name: "Ederbert",
            hobbies: "Football, Music, Partying",
            whatsapp: "256777865815",
            photoURL: "Ederbert.jpg"
        },
        {
            name: "Comfort Icom",
            hobbies: "Fashion",
            whatsapp: "256787406593",
            photoURL: "ComfortIcom.jpg"
        },
        {
            name: "DISMAS",
            hobbies: "Music, Reading, Fashion",
            whatsapp: "256705194758",
            photoURL: "DISMAS.jpg"
        },
        {
            name: "Dan Kyathumba",
            hobbies: "Football, Music, Dancing",
            whatsapp: "256761667669",
            photoURL: "DanKyathumba.jpg"
        },
        {
            name: "Philip Arts",
            hobbies: "Debating, Art, Painting",
            whatsapp: "256784245430",
            photoURL: "PhilipArts.jpg"
        },
        {
            name: "Frank Praise",
            hobbies: "Coming soon",
            whatsapp: "#",
            photoURL: "FrankPraise.jpg"
        },
        {
            name: "Fred TSO",
            hobbies: "Coming soon",
            whatsapp: "256762348851",
            photoURL: "fredtso.jpg"
        },
        {
            name: "ANITA EDITH",
            hobbies: "Music, listening to music and Reading",
            whatsapp: "256707766987",
            photoURL: "anitaedith.jpg"
        },
        {
            name: "KIKENGE",
            hobbies: "Football",
            whatsapp: "256707766987",
            photoURL: "hiv.jpg"
        },
        {
            name: "AKRAM PETER (HP)",
            hobbies: "Preaching, Debating",
            whatsapp: "256787475141",
            photoURL: "akram.jpg"
        },
        {
            name: "SHELIA",
            hobbies: "Singing and reading",
            whatsapp: "256789462955",
            photoURL: "shelia.jpg"
        }
    ];

    cardContainer.innerHTML = ''; // Clear container first
    
    staticCards.forEach(cardData => {
        addCardToContainer(cardData);
    });
}

function addCardToContainer(data, isOwn = false) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-name', data.name || 'Unnamed');
    if (isOwn) card.style.border = '2px solid var(--gold)';

    card.innerHTML = `
        <div class="inner-card">
            <div class="front">
                <img src="${data.photoURL || 'https://via.placeholder.com/250x350'}" alt="${data.name || 'Profile'}">
            </div>
            <div class="back">
                <h3>${data.name || 'Unnamed'}${isOwn ? ' (You)' : ''}</h3>
                <p>Hobbies: ${data.hobbies || 'Not specified'}</p>
                <div class="social-buttons">
                    ${data.whatsapp && data.whatsapp !== '#' ? 
                        `<a href="https://wa.me/${data.whatsapp}" target="_blank" class="social-link whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>` : ''}
                    ${data.instagram ? 
                        `<a href="${data.instagram}" target="_blank" class="social-link instagram">
                            <i class="fab fa-instagram"></i> Instagram
                        </a>` : ''}
                    ${data.twitter ? 
                        `<a href="${data.twitter}" target="_blank" class="social-link twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </a>` : ''}
                </div>
            </div>
        </div>
    `;
    cardContainer.appendChild(card);
}

// Search Function
function searchCards() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        card.style.display = name.includes(input) ? 'block' : 'none';
    });
}

// Confetti effect function
function launchConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    document.body.appendChild(confetti);

    for (let i = 0; i < 120; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.background = `hsl(${Math.random()*360},100%,60%)`;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.opacity = 0.7;
        particle.style.transform = `scale(${Math.random() + 0.5})`;
        particle.style.transition = 'all 2s cubic-bezier(.4,2,.6,1)';
        confetti.appendChild(particle);

        setTimeout(() => {
            particle.style.top = 100 + Math.random() * 20 + 'vh';
            particle.style.opacity = 0;
        }, 50);
    }
    setTimeout(() => confetti.remove(), 2200);
}