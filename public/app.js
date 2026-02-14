const BACKEND_URL = "https://creativos-panel-backend-production.up.railway.app";

function login() {
  window.location.href = `${BACKEND_URL}/auth/login`;
}

// Navegación entre secciones
const links = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".section");

links.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("data-section");

    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    sections.forEach(sec => sec.classList.remove("visible"));
    document.getElementById(`section-${target}`).classList.add("visible");
  });
});

// Glow que sigue al ratón
const glow = document.getElementById("mouse-glow");
document.addEventListener("mousemove", (e) => {
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

// Simulación de roles (por ahora)
function getRoleFromUser(user) {
  const lastDigit = parseInt(user.id.slice(-1), 10);
  return lastDigit % 2 === 0 ? "admin" : "user";
}

// Dummy data
const staff = [
  { name: "Matteo", role: "admin", active: true },
  { name: "Carlos", role: "mod", active: true },
  { name: "Lucía", role: "mod", active: false },
  { name: "Ana", role: "admin", active: true }
];

const bans = [
  { name: "UsuarioTóxico1", reason: "Toxicidad" },
  { name: "Spammer", reason: "Spam" }
];

const serverUpdates = [
  { title: "Actualización de normas", body: "Se han actualizado las normas de rol." },
  { title: "Nuevo sistema de tickets", body: "Ahora el soporte se gestiona por tickets." }
];

// Guardar usuario en localStorage (registro simple)
function saveUserLocal(user, role) {
  localStorage.setItem("creativos_user", JSON.stringify({ ...user, role }));
}

function loadUserLocal() {
  const raw = localStorage.getItem("creativos_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Cargar usuario
async function getUser() {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      credentials: "include"
    });

    const data = await res.json();

    const userCard = document.getElementById("user-card");
    const noUser = document.getElementById("no-user");
    const adminSection = document.getElementById("section-admin");
    const botAdminControls = document.getElementById("bot-admin-controls");
    const serverEdit = document.getElementById("server-edit");
    const btnVolver = document.getElementById("btn-volver");

    if (data.id) {
      const role = getRoleFromUser(data);

      // Registro simple
      saveUserLocal(data, role);

      userCard.classList.remove("hidden");
      noUser.style.display = "none";

      document.getElementById("username").textContent = data.username;
      document.getElementById("userid").textContent = "ID: " + data.id;
      document.getElementById("role").textContent = "Rol: " + role.toUpperCase();
      document.getElementById("avatar").src =
        `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

      document.getElementById("server-info").textContent =
        "Servidor: Creativos RP";
      document.getElementById("time-info").textContent =
        "Tiempo en el servidor: 6 meses (simulado)";

      // Botón volver al inicio
      btnVolver.classList.remove("hidden");
      btnVolver.addEventListener("click", () => {
        sections.forEach(sec => sec.classList.remove("visible"));
        document.getElementById("section-inicio").classList.add("visible");
        links.forEach(l => l.classList.remove("active"));
        document.querySelector('[data-section="inicio"]').classList.add("active");
      });

      // Mostrar/ocultar admin
      if (role === "admin") {
        adminSection.style.display = "block";
        botAdminControls.classList.remove("hidden");
        serverEdit.classList.remove("hidden");
      } else {
        adminSection.style.display = "none";
        botAdminControls.classList.add("hidden");
        serverEdit.classList.add("hidden");
      }
    } else {
      // Si no hay sesión, intentar cargar local
      const localUser = loadUserLocal();
      if (localUser) {
        const role = localUser.role;
        userCard.classList.remove("hidden");
        noUser.style.display = "none";

        document.getElementById("username").textContent = localUser.username;
        document.getElementById("userid").textContent = "ID: " + localUser.id;
        document.getElementById("role").textContent = "Rol: " + role.toUpperCase();
        document.getElementById("avatar").src =
          `https://cdn.discordapp.com/avatars/${localUser.id}/${localUser.avatar}.png`;

        document.getElementById("server-info").textContent =
          "Servidor: Creativos RP";
        document.getElementById("time-info").textContent =
          "Tiempo en el servidor: 6 meses (simulado)";
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// Gráfico principal de estadísticas
function initChart() {
  const ctx = document.getElementById("statsChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      datasets: [{
        label: "Actividad",
        data: [3, 5, 2, 8, 7, 9, 4],
        borderColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--primary-color").trim() || "#5865F2",
        backgroundColor: "rgba(88,101,242,0.3)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } }
      }
    }
  });
}

// AJUSTES: Tema oscuro/claro
const toggleThemeBtn = document.getElementById("toggle-theme");
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-theme") ? "light" : "dark"
    );
  });
}

// Cargar tema guardado
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-theme");
}

// Cambiar color principal
const colorPicker = document.getElementById("primary-color-picker");
if (colorPicker) {
  colorPicker.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--primary-color", e.target.value);
    localStorage.setItem("primary-color", e.target.value);
  });
}

// Cargar color guardado
if (localStorage.getItem("primary-color")) {
  document.documentElement.style.setProperty(
    "--primary-color",
    localStorage.getItem("primary-color")
  );
}

// SISTEMA DE USUARIOS (simulado)
const dummyUsers = [
  { id: 1, name: "Matteo", role: "admin", active: true },
  { id: 2, name: "Carlos", role: "mod", active: true },
  { id: 3, name: "Lucía", role: "mod", active: false },
  { id: 4, name: "Ana", role: "admin", active: true }
];

function renderUsers(list) {
  const container = document.getElementById("user-list");
  if (!container) return;
  container.innerHTML = "";
  list.forEach(u => {
    const card = document.createElement("div");
    card.className = "user-card-small";
    card.innerHTML = `
      <h4>${u.name}</h4>
      <p>${u.role.toUpperCase()}</p>
      <p>${u.active ? "Activo" : "Inactivo"}</p>
    `;
    container.appendChild(card);
  });
}

renderUsers(dummyUsers);

const userSearch = document.getElementById("user-search");
if (userSearch) {
  userSearch.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = dummyUsers.filter(u => u.name.toLowerCase().includes(term));
    renderUsers(filtered);
  });
}

const filterButtons = document.querySelectorAll(".filter-btn");
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");

    let list = dummyUsers;
    if (filter === "admin") list = dummyUsers.filter(u => u.role === "admin");
    if (filter === "mod") list = dummyUsers.filter(u => u.role === "mod");
    if (filter === "staff") list = dummyUsers.filter(u => u.active);

    renderUsers(list);
  });
});

// BOT DASHBOARD
const botStatus = document.getElementById("bot-status");
if (botStatus) {
  botStatus.textContent = "Estado del bot: Online";
}

const botChartCanvas = document.getElementById("botChart");
if (botChartCanvas) {
  new Chart(botChartCanvas, {
    type: "bar",
    data: {
      labels: ["Comando1", "Comando2", "Comando3"],
      datasets: [{
        label: "Uso de comandos",
        data: [12, 19, 7],
        backgroundColor: "rgba(88,101,242,0.5)"
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
      scales: {
        x: { ticks: { color: "#ccc" } },
        y: { ticks: { color: "#ccc" } }
      }
    }
  });
}

// ADMIN: activity staff, bans, system status
function renderAdminStuff() {
  const staffActivity = document.getElementById("staff-activity");
  const banList = document.getElementById("ban-list");
  const systemStatus = document.getElementById("system-status");
  const adminList = document.getElementById("admin-list");

  if (staffActivity) {
    staffActivity.innerHTML = "";
    staff.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `${s.name} (${s.role}) - ${s.active ? "Activo" : "Inactivo"}`;
      staffActivity.appendChild(li);
    });
  }

  if (banList) {
    banList.innerHTML = "";
    bans.forEach(b => {
      const li = document.createElement("li");
      li.textContent = `${b.name} - ${b.reason}`;
      banList.appendChild(li);
    });
  }

  if (systemStatus) {
    systemStatus.innerHTML = "";
    ["Bot Online", "Base de datos OK", "Panel operativo"].forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      systemStatus.appendChild(li);
    });
  }

  if (adminList) {
    adminList.innerHTML = "";
    staff.filter(s => s.role === "admin").forEach(a => {
      const li = document.createElement("li");
      li.textContent = a.name;
      adminList.appendChild(li);
    });
  }
}

// SERVIDOR: updates
function renderServerUpdates() {
  const container = document.getElementById("server-updates");
  if (!container) return;
  container.innerHTML = "";
  serverUpdates.forEach(u => {
    const card = document.createElement("div");
    card.className = "server-update-card";
    card.innerHTML = `<h4>${u.title}</h4><p>${u.body}</p>`;
    container.appendChild(card);
  });
}

const addUpdateBtn = document.getElementById("add-update-btn");
if (addUpdateBtn) {
  addUpdateBtn.addEventListener("click", () => {
    const title = document.getElementById("update-title").value.trim();
    const body = document.getElementById("update-body").value.trim();
    if (!title || !body) return;
    serverUpdates.push({ title, body });
    document.getElementById("update-title").value = "";
    document.getElementById("update-body").value = "";
    renderServerUpdates();
  });
}

// Panel inteligente: valores simples
document.getElementById("kpi-actividad").textContent = "Alta";
document.getElementById("kpi-comandos").textContent = "38";
document.getElementById("kpi-servidores").textContent = "1";

getUser();
initChart();
renderAdminStuff();
renderServerUpdates();


