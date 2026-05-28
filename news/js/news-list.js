import { createSnippet, formatNewsDate, loadNewsPosts } from "/news/js/news-data.js";

const PAGE_SIZE = 10;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPageFromUrl(totalPages) {
  const params = new URLSearchParams(window.location.search);
  const pageValue = Number.parseInt(params.get("page") || "1", 10);
  if (Number.isNaN(pageValue) || pageValue < 1) {
    return 1;
  }
  if (pageValue > totalPages) {
    return totalPages;
  }
  return pageValue;
}

function makePageUrl(page) {
  const params = new URLSearchParams(window.location.search);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `/news/?${query}` : "/news/";
}

function renderNewsCards(posts, page) {
  const container = document.getElementById("news-container");
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagePosts = posts.slice(start, end);

  container.innerHTML = posts
    .slice(start, end)
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

  if (!pagePosts.length) {
    container.innerHTML = "<p>No news available on this page.</p>";
  }
}

function renderPagination(totalPosts, currentPage) {
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const pagination = document.getElementById("news-pagination");
  if (!pagination) {
    return;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = "";
  for (let page = 1; page <= totalPages; page += 1) {
    const activeClass = page === currentPage ? "active" : "";
    html += `<a href="${makePageUrl(page)}" class="${activeClass}">${page}</a>`;
  }

  pagination.innerHTML = html;
}

function renderError(message) {
  const container = document.getElementById("news-container");
  container.innerHTML = `<p>${message}</p>`;

  const pagination = document.getElementById("news-pagination");
  if (pagination) {
    pagination.innerHTML = "";
  }
}

async function initNewsList() {
  try {
    const posts = await loadNewsPosts();
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    const currentPage = getPageFromUrl(totalPages);
    renderNewsCards(posts, currentPage);
    renderPagination(posts.length, currentPage);
  } catch (error) {
    renderError("News could not be loaded. Please try again later.");
    console.error(error);
  }
}

initNewsList();
