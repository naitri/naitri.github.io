# Naitri Rajyaguru — portfolio

A content-driven GitHub Pages portfolio for robotics, computer vision, computational imaging, and bio-inspired autonomy.

## Design / content separation

The homepage visuals remain animation-heavy, but the content is now deliberately simple to maintain:

```text
_data/site.yml          # bio, links, portrait, hero video
_research/*.md          # connectome hover/tap placecards
_publications/*.md      # papers + GIFs + venues + links
_news/*.md              # homepage highlights + full news archive
_experience/*.md        # research + industry
_projects/*.md          # earlier work
_teaching/*.md          # teaching page
images/                 # replaceable local media
data/                   # CV PDF

_includes/              # reusable visual templates
_layouts/               # HTML shell
styles.css              # responsive design
script.js               # torus/connectome/interaction animation
```

This follows the same content-first maintenance principle as the Insect-scale Autonomy workshop site: structured page content stays separate from the layout and deployment machinery.

See **`EDITING.md`** for copy/paste recipes for adding papers, news, experience, and teaching.

## GitHub Pages

The site is compatible with GitHub Pages' built-in Jekyll build. Push the files to the root of the `naitri.github.io` repository.

The visual behavior remains responsive across desktop, tablet, and mobile because the existing `styles.css` and `script.js` are unchanged by routine content edits.

## Dark and light mode

The whole site switches between dark and light from the header toggle. The
choice persists in `localStorage` and otherwise follows the operating system.
See `EDITING.md` for the token system and `_data/site.yml` for the first-visit
default.

## Direct preview

`preview-local.html`, `preview-news.html`, and `preview-teaching.html` are static
snapshots for opening straight from disk. Regenerate them after content edits:

```
pip install python-liquid pyyaml
python tools/build-preview.py
```

## Before you publish

See **`UPLOAD-CHECKLIST.md`** for the media that still needs to be supplied
(five news photos are still placeholder graphics).
