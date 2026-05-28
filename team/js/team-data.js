function parseMetadata(lines) {
  const meta = {};
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      bodyStartIndex = i + 1;
      break;
    }

    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!match) {
      break;
    }

    meta[match[1]] = match[2].trim();
    bodyStartIndex = i + 1;
  }

  return { meta, bodyStartIndex };
}

function splitValue(value) {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePets(value) {
  return splitValue(value).map((item) => {
    const [src, caption] = item.split("::");
    return {
      src: (src || "").trim(),
      caption: (caption || "").trim(),
    };
  }).filter((pet) => pet.src);
}

function parseEducation(value) {
  return splitValue(value).map((item) => {
    const [degree, university] = item.split("@");
    return {
      degree: (degree || "").trim(),
      university: (university || "").trim(),
    };
  }).filter((entry) => entry.degree);
}

function parseTeamData(markdownText) {
  const normalized = markdownText.replace(/\r/g, "");
  const sections = normalized.split(/\n##\s+/);
  const members = [];
  const alumni = [];

  for (const [index, section] of sections.entries()) {
    if (index === 0) {
      continue;
    }

    const firstLineEnd = section.indexOf("\n");
    if (firstLineEnd < 0) {
      continue;
    }

    const header = section.slice(0, firstLineEnd).trim();
    const rest = section.slice(firstLineEnd + 1);
    const lines = rest.split("\n");
    const { meta } = parseMetadata(lines);

    if (header.startsWith("member:")) {
      const slug = header.slice("member:".length).trim();
      if (!slug || !meta.name || !meta.group || !meta.image) {
        continue;
      }
      members.push({
        slug,
        group: meta.group,
        name: meta.name,
        image: meta.image,
        tenure: meta.tenure || "",
        email: meta.email || "",
        linkedin: meta.linkedin || "",
        github: meta.github || "",
        website: meta.website || "",
        orcid: meta.orcid || "",
        scholar: meta.scholar || "",
        bio: meta.bio || "",
        research: splitValue(meta.research),
        education: parseEducation(meta.education),
        conferences: splitValue(meta.conferences),
        publications: splitValue(meta.publications),
        petTitle: meta.pet_title || "",
        pets: parsePets(meta.pets),
      });
      continue;
    }

    if (header.startsWith("alumni:")) {
      const slug = header.slice("alumni:".length).trim();
      if (!slug || !meta.name || !meta.degree || !meta.year || !meta.thesis) {
        continue;
      }
      alumni.push({
        slug,
        name: meta.name,
        profile: meta.profile || "",
        degree: meta.degree,
        year: meta.year,
        thesis: meta.thesis,
      });
    }
  }

  return { members, alumni };
}

export async function loadTeamData() {
  const response = await fetch("/team/members.md");
  if (!response.ok) {
    throw new Error("Could not load /team/members.md");
  }
  const markdownText = await response.text();
  return parseTeamData(markdownText);
}
