import { createSnippet, formatNewsDate, loadNewsPosts } from "/news/js/news-data.js";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderNewsCards(posts) {
  const container = document.getElementById("news-container");
  container.innerHTML = posts
    .map(
      (post) => `
      <a href="/news/post.html?slug=${encodeURIComponent(post.slug)}" class="news-card">
        <img src="${post.image}" alt="${escapeHtml(post.title)}">
        <div class="news-content">
          <h3>${escapeHtml(post.title)}</h3>
          <div class="date">${formatNewsDate(post.date)}</div>
          <p>${escapeHtml(createSnippet(post.summary, post.body))}</p>
        </div>
      </a>
    `,
    )
    .join("");
}

function renderError(message) {
  const container = document.getElementById("news-container");
  container.innerHTML = `<p>${message}</p>`;
}

async function initNewsList() {
  try {
    const posts = await loadNewsPosts();
    renderNewsCards(posts);
  } catch (error) {
    renderError("News could not be loaded. Please try again later.");
    console.error(error);
  }
}

initNewsList();
