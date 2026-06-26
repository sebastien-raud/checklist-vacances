const API = 'http://localhost/dev/todolist-vacances/backend/index.php';

let currentVoyageId = null;
let checklistMd = null;

const viewLogin = document.getElementById('view-login');
const viewList = document.getElementById('view-list');
const viewVoyage = document.getElementById('view-voyage');
const formLogin = document.getElementById('form-login');
const loginError = document.getElementById('login-error');
const voyagesList = document.getElementById('voyages-list');
const surveyContainer = document.getElementById('survey-container');
let   survey;
const voyageName = document.getElementById('voyage-name');
const btnDelete = document.getElementById('btn-delete');

// ---- Init ----

document.addEventListener('DOMContentLoaded', async () => {
    checklistMd = await fetchChecklist();
    //setupSurveySubmit();
    setupEvents();

    const token = localStorage.getItem('token');
    if (token) {
        try {
            await apiGet('/voyages');
            await showList();
        } catch {
            localStorage.removeItem('token');
            showView(viewLogin);
        }
    } else {
        showView(viewLogin);
    }
});

// ---- Vues ----

function showView(view) {
    [viewLogin, viewList, viewVoyage].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');
}

async function showList() {
    showView(viewList);
    const voyages = await apiGet('/voyages');
    renderVoyagesList(voyages);
}

function renderVoyagesList(voyages) {
    voyagesList.innerHTML = '';
    if (!voyages.length) {
        voyagesList.innerHTML = '<p class="empty-msg">Aucun voyage. Créez-en un !</p>';
        return;
    }
    voyages.forEach(v => {
        const item = document.createElement('div');
        item.className = 'voyage-item';
        item.innerHTML = `<span class="voyage-item-name">${escapeHtml(v.name || 'Sans nom')}</span>`;
        item.addEventListener('click', () => openVoyage(v.id));
        voyagesList.appendChild(item);
    });
}

// ---- Auth ----

function authHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    };
}

async function apiGet(path) {
    const resp = await fetch(API + path, { headers: authHeaders() });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

async function apiPost(path, body) {
    const resp = await fetch(API + path, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

async function apiPut(path, body) {
    const resp = await fetch(API + path, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

async function apiDelete(path) {
    const resp = await fetch(API + path, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

// ---- Voyage ----

async function openVoyage(id) {
    const voyage = await apiGet(`/voyages/${id}`);
    currentVoyageId = id;
    voyageName.value = voyage.name || '';
    btnDelete.classList.remove('hidden');
    showView(viewVoyage);
    createSurvey();
    if (voyage.data) {
        populateSurvey(voyage.data);
    }
}

function newVoyage() {
    currentVoyageId = null;
    voyageName.value = '';
    btnDelete.classList.add('hidden');
    showView(viewVoyage);
    createSurvey();    
}

function createSurvey() {
    if (survey) {
        survey.remove();
    }
    survey = document.createElement('survey-markdown');
    surveyContainer.textContent = '';
    surveyContainer.append(survey);
    survey.setMarkdown(checklistMd);
    setupSurveySubmit();
}

// ---- Survey ----

async function fetchChecklist() {
    const resp = await fetch('./data/checklist.md');
    return resp.text();
}

function setupSurveySubmit() {
    survey.addEventListener('submit', async () => {
        const userData = survey.getJSON();
        const name = voyageName.value.trim() || 'Sans nom';
        const body = { name, data: userData };

        try {
            if (currentVoyageId) {
                await apiPut(`/voyages/${currentVoyageId}`, body);
            } else {
                const created = await apiPost('/voyages', body);
                currentVoyageId = created.id;
            }
        } catch (err) {
            console.error('Erreur lors de la sauvegarde :', err);
        }

        setTimeout(() => showList(), 1500);
    });
}

function populateSurvey(userData) {
    if (!userData || !Array.isArray(userData.answers)) return;

    userData.answers.forEach(answer => {
        Object.entries(answer).forEach(([name, value]) => {
            if (name.startsWith('checkbox-group')) {
                const values = Array.isArray(value) ? value.map(String) : [String(value)];
                survey.querySelectorAll(`input[name="${name}[]"]`).forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });
            } else if (name.startsWith('checkbox-')) {
                survey.querySelector(`input[name="${name}"]`).checked = "checked";
            } else if (name.startsWith('radio-group') || name.startsWith('radio-')) {
                survey.querySelectorAll(`input[name="${name}"]`).forEach(r => {
                    r.checked = String(r.value) === String(value);
                });
            } else if (name.startsWith('select-')) {
                const sel = survey.querySelector(`select[name="${name}"]`);
                if (sel) sel.value = value;
            } else {
                const el = survey.querySelector(`[name="${name}"]`);
                if (el) el.value = value;
            }
        });
    });
}

// ---- Événements ----

function setupEvents() {
    formLogin.addEventListener('submit', async e => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const login = document.getElementById('input-login').value;
        const password = document.getElementById('input-password').value;

        try {
            const resp = await fetch(API + '/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
            });
            if (!resp.ok) throw new Error();
            const data = await resp.json();
            localStorage.setItem('token', data.token);
            await showList();
        } catch {
            loginError.textContent = 'Identifiants incorrects.';
            loginError.classList.remove('hidden');
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        showView(viewLogin);
    });

    document.getElementById('btn-new-voyage').addEventListener('click', newVoyage);

    document.getElementById('btn-back').addEventListener('click', () => showList());

    btnDelete.addEventListener('click', async () => {
        if (!currentVoyageId) return;
        if (!confirm('Supprimer ce voyage ?')) return;
        try {
            await apiDelete(`/voyages/${currentVoyageId}`);
        } catch (err) {
            console.error('Erreur lors de la suppression :', err);
        }
        await showList();
    });
}

// ---- Utilitaires ----

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
