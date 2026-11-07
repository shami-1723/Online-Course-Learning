const $ = (s) => document.querySelector(s);
const api = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};
const money = (value) => Number(value || 0) === 0 ? 'Free' : `₹${Number(value).toFixed(2)}`;

function courseCard(c) {
  const letter = (c.title || 'C').trim().charAt(0).toUpperCase();
  return `<article class="course-card"><div class="course-art"><span>${letter}</span><small>LEARNING PATH</small></div>
    <div class="course-info"><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml((c.description || 'Explore this course and begin learning.').slice(0,115))}</p>
    <div class="course-meta"><span>${escapeHtml(c.instructor_name || 'Instructor')}</span><b>${money(c.price)}</b></div>
    <a class="text-link" href="/course-details.html?id=${c.course_id}">View course →</a></div></article>`;
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function loadCourses() {
  const grid = $('#courseGrid');
  if (!grid) return;
  try {
    const courses = await api('/api/courses');
    grid.innerHTML = courses.length ? courses.map(courseCard).join('') : '<div class="empty-state">No courses published yet. Register as an instructor and create the first course from your dashboard.</div>';
  } catch (e) { grid.innerHTML = `<div class="empty-state">${escapeHtml(e.message)} Make sure MySQL is running and the database has been created.</div>`; }
}
async function setupAuth() {
  const login = $('#loginForm'), register = $('#registerForm');
  if (login) login.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('#formMessage'); msg.textContent = 'Signing in...';
    const body = Object.fromEntries(new FormData(login));
    try { await api('/api/auth/login', {method:'POST', body:JSON.stringify(body)}); location.href='/dashboard.html'; }
    catch(err) { msg.textContent = err.message; }
  });
  if (register) register.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('#formMessage'); msg.textContent = 'Creating account...';
    const body = Object.fromEntries(new FormData(register));
    try { await api('/api/auth/register', {method:'POST', body:JSON.stringify(body)}); location.href='/dashboard.html'; }
    catch(err) { msg.textContent = err.message; }
  });
}
async function setupDashboard() {
  if (!$('#welcomeTitle')) return;
  try {
    const {user} = await api('/api/auth/me');
    if (!user) { location.href='/login.html'; return; }
    $('#welcomeTitle').textContent = `Welcome, ${user.name}`;
    if (user.role === 'instructor') { $('#instructorPanel').hidden=false; $('#lessonPanel').hidden=false; }
    const subjectGrid = $('#subjectGrid');
    if (subjectGrid) {
      const available = await api('/api/courses');
      subjectGrid.innerHTML = available.length ? available.slice(0, 3).map(courseCard).join('') : '<div class="empty-state">No subjects are available yet.</div>';
    }
    const courses = await api('/api/enrollments/mine');
    $('#myCourses').innerHTML = courses.length ? courses.map(c => `<div class="enrolled-item"><h3>${escapeHtml(c.title)}</h3><p>${c.progress}% complete · ${escapeHtml(c.status)}</p><div class="bar"><span style="width:${Math.max(0,Math.min(100,c.progress))}%"></span></div><label style="margin-top:10px">Update progress <input type="range" min="0" max="100" value="${c.progress}" data-enrollment="${c.enrollment_id}"></label></div>`).join('') : '<div class="empty-state">You have not enrolled in any courses yet. Explore courses to get started.</div>';
    document.querySelectorAll('[data-enrollment]').forEach(input => input.addEventListener('change', async () => {
      try { await api(`/api/enrollments/${input.dataset.enrollment}/progress`, {method:'PATCH',body:JSON.stringify({progress:input.value})}); input.previousElementSibling.textContent=`${input.value}%`; }
      catch(e) { alert(e.message); }
    }));
  } catch(e) { $('#myCourses').textContent=e.message; }
  $('#logoutBtn')?.addEventListener('click', async () => { await api('/api/auth/logout',{method:'POST'}); location.href='/'; });
  $('#courseForm')?.addEventListener('submit', async e => {
    e.preventDefault(); const msg=$('#courseMessage'); const body=Object.fromEntries(new FormData(e.currentTarget));
    try { await api('/api/courses',{method:'POST',body:JSON.stringify(body)}); msg.textContent='Course published successfully.'; e.currentTarget.reset(); }
    catch(err) { msg.textContent=err.message; }
  });
  $('#lessonForm')?.addEventListener('submit', async e => {
    e.preventDefault(); const msg=$('#lessonMessage'); const body=Object.fromEntries(new FormData(e.currentTarget));
    try { await api('/api/lessons',{method:'POST',body:JSON.stringify(body)}); msg.textContent='Lesson added successfully.'; e.currentTarget.reset(); }
    catch(err) { msg.textContent=err.message; }
  });
}
async function setupCourseDetails() {
  const target=$('#courseDetails'); if(!target) return;
  const id=new URLSearchParams(location.search).get('id');
  if(!id) { target.textContent='No course selected.'; return; }
  try {
    const c=await api(`/api/courses/${id}`);
    target.innerHTML=`<div class="course-detail-box"><div class="eyebrow">COURSE OVERVIEW</div><h1>${escapeHtml(c.title)}</h1><p>${escapeHtml(c.description || 'No description available.')}</p><p><strong>Instructor:</strong> ${escapeHtml(c.instructor_name)} &nbsp; <strong>Price:</strong> ${money(c.price)} &nbsp; <strong>Duration:</strong> ${c.duration} days</p><button class="btn" id="enrollBtn">Enrol in this course →</button><h2 style="margin-top:35px">Course lessons</h2><div id="lessonList">Loading lessons...</div></div>`;
    $('#enrollBtn').addEventListener('click', async () => {
      try { await api('/api/enrollments',{method:'POST',body:JSON.stringify({course_id:id})}); alert('You are enrolled! Open your dashboard to track progress.'); }
      catch(e) { alert(e.message); if(e.message.includes('log in')) location.href='/login.html'; }
    });
    const lessons=await api(`/api/lessons/course/${id}`);
    $('#lessonList').innerHTML=lessons.length?lessons.map(l=>`<div class="lesson-row"><h3>${l.sequence_no}. ${escapeHtml(l.lesson_title)}</h3><p>${escapeHtml(l.content || '')}</p>${l.video_url?`<a class="text-link" target="_blank" rel="noopener" href="${escapeHtml(l.video_url)}">Open lesson video ↗</a>`:''}</div>`).join(''):'<div class="empty-state">No lessons have been added to this course yet.</div>';
  } catch(e) { target.textContent=e.message; }
}
document.addEventListener('DOMContentLoaded', () => { loadCourses(); setupAuth(); setupDashboard(); setupCourseDetails(); });
