// DOM लोड होने के बाद ही JS चले
window.addEventListener("DOMContentLoaded", () => {

  // Helper functions
  const show = el => el && (el.style.display = "");
  const hide = el => el && (el.style.display = "none");

  const regSection = document.getElementById("regSection");
  const loginSection = document.getElementById("loginSection");
  const dashboard = document.getElementById("dashboard");
  const welcomeText = document.getElementById("welcomeText");

  // ---------------- Register ----------------
  function registerUser() {
    const name = document.getElementById("regName").value.trim();
    const mobile = document.getElementById("regMobile").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    if (!name || !/^[0-9]{10}$/.test(mobile)) {
      alert("कृपया नाम और 10 अंकों का मोबाइल सही भरें");
      return;
    }
    if (!pass) {
      alert("कृपया पासवर्ड भरें");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.mobile === mobile)) {
      alert("यह मोबाइल पहले से रजिस्टर्ड है");
      return;
    }

    const user = { name, mobile, pass };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    showDashboard(user);
  }

  // ---------------- Login ----------------
  function loginUser() {
    const mobile = document.getElementById("logMobile").value.trim();
    const pass = document.getElementById("logPass").value.trim();

    if (!/^[0-9]{10}$/.test(mobile) || !pass) {
      alert("कृपया सही मोबाइल और पासवर्ड भरें");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.mobile === mobile && u.pass === pass);

    if (!user) {
      alert("मोबाइल या पासवर्ड गलत है ❌");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    showDashboard(user);
  }

  // ---------------- Dashboard ----------------
  function showDashboard(user) {
    hide(regSection);
    hide(loginSection);
    welcomeText.textContent = `स्वागत है, ${user.name}!`;
    show(dashboard);
  }

  function logoutUser() {
    localStorage.removeItem("loggedInUser");
    hide(dashboard);
    show(regSection);
    show(loginSection);
  }

  // ---------------- Events ----------------
  document.getElementById("regBtn").addEventListener("click", registerUser);
  document.getElementById("logBtn").addEventListener("click", loginUser);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);

  // ---------------- Auto login on reload ----------------
  const logged = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (logged) showDashboard(logged);
});
