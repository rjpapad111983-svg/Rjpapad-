// ---------- Auto-pool registerUser (no sponsor input required) ----------
function registerUser(){
  // form ids (adjust if html ids different)
  const nameEl = document.getElementById('regName');
  const mobileEl = document.getElementById('regMobile');
  const passEl = document.getElementById('regPass');
  const genderEl = document.getElementById('regGender');
  // sponsor field may exist but we will ignore it to enforce auto-pool
  // validation
  const name = nameEl ? nameEl.value.trim() : '';
  const mobile = mobileEl ? mobileEl.value.trim() : '';
  const pass = passEl ? passEl.value : '';
  const gender = genderEl ? genderEl.value : '';

  if(!name || !/^\d{10}$/.test(mobile) || !pass){
    alert('कृपया नाम, 10-अंकों का मोबाइल और पासवर्ड सही भरें');
    return;
  }

  // load users
  let users = JSON.parse(localStorage.getItem('rj_users_demo_v1') || '[]');

  // duplicate check
  if(users.find(u=>String(u.mobile)===String(mobile))){
    alert('यह मोबाइल पहले से रजिस्टर है');
    return;
  }

  // find parent by auto-pool (first user with children < 2)
  function findAutoParent(usersArr){
    if(usersArr.length === 0) return null; // no parent, this will be root
    // count children
    const counts = {};
    usersArr.forEach(u => {
      if(u.parent_id) counts[u.parent_id] = (counts[u.parent_id]||0)+1;
    });
    // find first user in array order with children < 2
    for(let i=0;i<usersArr.length;i++){
      const uid = usersArr[i].id;
      const c = counts[uid]||0;
      if(c < 2) return uid;
    }
    // if all full (rare), place under first user
    return usersArr[0].id;
  }

  const parentId = findAutoParent(users);

  // create user
  const id = Date.now() + Math.floor(Math.random()*90);
  const user = {
    id: id,
    name: name,
    mobile: mobile,
    password: pass,
    gender: gender,
    parent_id: parentId,   // auto pool parent
    sponsor_id: parentId,  // for compatibility
    status: 'active',
    created_at: new Date().toISOString()
  };

  users.push(user);
  localStorage.setItem('rj_users_demo_v1', JSON.stringify(users));

  // init balances & ledger
  let balances = JSON.parse(localStorage.getItem('rj_balances_demo_v1')||'{}');
  balances[id] = balances[id] || 0;
  localStorage.setItem('rj_balances_demo_v1', JSON.stringify(balances));

  let ledger = JSON.parse(localStorage.getItem('rj_ledger_demo_v1')||'[]');
  ledger.push({ id: 'led_'+Date.now(), user_id:id, type:'credit', amount:0, reason:'Registered', created_at: new Date().toISOString() });
  localStorage.setItem('rj_ledger_demo_v1', JSON.stringify(ledger));

  // ------- Commission distribution (configurable) -------
  // If you prefer no commission at registration, set distributeOnJoin = false
  const distributeOnJoin = true;
  // amounts per level (level 1 = direct parent, level2 = parent's parent, ...)
  // adjust these numbers as per your plan. Here example rupee amounts:
  const LEVEL_COMM = [5,3,2,1,1]; // up to 5 levels default
  if(distributeOnJoin){
    // build map for quick id->user lookup
    const usersMap = {};
    users.forEach(u=> usersMap[u.id] = u);
    // helper to get ancestor at n levels above (n=1 => parent)
    function getAncestor(startId, n){
      let cur = startId;
      for(let i=0;i<n;i++){
        if(!cur) return null;
        const parent = usersMap[cur] ? usersMap[cur].parent_id : null;
        cur = parent;
      }
      return cur;
    }
    for(let lvl=0; lvl<LEVEL_COMM.length; lvl++){
      const ancestorId = getAncestor(id, lvl+1); // lvl+1 up
      if(ancestorId && String(ancestorId) in balances){
        // credit amount
        const amt = LEVEL_COMM[lvl];
        balances[ancestorId] = (parseFloat(balances[ancestorId]) || 0) + amt;
        ledger.push({ id:'led_comm_'+Date.now()+'_'+lvl, user_id: ancestorId, type:'credit', amount: amt, reason: `Level ${lvl+1} join commission from ${mobile}`, created_at: new Date().toISOString() });
      }
    }
    // save updated balances & ledger
    localStorage.setItem('rj_balances_demo_v1', JSON.stringify(balances));
    localStorage.setItem('rj_ledger_demo_v1', JSON.stringify(ledger));
  }

  // remember session so register hides if you used that behavior
  sessionStorage.setItem('rj_registered_mobile', mobile);

  alert('रजिस्ट्रेशन सफल! ID: ' + id + (parentId ? ('\nParent ID: '+parentId) : '\n(You are root)'));
  if(typeof updateAuthVisibility === 'function') updateAuthVisibility();

  console.log('Registered (auto-pool):', user);
  return user;
}
