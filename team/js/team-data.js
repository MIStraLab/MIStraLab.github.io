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

    const key = match[1];
    const inlineValue = match[2].trim();

    // Supports YAML-like list values:
    // research:
    // - item 1
    // - item 2
    if (!inlineValue) {
      const items = [];
      let j = i + 1;
      while (j < lines.length) {
        const itemMatch = lines[j].match(/^\s*-\s+(.+)$/);
        if (!itemMatch) {
          break;
        }
        items.push(itemMatch[1].trim());
        j += 1;
      }

      if (items.length > 0) {
        meta[key] = items.join(" | ");
        i = j - 1;
        bodyStartIndex = j;
        continue;
      }
    }

    meta[key] = inlineValue;
    bodyStartIndex = i + 1;
  }

  return { meta, bodyStartIndex };
}

function splitPipeValue(value) {
  if (!value) {
    return [];
  }
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "yes" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "no" || normalized === "0") {
    return false;
  }
  return fallback;
}

function splitGroupList(value) {
  if (!value) {
    return [];
  }
  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCommaList(value) {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePets(value) {
  return splitPipeValue(value).map((item) => {
    const [src, caption] = item.split("::");
    return {
      src: (src || "").trim(),
      caption: (caption || "").trim(),
    };
  }).filter((pet) => pet.src);
}

function parseEducation(value) {
  return splitPipeValue(value).map((item) => {
    const [degree, university] = item.split("@");
    return {
      degree: (degree || "").trim(),
      university: (university || "").trim(),
    };
  }).filter((entry) => entry.degree);
}

function defaultTenureByGroup(group) {
  const map = {
    pi: "Principal Investigator",
    phd: "PhD Student",
    master: "MSc Student",
    phd_alumni: "PhD Alumni",
    msc_alumni: "MSc Alumni",
  };
  return map[group] || "";
}

function parseTeamData(markdownText) {
  const normalized = markdownText.replace(/\r/g, "");
  const sections = normalized.split(/\n##\s+/);
  const members = [];

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
      const groups = splitGroupList(meta.group || meta.groups || "");
      if (!slug || !meta.name || !groups.length || !meta.image) {
        continue;
      }

      const hasDetailPage = parseBoolean(meta.page || meta.has_detail_page, true);
      const primaryGroup = groups[0];
      const tenure = (meta.tenure || "").trim() || defaultTenureByGroup(primaryGroup);
      members.push({
        slug,
        groups,
        primaryGroup,
        hasDetailPage,
        detailPath: hasDetailPage ? `/team/member.html?slug=${encodeURIComponent(slug)}` : "",
        name: meta.name,
        image: meta.image,
        tenure,
        email: meta.email || "",
        linkedin: meta.linkedin || "",
        github: meta.github || "",
        website: meta.website || "",
        orcid: meta.orcid || "",
        scholar: meta.scholar || "",
        bio: meta.bio || "",
        research: splitPipeValue(meta.research),
        education: parseEducation(meta.education),
        conferences: splitPipeValue(meta.conferences),
        publications: splitPipeValue(meta.publications),
        petTitle: meta.pet_title || "",
        pets: parsePets(meta.pets),
        alumniYears: splitCommaList(meta.alumni_year),
        mscThesis: (meta.msc_thesis || "").trim(),
        phdThesis: (meta.phd_thesis || "").trim(),
      });
      continue;
    }
  }

  const alumni = [];
  for (const member of members) {
    const alumniGroups = member.groups.filter((group) => group.endsWith("_alumni"));
    for (const [index, group] of alumniGroups.entries()) {
      const year = member.alumniYears[index] || "";
      if (group === "msc_alumni" && member.mscThesis) {
        alumni.push({
          slug: member.slug,
          name: member.name,
          profile: member.hasDetailPage ? member.detailPath : "",
          degree: "M.Sc.",
          year,
          thesis: member.mscThesis,
        });
      }
      if (group === "phd_alumni" && member.phdThesis) {
        alumni.push({
          slug: member.slug,
          name: member.name,
          profile: member.hasDetailPage ? member.detailPath : "",
          degree: "Ph.D.",
          year,
          thesis: member.phdThesis,
        });
      }
    }
  }

  alumni.sort((a, b) => Number.parseInt(b.year || "0", 10) - Number.parseInt(a.year || "0", 10));

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
