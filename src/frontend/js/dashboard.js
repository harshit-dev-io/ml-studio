import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Use your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... other config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configuration
const API_BASE_URL = 'https://api.yourdomain.com/v1';
let currentOrgId = null; 

// DOM Elements
const userEmailDisplay = document.getElementById('userEmailDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const viewOrgList = document.getElementById('view-org-list');
const viewOrgDetails = document.getElementById('view-org-details');
const orgGrid = document.getElementById('orgGrid');
const membersTableBody = document.getElementById('membersTableBody');
const currentOrgName = document.getElementById('currentOrgName');

// Auth State Protection
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmailDisplay.textContent = user.email;
        loadOrganizations();
    } else {
        // Redirect to landing page if not logged in
        // window.location.href = '../index.html';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = '/index.html');
});

// Helper: Get Auth Headers
async function getAuthHeaders() {
    const token = await auth.currentUser.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// UI Navigation
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

document.getElementById('backToOrgs').addEventListener('click', () => {
    currentOrgId = null;
    showView('view-org-list');
    loadOrganizations();
});

// --- API Calls & Rendering ---

// 1. Load Organizations
async function loadOrganizations() {
    try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
            headers: await getAuthHeaders()
        });
        const data = await response.json();
        
        orgGrid.innerHTML = '';
        if (data.organizations && data.organizations.length > 0) {
            data.organizations.forEach(org => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${org.name}</h3>
                    <p>${org.member_count} Members</p>
                `;
                card.addEventListener('click', () => openOrganization(org.id, org.name));
                orgGrid.appendChild(card);
            });
        } else {
            orgGrid.innerHTML = '<p>You are not a member of any organizations yet.</p>';
        }
    } catch (error) {
        console.error("Failed to load orgs:", error);
    }
}

// 2. Create Organization
document.getElementById('createOrgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('orgName').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            document.getElementById('createOrgModal').classList.add('hidden');
            document.getElementById('createOrgForm').reset();
            loadOrganizations(); // Refresh the list
        }
    } catch (error) {
        console.error("Failed to create org:", error);
    }
});

// 3. Open Single Organization & Load Members
function openOrganization(orgId, orgName) {
    currentOrgId = orgId;
    currentOrgName.textContent = orgName;
    showView('view-org-details');
    loadMembers(orgId);
}

// 4. Load Members
async function loadMembers(orgId) {
    try {
        const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/members`, {
            headers: await getAuthHeaders()
        });
        const data = await response.json();
        
        membersTableBody.innerHTML = '';
        data.members.forEach(member => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${member.display_name || member.username}</td>
                <td>${member.email}</td>
                <td><span style="text-transform: capitalize;">${member.role}</span></td>
            `;
            membersTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Failed to load members:", error);
    }
}

// 5. Add Member
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('memberEmail').value;
    const role = document.getElementById('memberRole').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/organizations/${currentOrgId}/members`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ email, role })
        });
        
        if (response.ok) {
            document.getElementById('addMemberModal').classList.add('hidden');
            document.getElementById('addMemberForm').reset();
            loadMembers(currentOrgId); // Refresh member list
        }
    } catch (error) {
        console.error("Failed to add member:", error);
    }
});

// Modal Toggles
document.getElementById('openCreateOrgModal').addEventListener('click', () => {
    document.getElementById('createOrgModal').classList.remove('hidden');
});
document.getElementById('openAddMemberModal').addEventListener('click', () => {
    document.getElementById('addMemberModal').classList.remove('hidden');
});
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.add('hidden');
    });
});