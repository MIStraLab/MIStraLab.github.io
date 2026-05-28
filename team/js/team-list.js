import { loadTeamData } from "/team/js/team-data.js";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iconLink(href, title, iconClass) {
  if (!href) {
    return "";
  }
  return `<a href="${href}" target="_blank" title="${title}"><i class="${iconClass}"></i></a>`;
}

function mailLink(email) {
  if (!email) {
    return "";
  }
  return `<a href="mailto:${email}" title="Email"><i class="fas fa-envelope"></i></a>`;
}

function memberCard(member) {
  return `
    <div class="member-card">
      <a href="/team/member.html?slug=${encodeURIComponent(member.slug)}"><img src="${member.image}" alt="${escapeHtml(member.name)}"></a>
      <h4><a href="/team/member.html?slug=${encodeURIComponent(member.slug)}">${escapeHtml(member.name)}</a></h4>
      <div class="card-icons">
        ${mailLink(member.email)}
        ${iconLink(member.linkedin, "LinkedIn", "fab fa-linkedin")}
        ${iconLink(member.github, "GitHub", "fab fa-github")}
        ${iconLink(member.website, "Website", "fas fa-globe")}
      </div>
    </div>
  `;
}

function renderMemberGroup(containerId, members) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.innerHTML = members.map(memberCard).join("");
}

function renderAlumniRows(alumni) {
  const tbody = document.getElementById("alumni-body");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = alumni
    .map((item) => {
      const nameCell = item.profile
        ? `<a href="${item.profile}">${escapeHtml(item.name)}</a>`
        : escapeHtml(item.name);

      return `
        <tr>
          <td>${nameCell}</td>
          <td>${escapeHtml(item.degree)}</td>
          <td>${escapeHtml(item.year)}</td>
          <td>${escapeHtml(item.thesis)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderError(message) {
  const section = document.getElementById("team-section");
  if (section) {
    section.innerHTML = `<p>${escapeHtml(message)}</p>`;
  }
}

async function initTeamList() {
  try {
    const { members, alumni } = await loadTeamData();
    const pi = members.filter((member) => member.group === "pi");
    const phd = members.filter((member) => member.group === "phd");
    const master = members.filter((member) => member.group === "master");

    renderMemberGroup("pi-grid", pi);
    renderMemberGroup("phd-grid", phd);
    renderMemberGroup("master-grid", master);
    renderAlumniRows(alumni);
  } catch (error) {
    console.error(error);
    renderError("Team data could not be loaded.");
  }
}

initTeamList();
