// ===============================
// RJ Papad - Auto Pool Version
// ===============================

// Helper: show/hide
function show(el) { if (el) el.style.display = ''; }
function hide(el) { if (el) el.style.display = 'none'; }

// Elements
const regSection = document.getElementById('regSection');
const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const welcomeText = document.getElementById('welcomeText');

// ---------------- REGISTER ----------------
function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const mobile = document.getElementById('regMobile').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  const gender = document.getElementById('regGender').value;

  // Validation
  if (!name || !/^[0-9]{10}$/.test(mobile)) {
    alert('कृपया नाम और 10 अंकों का मोबाइल सही भरें');
    return;
  }
  if (!pass) {
    alert('कृपया पासवर्ड भरें');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '[]');

  // Check duplicate mobile
  if (users.some(u => u.mobile === mobile)) {
    alert('यह मोबाइल नंबर पहले से रजिस्टर्ड है');
    return;
  }

  const newUser = { name, mobile, pass, gender };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // ✅ Auto Login (Auto Pool)
  localStorage.setItem('loggedInUser', JSON.stringify(newUser));
  showDashboard(newUser);

  // Reset fields
  document.getElementById('regName').value = '';
  document.getElementById('regMobile').value = '';
  document.getElementById('regPass').value = '';
  document.getElementById('regGender').value = '';
}

// ---------------- LOGIN ----------------
function loginUser() {
  const mobile = document.getElementById('logMobile').value.trim();
  const pass = document.getElementById('logPass').value.trim();

  if (!/^[0-9]{10}$/.test(mobile) || !pass) {
    alert('कृपया सही मोबाइल और पासवर्ड भरें');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.mobile === mobile && u.pass === pass);

  if (!user) {
    alert('मोबाइल या पासवर्ड गलत है ❌');
    return;
  }

  // ✅ Auto Redirect to Dashboard
  localStorage.setItem('loggedInUser', JSON.stringify(user));
  showDashboard(user);
}

// ---------------- DASHBOARD ----------------
function showDashboard(user) {
  hide(regSection);
  hide(loginSection);
  welcomeText.textContent = `स्वागत है, ${user.name}!`;
  show(dashboard);
}

function logoutUser() {
  localStorage.removeItem('loggedInUser');
  hide(dashboard);
  show(regSection);
  show(loginSection);
  alert('आप लॉगआउट हो गए हैं।');
}

// ---------------- EVENT LISTENERS ----------------
document.getElementById('regBtn').addEventListener('click', registerUser);
document.getElementById('logBtn').addEventListener('click', loginUser);
document.getElementById('logoutBtn').addEventListener('click', logoutUser);

// ---------------- AUTO LOGIN ON PAGE LOAD ----------------
window.addEventListener('DOMContentLoaded', () => {
  const logged = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  if (logged && logged.mobile) {
    showDashboard(logged);
  } else {
    hide(dashboard);
    show(regSection);
    show(loginSection);
  }
});
