// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    getIdToken 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// TODO: Replace this with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxztSMWO-6YByM72j7ecK9T2UC4xhlolE",
    authDomain: "ml-studio-fb883.firebaseapp.com",
    projectId: "ml-studio-fb883",
    storageBucket: "ml-studio-fb883.firebasestorage.app",
    messagingSenderId: "506347802771",
    appId: "1:506347802771:web:3c1b0785e2d6e71ee9bd66",
    measurementId: "G-KTHZB61TKM"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);


// DOM Elements
const modal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close-btn');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const heroCtaBtn = document.getElementById('heroCtaBtn');
const authForm = document.getElementById('authForm');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const modalTitle = document.getElementById('modalTitle');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const authToggleText = document.getElementById('authToggleText');
const authError = document.getElementById('authError');
const signupOnlyFields = document.querySelectorAll('.signup-only');

// State
let isSignupMode = true;

// UI Functions
const openModal = (signup = true) => {
    isSignupMode = signup;
    updateModalUI();
    modal.classList.remove('hidden');
    authError.textContent = '';
};

const closeModal = () => modal.classList.add('hidden');

const updateModalUI = () => {
    modalTitle.textContent = isSignupMode ? 'Sign Up' : 'Log In';
    submitAuthBtn.textContent = isSignupMode ? 'Create Account' : 'Log In';
    authToggleText.textContent = isSignupMode ? 'Already have an account?' : 'Need an account?';
    toggleAuthMode.textContent = isSignupMode ? 'Log in' : 'Sign up';

    // Toggle visibility and 'required' attributes for signup fields
    signupOnlyFields.forEach(field => {
        field.style.display = isSignupMode ? 'block' : 'none';
        const input = field.querySelector('input');
        if (input) {
            input.required = isSignupMode; 
            if (!isSignupMode) input.value = ''; // Clear fields when switching to login
        }
    });
};

// Event Listeners for UI
loginBtn.addEventListener('click', () => openModal(false));
signupBtn.addEventListener('click', () => openModal(true));
heroCtaBtn.addEventListener('click', () => openModal(true));
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isSignupMode = !isSignupMode;
    updateModalUI();
    authError.textContent = '';
});

// Authentication & Backend API Submission
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    authError.textContent = '';
    submitAuthBtn.disabled = true;
    submitAuthBtn.textContent = 'Processing...';

    try {
        let userCredential;
        let apiUrl = '';
        let payload = {};
        
        // 1. Authenticate with Firebase & Prepare Backend Payload
        if (isSignupMode) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Gather extra signup data
            const username = document.getElementById('username').value;
            const displayName = document.getElementById('displayName').value;

            apiUrl = 'http://127.0.0.1:8000/auth/signup/'; // Your Signup Endpoint
            payload = {
                username: username,
                display_name: displayName
            };
        } else {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            apiUrl = 'http://127.0.0.1:8000/auth/signup/'; // Your Login Endpoint
            payload = {
                email: userCredential.user.email,
                uid: userCredential.user.uid
            };
        }

        // 2. Get the secure ID token
        const idToken = await userCredential.user.getIdToken();
        console.log(idToken)
        // 3. Send the token and payload to your backend API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Sending the ID token securely as a Bearer token
                'Authorization': `Bearer ${idToken}` 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 4. Handle backend response
        if (response.ok) {
            // window.location.href = '/html/dashboard.html'; 
        } else {
            throw new Error(data.message || 'Backend verification failed');
        }

    } catch (error) {
        console.error("Auth Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            authError.textContent = 'This email is already registered.';
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            authError.textContent = 'Invalid email or password.';
        } else {
            authError.textContent = error.message;
        }
    } finally {
        submitAuthBtn.disabled = false;
        updateModalUI(); // Resets button text safely
    }
});