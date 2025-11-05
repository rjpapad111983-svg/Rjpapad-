// ✅ Auto Create Admin Account (only once)
(function(){
  let users = JSON.parse(localStorage.getItem('rj_users_demo_v1')||'[]');
  if(users.length === 0){
    let id = Date.now();
    let adminUser = {
      id: id,
      name: "Admin",
      mobile: "9999999999",
      password: "admin",
      parent_id: null,
      status: "active",
      created_at: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem('rj_users_demo_v1', JSON.stringify(users));
    let balances = {};
    balances[id] = 0;
    localStorage.setItem('rj_balances_demo_v1', JSON.stringify(balances));
    console.log("✅ Admin ID auto created with mobile 9999999999 & password admin");
    alert("✅ Admin ID created!\nMobile: 9999999999\nPassword: admin");
  }
})();
// minimal admin helper (only for admin.html functionality)
function $(id){return document.getElementById(id);}
function show(el){ if(el) el.classList.remove('hidden'); }
function hide(el){ if(el) el.classList.add('hidden'); }

function adminLogin(){
  var secret = $('adminSecret').value;
  // change allowed admin secrets here (comma separated) or keep single value
  var allowed = ['admin','rj123']; // आप यहाँ अपना admin password जोड़ें
  if(allowed.indexOf(secret) === -1){
    alert('Unauthorized (demo) — wrong admin password');
    hide($('adminNote')); show($('adminPanel')); // keep original behaviour
    return;
  }
  // if ok, show admin panel
  hide($('adminNote'));
  show($('adminPanel'));
  renderPendingWithdraws();
}

function adminAddUser(){
  var name = $('newName').value.trim(); var mobile = $('newMobile').value.trim(); var pass = $('newPass').value||'1234';
  if(!name||!mobile){ alert('Name & mobile required'); return; }
  var users = JSON.parse(localStorage.getItem('rj_users_demo_v1')||'[]');
  if(users.find(u=>u.mobile===mobile)){ alert('Mobile exists'); return; }
  var id = Date.now()+Math.floor(Math.random()*90);
  var activation_code = String(100000+Math.floor(Math.random()*900000));
  users.push({id, name, mobile, password:pass, gender: $('newGender').value, parent_id: $('newParent').value?parseInt($('newParent').value):null, status:'unconfirmed', activation_code, created_at: new Date().toISOString()});
  localStorage.setItem('rj_users_demo_v1', JSON.stringify(users));
  var balances = JSON.parse(localStorage.getItem('rj_balances_demo_v1')||'{}'); balances[id]=0; localStorage.setItem('rj_balances_demo_v1', JSON.stringify(balances));
  $('activationCodeDisplay').textContent = 'Activation code for '+mobile+': '+activation_code;
  alert('Customer created (unconfirmed). Give code to customer.');
}

function renderPendingWithdraws(){
  var w = JSON.parse(localStorage.getItem('rj_withdrawals_demo_v1')||'[]').filter(x=>x.status==='pending');
  var cont = $('pendingWithdraws'); cont.innerHTML='';
  if(w.length===0){ cont.innerHTML='<div class="small">No pending withdrawals</div>'; return; }
  w.forEach(item=>{
    var users = JSON.parse(localStorage.getItem('rj_users_demo_v1')||'[]');
    var user = users.find(u=>u.id==item.user_id) || {name:'Unknown'};
    var div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div><strong>${user.name}</strong> — ₹${item.gross} (net ₹${item.net})</div>
      <div style="margin-top:8px"><button class="btn btn-primary" onclick="markPaid('${item.id}')">Mark Paid</button>
      <button class="btn" onclick="rejectWithdrawal('${item.id}')">Reject</button></div>`;
    cont.appendChild(div);
  });
}

function markPaid(id){
  var arr = JSON.parse(localStorage.getItem('rj_withdrawals_demo_v1')||'[]'); var idx = arr.findIndex(x=>x.id===id); if(idx<0) return;
  arr[idx].status='paid'; arr[idx].paid_at = new Date().toISOString(); localStorage.setItem('rj_withdrawals_demo_v1', JSON.stringify(arr));
  alert('Marked paid');
  renderPendingWithdraws();
}
function rejectWithdrawal(id){
  if(!confirm('Reject & refund?')) return;
  var arr = JSON.parse(localStorage.getItem('rj_withdrawals_demo_v1')||'[]'); var idx = arr.findIndex(x=>x.id===id); if(idx<0) return;
  var it = arr[idx];
  var balances = JSON.parse(localStorage.getItem('rj_balances_demo_v1')||'{}'); balances[it.user_id] = (parseFloat(balances[it.user_id]||0)+parseFloat(it.gross)).toFixed(2); localStorage.setItem('rj_balances_demo_v1', JSON.stringify(balances));
  arr[idx].status='rejected'; localStorage.setItem('rj_withdrawals_demo_v1', JSON.stringify(arr));
  alert('Rejected & refunded');
  renderPendingWithdraws();
}
