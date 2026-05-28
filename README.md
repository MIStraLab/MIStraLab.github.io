# MIStraLab Website - Content Update Guide

This guide focuses on **how to update Team and News content** and how those pages work.

## Local Preview

Run from project root:

```bash
python -m http.server 5500
```

Open:

- `http://localhost:5500/`

Use `Ctrl+F5` after edits.

---

## Team: How It Works

### Data source

- File: `team/members.md`
- This single file feeds:
  - Team list page (`/team/`)
  - Member detail pages (`/team/member.html?slug=...`)
  - Alumni table

### Entry structure

Each person is one block:

```md
## member:unique-slug
group: ...
page: yes
name: ...
image: /images/profiles/....
...
```

### Required fields (minimum)

- `## member:slug`
- `group`
- `page`
- `name`
- `image`

If one of these is missing, the person may not render correctly.

### Group behavior

Valid groups used by this site:

- `pi`
- `phd`
- `master`
- `phd_alumni`
- `msc_alumni`

`group` can contain multiple values, separated by comma:

```md
group: phd, msc_alumni
```

The **first group is primary** (controls where the person appears in active lists).

### Detail page behavior (`page`)

- `page: yes` => member has clickable detail page
- `page: no` => no detail page link

### Alumni behavior

To show someone in alumni table:

- include alumni group (`msc_alumni` or `phd_alumni`)
- include `alumni_year`
- include thesis field:
  - `msc_thesis` for MSc alumni
  - `phd_thesis` for PhD alumni

### Multi-value fields

These can be written with `|` or bullet format. Bullet format is clearer:

```md
research:
- Topic 1
- Topic 2
```

Common multi-value fields:

- `research`
- `education`
- `conferences`
- `publications`
- `pets` (format: `image_path::caption`)

### Add a new member (step-by-step)

1. Add image into `images/profiles/` (or use `/images/profiles/noimage.jpg`).
2. Copy an existing member block in `team/members.md`.
3. Change `slug`, `name`, `group`, and other fields.
4. Save and reload:
   - `/team/`
   - `/team/member.html?slug=your-slug` (if `page: yes`)

### Edit an existing member

1. Find by slug in `team/members.md`.
2. Update fields.
3. Reload team and detail page.

### Team checklist before publish

1. Slugs are unique.
2. Image paths are correct.
3. Group names are spelled exactly as above.
4. Alumni rows have year + thesis where needed.

---

## News: How It Works

### Data source

- File: `news/posts.md`
- This single file feeds:
  - News list page (`/news/`)
  - News detail pages (`/news/post.html?slug=...`)

### Post structure

Each post starts with:

```md
## post-slug
title: ...
date: YYYY-MM-DD
image: /images/news/...
summary: ...
gallery: /images/news/a.jpg | /images/news/b.jpg

Body text in Markdown...
```

Important:

- Leave **one empty line** between metadata and body.
- `gallery` can be empty (`gallery:`).

### Required metadata

- `slug` (in `## slug`)
- `title`
- `date`
- `image`

Without these, post may be skipped.

### Date behavior

- Format must be `YYYY-MM-DD`.
- List page sorting is based on date (newest first).

### Add a new post (step-by-step)

1. Add image(s) to `images/news/`.
2. Copy an existing post block in `news/posts.md`.
3. Set a new unique slug.
4. Fill metadata (`title`, `date`, `image`, `summary`, `gallery`).
5. Write body in Markdown.
6. Reload:
   - `/news/`
   - Click post to verify detail page

### Edit an existing post

1. Find post by slug.
2. Update metadata/body.
3. Reload list and detail page.

### News checklist before publish

1. Slug is unique.
2. Date format is valid.
3. Main image path exists.
4. Gallery image paths exist.
5. Summary is concise (used on card preview).

---

## Useful Paths (Team/News)

- `team/members.md`
- `news/posts.md`
- `images/profiles/`
- `images/news/`

## Contact for Website Maintenance

For website issues, contact **Irem Topsakal**.


Logo:

800x200 px
Prosto One
140 px
Photopea

Note: You can contact Irem Topsakal about any issue :) s
