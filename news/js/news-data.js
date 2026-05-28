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

function parsePosts(markdownText) {
  const sections = markdownText.split(/\r?\n##\s+/);
  const posts = [];

  for (const [index, section] of sections.entries()) {
    if (index === 0) {
      continue;
    }

    const normalized = section.replace(/\r/g, "");
    const firstNewline = normalized.indexOf("\n");
    if (firstNewline < 0) {
      continue;
    }

    const slug = normalized.slice(0, firstNewline).trim();
    const rest = normalized.slice(firstNewline + 1);
    const lines = rest.split("\n");
    const { meta, bodyStartIndex } = parseMetadata(lines);

    if (!slug || !meta.title || !meta.date || !meta.image) {
      continue;
    }

    const body = lines.slice(bodyStartIndex).join("\n").trim();
    const galleryRaw = meta.gallery || "";
    const gallery = galleryRaw
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    posts.push({
      slug,
      title: meta.title,
      date: meta.date,
      image: meta.image,
      summary: meta.summary || "",
      gallery,
      body,
    });
  }

  return posts.sort((a, b) => new Date(`${b.date}T00:00:00`) - new Date(`${a.date}T00:00:00`));
}

export async function loadNewsPosts() {
  const response = await fetch("/news/posts.md");
  if (!response.ok) {
    throw new Error("Could not load /news/posts.md");
  }
  const markdownText = await response.text();
  return parsePosts(markdownText);
}

export function formatNewsDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function applyInlineMarkdown(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const html = [];
  let inList = false;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }
    const text = paragraphBuffer.join(" ");
    html.push(`<p>${applyInlineMarkdown(text)}</p>`);
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${applyInlineMarkdown(line.slice(4).trim())}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${applyInlineMarkdown(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${applyInlineMarkdown(line.slice(2).trim())}</li>`);
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  if (inList) {
    html.push("</ul>");
  }

  return html.join("\n");
}

export function createSnippet(summary, body) {
  if (summary && summary.trim()) {
    return summary.trim();
  }
  return body
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}
