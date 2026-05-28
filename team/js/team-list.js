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
  const imageHtml = member.hasDetailPage
    ? `<a href="${member.detailPath}"><img src="${member.image}" alt="${escapeHtml(member.name)}"></a>`
    : `<img src="${member.image}" alt="${escapeHtml(member.name)}">`;

  const nameHtml = member.hasDetailPage
    ? `<a href="${member.detailPath}">${escapeHtml(member.name)}</a>`
    : escapeHtml(member.name);

  return `
    <div class="member-card">
      ${imageHtml}
      <h4>${nameHtml}</h4>
      <div class="card-icons">
        ${mailLink(member.email)}
        ${iconLink(member.orcid, "ORCID", "fa-brands fa-orcid")}
        ${iconLink(member.scholar, "Google Scholar", "fas fa-graduation-cap")}
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

function sortMembersByName(members) {
  return [...members].sort((a, b) =>
    a.name.localeCompare(b.name, "tr", { sensitivity: "base" }),
  );
}

async function initTeamList() {
  try {
    const { members, alumni } = await loadTeamData();
    const pi = sortMembersByName(members.filter((member) => member.primaryGroup === "pi"));
    const phd = sortMembersByName(members.filter((member) => member.primaryGroup === "phd"));
    const master = sortMembersByName(members.filter((member) => member.primaryGroup === "master"));

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
