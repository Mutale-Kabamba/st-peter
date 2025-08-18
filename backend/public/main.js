let token = '';
const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const addYouthForm = document.getElementById('add-youth-form');
const youthTableBody = document.querySelector('#youth-table tbody');
const statsDiv = document.getElementById('stats');
const logoutBtn = document.getElementById('logout');

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
    loadYouth();
    loadStats();
  } else {
    alert('Login failed');
  }
};

logoutBtn.onclick = () => {
  token = '';
  loginForm.style.display = 'block';
  dashboard.style.display = 'none';
};

addYouthForm.onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(addYouthForm);
  const youth = Object.fromEntries(formData.entries());
  youth.active = 1;
  await fetch('/api/youth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(youth)
  });
  addYouthForm.reset();
  loadYouth();
  loadStats();
};

async function loadYouth() {
  const res = await fetch('/api/youth', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  youthTableBody.innerHTML = '';
  data.forEach(youth => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${youth.name}</td>
      <td>${youth.position}</td>
      <td>${youth.scc}</td>
      <td>${youth.phone}</td>
      <td>${youth.dob}</td>
      <td>${youth.occupation}</td>
      <td>${youth.address}</td>
      <td>${youth.active ? 'Yes' : 'No'}</td>
      <td>
        <button onclick="editYouth(${youth.id})">Edit</button>
        <button onclick="deleteYouth(${youth.id})">Delete</button>
      </td>
    `;
    youthTableBody.appendChild(tr);
  });
}

window.editYouth = async (id) => {
  const youth = prompt('Enter updated details as JSON');
  if (youth) {
    await fetch('/api/youth/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: youth
    });
    loadYouth();
    loadStats();
  }
};

window.deleteYouth = async (id) => {
  if (confirm('Delete this youth?')) {
    await fetch('/api/youth/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    loadYouth();
    loadStats();
  }
};

async function loadStats() {
  const res = await fetch('/api/youth/stats', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  statsDiv.innerHTML = `<b>Active Youth:</b> ${data.activeCount}<br><b>SCC Breakdown:</b><br>` +
    data.sccBreakdown.map(scc => `${scc.scc}: ${scc.count}`).join('<br>');
}
