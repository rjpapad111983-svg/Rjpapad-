// ---------- Auto-pool registerUser (No Sponsor, Auto Hide, Re-register Fix) ----------

function registerUser() {
  try {
    // ---- Step 1: Input values ----
    const nameEl = document.getElementById("name");
    const mobileEl = document.getElementById("mobile");
    const passEl = document.getElementById("password");
    const genderEl = document.getElementById("gender");

    const name = nameEl ? nameEl.value.trim() : "";
    const mobile = mobileEl ? mobileEl.value.trim() : "";
    const pass = passEl ? passEl.value.trim() : "";
    const gender = genderEl ? genderEl.value.trim() : "";

    if (!name || !/^\d{10}$/.test(mobile)) {
      alert("कृपया नाम और 10 अंकों का मोबाइल सही भरें");
      return;
    }

    // ---- Step 2: Load existing users ----
    let users = JSON.parse(localStorage.getItem("rj_users_demo_v1") || "[]");

    // ---- Step 3: Duplicate check ----
    if (users.find(u => String(u.mobile) === String(mobile))) {
      alert("यह मोबाइल पहले से रजिस्टर है ✅ (पुराना हटाया जा रहा है)");
      removeOldMobileBeforeRegister(mobile); // पुराना record हटा दो
      users = JSON.parse(localStorage.getItem("rj_users_demo_v1") || "[]"); // reload
    }

    // ---- Step 4: Find Auto Parent ----
    function findAutoParent(arr) {
      if (arr.length === 0) return null;
      const counts = {};
      arr.forEach(u => {
        if (u.parent_id) counts[u.parent_id] = (counts[u.parent_id] || 0) + 1;
      });
      for (let i = 0; i < arr.length; i++) {
        const uid = arr[i].id;
        const c = counts[uid] || 0;
        if (c < 2) return uid;
      }
      return arr[0].id;
    }

    const parentId = findAutoParent(users);

    // ---- Step 5: Create new user ----
    const id = Date.now() + Math.floor(Math.random() * 999);
    const user = {
      id,
      name,
      mobile,
      password: pass,
      gender,
      parent_id: parentId,
      sponsor_id: parentId, // (no manual sponsor)
      status: "active",
      created_at: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem("rj_users_demo_v1", JSON.stringify(users));

    // ---- Step 6: Balances & Ledger ----
    let balances = JSON.parse(localStorage.getItem("rj_balances_demo_v1") || "{}");
    balances[id] = balances[id] || 0;
    localStorage.setItem("rj_balances_demo_v1", JSON.stringify(balances));

    let ledger = JSON.parse(localStorage.getItem("rj_ledger_demo_v1") || "[]");
    ledger.push({ id: "led_" + Date.now(), user: id, amt: 0, note: "Joined", ts: Date.now() });
    localStorage.setItem("rj_ledger_demo_v1", JSON.stringify(ledger));

    // ---- Step 7: Remember session ----
    sessionStorage.setItem("rj_registered_mobile", mobile);

    // ---- Step 8: Alert + Auto Hide + Show Login ----
    alert("रजिस्ट्रेशन सफल! ID: " + id + " ✅");

    afterRegisterSuccess(mobile);

    if (typeof updateAuthVisibility === "function") updateAuthVisibility();

    console.log("✅ Registered user:", user);
    return user;

  } catch (e) {
    console.error("❌ Register error:", e);
  }
}

// ---------- Helper Function to Remove Old Mobile ----------
function removeOldMobileBeforeRegister(mobile) {
  try {
    let users = JSON.parse(localStorage.getItem("rj_users_demo_v1") || "[]");
    let balances = JSON.parse(localStorage.getItem("rj_balances_demo_v1") || "{}");
    let ledger = JSON.parse(localStorage.getItem("rj_ledger_demo_v1") || "[]");
    let regList = JSON.parse(localStorage.getItem("rj_registered_mobiles") || "[]");

    users = users.filter(u => String(u.mobile) !== String(mobile));
    regList = regList.filter(m => String(m) !== String(mobile));

    Object.keys(balances).forEach(k => {
      const obj = balances[k];
      if (obj && obj.mobile === mobile) delete balances[k];
    });

    localStorage.setItem("rj_users_demo_v1", JSON.stringify(users));
    localStorage.setItem("rj_registered_mobiles", JSON.stringify(regList));
    localStorage.setItem("rj_balances_demo_v1", JSON.stringify(balances));
    localStorage.setItem("rj_ledger_demo_v1", JSON.stringify(ledger));

    console.log("♻️ पुराना मोबाइल हटाया गया:", mobile);
  } catch (e) {
    console.error("❌ Error while removing old mobile:", e);
  }
}
