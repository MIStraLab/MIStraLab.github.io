function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function isTableSeparator(line) {
  return /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(line.trim());
}

function parseTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => applyInlineMarkdown(cell.trim()));
}

function renderMarkdownBlock(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }
    const paragraph = paragraphBuffer.join(" ").trim();
    if (paragraph) {
      html.push(`<p>${applyInlineMarkdown(paragraph)}</p>`);
    }
    paragraphBuffer = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    if (line.includes("|") && isTableSeparator(nextLine)) {
      flushParagraph();
      const headerCells = parseTableRow(line);
      i += 2;

      const bodyRows = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        bodyRows.push(parseTableRow(lines[i]));
        i += 1;
      }
      i -= 1;

      const headHtml = `<thead><tr>${headerCells.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead>`;
      const bodyHtml = `<tbody>${bodyRows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<div class="project-table-wrap"><table class="project-table">${headHtml}${bodyHtml}</table></div>`);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return html.join("\n");
}

function renderResearchContent(markdown) {
  const normalized = markdown.replace(/\r/g, "");
  const sections = normalized.split(/\n##\s+/);

  let html = "";
  const intro = sections[0].trim();
  if (intro) {
    html += `<p class="research-intro">${applyInlineMarkdown(intro)}</p>`;
  }

  let ctaInserted = false;
  for (let index = 1; index < sections.length; index += 1) {
    const section = sections[index];
    const firstBreak = section.indexOf("\n");
    if (firstBreak < 0) {
      continue;
    }

    const title = section.slice(0, firstBreak).trim();
    const body = section.slice(firstBreak + 1).trim();
    const isFundedProjects = title.trim().toLowerCase() === "funded projects";

    if (isFundedProjects && !ctaInserted) {
      html += `
        <div class="positions-cta">
          <p>Did you like our working area? Then check out our open positions.</p>
          <a href="/open-positions/">See Open Positions</a>
        </div>
      `;
      ctaInserted = true;
    }

    const blockClass = isFundedProjects ? "research-block funded-projects-block" : "research-block";
    html += `<section class="${blockClass}"><h2>${applyInlineMarkdown(title)}</h2>${renderMarkdownBlock(body)}</section>`;
  }

  return html;
}

async function initResearchPage() {
  const container = document.getElementById("research-content");
  if (!container) {
    return;
  }

  try {
    const response = await fetch("/research/content.md");
    if (!response.ok) {
      throw new Error("Could not load /research/content.md");
    }

    const markdown = await response.text();
    container.innerHTML = renderResearchContent(markdown);
  } catch (error) {
    container.innerHTML = "<p>Research content could not be loaded right now.</p>";
  }
}

initResearchPage();
