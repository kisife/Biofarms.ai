# Biofarms.ai — website

A six-page static website for Biofarms.ai. Plain HTML, CSS, and JavaScript — no build step, no frameworks, no tooling. To preview locally, double-click `index.html` or open it in any browser.

This guide is written for non-technical editing. Every common change is a single-file edit.

## Folder structure

```
biofarms-website/
├── index.html          Home
├── services.html       Services (four pillars)
├── insights.html       Insights & field notes
├── about.html          About Kisife
├── publications.html   Research & publications
├── contact.html        Contact + enquiry form
├── README.md           This file
└── assets/
    ├── favicon.svg     Site icon (green leaf)
    ├── css/
    │   └── style.css   All styling and colours
    ├── js/
    │   └── main.js     Menu, carousel, FAQ, form
    └── img/
        ├── home.svg       Home page background (vector)
        ├── services.svg   Services page background
        ├── about.svg      About page background
        ├── research.svg   Insights + Publications background
        └── contact.svg    Contact page background
```

Your profile photo lives at the repo root as `photo.jpg` (not in `assets/`).

All pages share the same look. Colours and fonts live in one place — the top of `assets/css/style.css`, in the block that starts with `:root`.

## 1. Replace your profile photo

1. Save your photo as a `.jpg` file named exactly `photo.jpg`.
2. Put it in the **repo root** (the same folder as `index.html`), replacing the existing `photo.jpg`.

That's it. The About page updates automatically. A portrait-shaped image (taller than wide, roughly 4:5) looks best.

## 2. Replace a page background image

Each page's dark top banner has its own background file in `assets/img/`:

| Page | File |
|------|------|
| Home | `home.svg` |
| Services | `services.svg` |
| About | `about.svg` |
| Insights & Publications | `research.svg` |
| Contact | `contact.svg` |

These are vector (SVG) graphics, so they stay sharp at any screen size and load instantly. To swap in a photograph instead, save a wide, dark `.jpg` (16:9) into `assets/img/`, then in the matching page's HTML change the hero line from `url('assets/img/home.svg')` to `url('assets/img/your-photo.jpg')`. White text sits on top, so darker images read best. Ask if you'd like a hand with this.

## 3. Replace the favicon (browser-tab icon)

The current icon is a green leaf at `assets/favicon.svg`.

- **Easiest:** open `assets/favicon.svg` in an editor and replace its contents with your own SVG, keeping the filename.
- **If you have a `.png` or `.ico` logo instead:** put the file in `assets/` (for example `logo.png`), then in each of the six `.html` files find this line near the top:

  ```html
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  ```

  and change it to point at your file, e.g. `href="assets/logo.png"` and `type="image/png"`.

## 4. Add a new insights post

Posts appear in two places: the carousel on the **home page** (`index.html`) and the feed on the **insights page** (`insights.html`). Add your post to both.

In each file, find the comment block that says **"TO ADD A NEW POST"**. Just below it you'll see post blocks that look like this:

```html
<article class="card post-card">
  <span class="tag">Scientific commentary</span>
  <h3>The forests that heal themselves</h3>
  <p class="meta">May 2025</p>
  <p>Short summary of the post goes here.</p>
  <a class="arrow" href="https://your-link" target="_blank" rel="noopener">Read on LinkedIn →</a>
</article>
```

To add a post:

1. Copy one whole block, from `<article` to `</article>`.
2. Paste it directly below an existing block (still inside the same group).
3. Change five things: the **tag**, the **title** (`<h3>`), the **date** (`<p class="meta">`), the **summary**, and the **link** (`href="..."`).

No other changes are needed. On `insights.html`, keep the dashed "Coming soon" card last if you want it to stay at the end.

## 5. Update the contact email addresses

The site uses two addresses: `info@biofarms.ai` and `kisifej@biofarms.ai`. They appear in the footer of every page, on the contact page, and the enquiry form sends to `info@biofarms.ai`.

To change them everywhere, do a find-and-replace across all `.html` files **and** `assets/js/main.js`:

- Find `info@biofarms.ai` → replace with your new address.
- Find `kisifej@biofarms.ai` → replace with your new address.

Most editors (VS Code, Sublime, even TextEdit per file) can find-and-replace. In `main.js`, the address to update is inside the `mailto:` line near the bottom.

## The enquiry form

The form on `contact.html` validates required fields, then opens the visitor's email app pre-filled to `info@biofarms.ai` (a `mailto:` fallback that needs no server). If you later add a form-handling service (Formspree, Netlify Forms, etc.), swap the submit logic in `assets/js/main.js`.

## Changing colours

Open `assets/css/style.css`. The first block (`:root`) holds the palette:

```css
--forest: #1B4332;   /* main green   */
--earth:  #B5834A;   /* accent brown */
--bg:     #F8F6F1;   /* page background */
--ink:    #1A1A1A;   /* body text    */
```

Change a value here and it updates across the whole site.

## Deploying

The site is static, so it can go on any host: Vercel, Netlify, GitHub Pages, or any web server. Upload the whole `biofarms-website` folder; `index.html` is the entry point.
