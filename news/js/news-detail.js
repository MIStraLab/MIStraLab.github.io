import { formatNewsDate, loadNewsPosts, renderMarkdown } from "/news/js/news-data.js?v=2";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderGallery(gallery) {
  if (!gallery.length) {
    return "";
  }

  return `
    <div class="news-gallery" id="news-gallery">
      ${gallery.map((src, index) => `<img src="${src}" alt="Photo ${index + 1}">`).join("")}
    </div>
  `;
}

function renderPost(post) {
  const content = document.getElementById("news-detail");
  content.innerHTML = `
    <h2>${escapeHtml(post.title)}</h2>
    <div class="date">Published on ${formatNewsDate(post.date)}</div>

    <div class="news-container">
      <div class="news-image">
        <img src="${post.image}" alt="${escapeHtml(post.title)}">
      </div>
      <div class="news-content">
        ${renderMarkdown(post.body)}
      </div>
    </div>
    ${renderGallery(post.gallery)}
  `;
}

function wireGalleryModal() {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeButton = document.querySelector(".close-button");
  const galleryImages = document.querySelectorAll(".news-gallery img");

  if (!galleryImages.length) {
    return;
  }

  for (const image of galleryImages) {
    image.addEventListener("click", () => {
      modal.style.display = "block";
      modalImage.src = image.src;
      modalImage.alt = image.alt;
    });
  }

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

function renderNotFound() {
  const content = document.getElementById("news-detail");
  content.innerHTML = `
    <h2>News Not Found</h2>
    <p>The requested news post could not be found.</p>
    <p><a href="/news/">Back to News</a></p>
  `;
}

async function initNewsDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    renderNotFound();
    return;
  }

  try {
    const posts = await loadNewsPosts();
    const post = posts.find((item) => item.slug === slug);
    if (!post) {
      renderNotFound();
      return;
    }

    renderPost(post);
    wireGalleryModal();
  } catch (error) {
    console.error(error);
    renderNotFound();
  }
}

initNewsDetail();
