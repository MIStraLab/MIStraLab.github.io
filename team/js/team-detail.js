import { loadTeamData } from "/team/js/team-data.js";

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iconLink(href, title, iconClass) {
  if (!href) {
    return "";
  }
  return `<a href="${href}" target="_blank" title="${title}" aria-label="${title}"><i class="${iconClass}"></i></a>`;
}

function mailLink(email) {
  if (!email) {
    return "";
  }
  return `<a href="mailto:${email}" title="Email" aria-label="Email"><i class="fas fa-envelope"></i></a>`;
}

function renderList(items) {
  if (!items || !items.length) {
    return "<li>-</li>";
  }
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderEducation(items) {
  if (!items || !items.length) {
    return "<li>-</li>";
  }
  return items
    .map((item) => {
      const line = item.university
        ? `${escapeHtml(item.degree)} - ${escapeHtml(item.university)}`
        : escapeHtml(item.degree);
      return `<li>${line}</li>`;
    })
    .join("");
}

function renderPetSection(member) {
  if (!member.pets.length) {
    return "";
  }

  const title = member.petTitle || "Pet Photos";
  return `
    <div class="section pet-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="pet-grid">
        ${member.pets
          .map(
            (pet) => `
            <figure>
              <img src="${pet.src}" alt="${escapeHtml(member.name)} pet photo">
              ${pet.caption ? `<figcaption>${escapeHtml(pet.caption)}</figcaption>` : ""}
            </figure>
          `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderPublications(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderTheses(member) {
  const items = [];
  if (member.mscThesis) {
    items.push(`<li><strong>M.Sc. Thesis:</strong> ${escapeHtml(member.mscThesis)}</li>`);
  }
  if (member.phdThesis) {
    items.push(`<li><strong>Ph.D. Thesis:</strong> ${escapeHtml(member.phdThesis)}</li>`);
  }
  if (!items.length) {
    return "";
  }

  return `
    <div class="detail-block">
      <h3>Theses</h3>
      <ul class="plain-list">${items.join("")}</ul>
    </div>
  `;
}

async function loadOrcidPublications(orcidUrl) {
  const orcidId = orcidUrl.split("/").pop();
  const endpoint = `https://pub.orcid.org/v3.0/${orcidId}/works`;
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("ORCID API request failed");
  }

  const data = await response.json();
  if (!data.group || !data.group.length) {
    return [];
  }

  return data.group.slice(0, 5).map((group) => {
    const summary = group["work-summary"][0];
    const title = summary?.title?.title?.value || "Untitled";
    const journal = summary?.["journal-title"]?.value || "";
    const year = summary?.["publication-date"]?.year?.value || "";

    let doiLink = "";
    const externalIds = summary?.["external-ids"]?.["external-id"] || [];
    const doiObj = externalIds.find((id) => id["external-id-type"] === "doi");
    if (doiObj) {
      doiLink = `https://doi.org/${doiObj["external-id-value"]}`;
    }

    const metaParts = [];
    if (journal) {
      metaParts.push(journal);
    }
    if (year) {
      metaParts.push(year);
    }

    return {
      title,
      meta: metaParts.join(", "),
      link: doiLink,
    };
  });
}

function renderOrcidPublications(list) {
  if (!list.length) {
    return "<li>No public works found on ORCID.</li>";
  }

  return list
    .map((pub) => {
      const title = escapeHtml(pub.title);
      const meta = escapeHtml(pub.meta);
      const titleHtml = pub.link
        ? `<a href="${pub.link}" target="_blank">${title}</a>`
        : title;
      return `<li>${titleHtml}${meta ? ` - ${meta}` : ""}</li>`;
    })
    .join("");
}

function renderMember(member) {
  const root = document.getElementById("member-root");
  const conferences = member.conferences.filter((item) => item && item !== "-");
  const publications = member.publications.filter((item) => item && item !== "-");
  const conferencesBlock = conferences.length
    ? `
      <div class="detail-block">
        <h3>Conferences</h3>
        <ul class="plain-list">${renderList(conferences)}</ul>
      </div>
    `
    : "";
  const publicationsBlock = publications.length
    ? `
      <div class="detail-block">
        <h3>Publications</h3>
        <ul class="plain-list" id="publications-list">${renderPublications(publications)}</ul>
      </div>
    `
      : (member.orcid
      ? '<div class="detail-block"><h3>Publications</h3><ul class="plain-list" id="publications-list"></ul></div>'
      : "");
  const thesesBlock = renderTheses(member);

  root.innerHTML = `
    <div class="section">
      <div class="profile">
        <img src="${member.image}" alt="${escapeHtml(member.name)}">
        <div class="details">
          <h2>${escapeHtml(member.name)}</h2>
          <p class="tenure">${escapeHtml(member.tenure)}</p>
          <div class="icons">
            ${mailLink(member.email)}
            ${iconLink(member.website, "Personal Website", "fas fa-globe")}
            ${iconLink(member.orcid, "ORCID", "fa-brands fa-orcid")}
            ${iconLink(member.scholar, "Google Scholar", "fas fa-graduation-cap")}
            ${iconLink(member.linkedin, "LinkedIn", "fab fa-linkedin")}
            ${iconLink(member.github, "GitHub", "fab fa-github")}
          </div>
          ${member.bio ? `<p>${escapeHtml(member.bio)}</p>` : ""}
          <div class="info-grid">
            <div class="info-block">
              <h3>Research Area</h3>
              <ul class="plain-list">${renderList(member.research)}</ul>
            </div>
            <div class="info-block">
              <h3>Education</h3>
              <ul class="plain-list">${renderEducation(member.education)}</ul>
            </div>
          </div>
        </div>
      </div>

      ${conferencesBlock}
      ${thesesBlock}
      ${publicationsBlock}
    </div>
    ${renderPetSection(member)}
  `;
}

function renderNotFound() {
  const root = document.getElementById("member-root");
  root.innerHTML = `
    <div class="section">
      <h2>Member Not Found</h2>
      <p>The requested team member could not be found.</p>
      <p><a href="/team/">Back to Team</a></p>
    </div>
  `;
}

function renderNoDetail(member) {
  const root = document.getElementById("member-root");
  root.innerHTML = `
    <div class="section">
      <h2>${escapeHtml(member.name)}</h2>
      <p>An individual detail page is not available for this person yet.</p>
      <p><a href="/team/">Back to Team</a></p>
    </div>
  `;
}

async function maybeLoadOrcid(member) {
  if (!member.orcid) {
    return;
  }
  if (member.publications.length > 0 && member.publications[0].toLowerCase() !== "will be added") {
    return;
  }

  const listElement = document.getElementById("publications-list");
  if (!listElement) {
    return;
  }

  listElement.innerHTML = "<li>Loading publications from ORCID...</li>";
  try {
    const publications = await loadOrcidPublications(member.orcid);
    listElement.innerHTML = renderOrcidPublications(publications);
  } catch (error) {
    console.error(error);
    const scholarLink = member.scholar ? ` <a href="${member.scholar}" target="_blank">View on Google Scholar</a>` : "";
    listElement.innerHTML = `<li>Could not load ORCID publications.${scholarLink}</li>`;
  }
}

async function initMemberDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    renderNotFound();
    return;
  }

  try {
    const { members } = await loadTeamData();
    const member = members.find((item) => item.slug === slug);
    if (!member) {
      renderNotFound();
      return;
    }
    if (!member.hasDetailPage) {
      renderNoDetail(member);
      return;
    }

    renderMember(member);
    await maybeLoadOrcid(member);
  } catch (error) {
    console.error(error);
    renderNotFound();
  }
}

initMemberDetail();
