# Editing the portfolio

The visual system (torus animation, animated connectome, responsive layout, hover/tap placecards) is intentionally separated from the content.

For normal updates, **do not edit `index.html`, `styles.css`, or `script.js`.** Edit the small content files below.

## What to edit

| Change | Edit |
|---|---|
| Name, bio, portrait, CV/social links, hero video + poster | `_data/site.yml` |
| Section headings (News / Publications / Selected Projects …) | `_data/site.yml` → `sections:` |
| Default colour scheme for first-time visitors | `_data/site.yml` → `default_theme:` |
| Research/connectome placecards | `_research/*.md` |
| Publications | `_publications/*.md` |
| Homepage highlights + full news archive | `_news/*.md` |
| Research + industry | `_experience/*.md` |
| Earlier projects (image, blurb, Report/Code links) | `_projects/*.md` |
| Teaching | `_teaching/*.md` |
| News/event photos | `images/news/` |
| Research images | `images/research/` |

## Add a publication

1. Copy `templates/publication.md` into `_publications/`.
2. Rename it, for example `_publications/03-my-paper.md`.
3. Edit the fields at the top.
4. Put a GIF/image in `images/publications/` if you want a local asset.
5. Increase/decrease `order` to control where it appears.

The homepage publication card is generated automatically.

## Add news

1. Copy `templates/news.md` into `_news/`.
2. Rename it, for example `_news/09-my-talk.md`.
3. Edit the short homepage fields (`kicker`, `home_title`, `home_summary`).
4. Write the fuller description below the second `---`.
5. Add a photo to `images/news/` and set `image` to `/images/news/your-photo.jpg`.

The same file automatically appears in two places:
- the small scrolling homepage highlights strip;
- the detailed `news.html` archive.

## Edit a connectome research placecard

Open one of:
- `_research/01-reasoning.md`
- `_research/02-imaging.md`
- `_research/03-flight.md`

Change the title, image, tags, or paragraph. The neural animation and hover/tap behavior live in `script.js` and do not need to be touched.

## Add or edit experience

Each role is one file in `_experience/`. Keep the logo small by simply supplying the image path; the CSS controls display size consistently across desktop, tablet, and mobile.

## Teaching

Each course is one Markdown file under `_teaching/`. Copy `templates/teaching.md` for a new course.

## Deploy on GitHub Pages

This version uses **Jekyll collections**, which GitHub Pages supports directly. Push the repository to your `naitri.github.io` repo. GitHub Pages will build the templates and Markdown/YAML into normal static HTML.

If GitHub Pages is currently configured as **Deploy from a branch**, keep that setting. No Node/npm build is required.

## Local preview

`preview-local.html` is a static snapshot of the current homepage and can be opened directly in a browser. Content edits in the Jekyll files appear after GitHub Pages builds the site.

For a full local Jekyll preview, install Jekyll and run:

```bash
jekyll serve
```

Then visit `http://localhost:4000`.

## Files you normally never need to edit

- `_includes/` — visual section templates
- `_layouts/` — page shell
- `styles.css` — responsive visual design
- `script.js` — torus, connectome, hover/tap, and scroll animations
- `index.html` — only assembles the homepage sections
- `news.html` — only assembles the news collection
- `teaching.html` — only assembles the teaching collection

## Dark and light mode

Every page has a sun/moon toggle in the header. The visitor's choice is stored in
`localStorage`; with no stored choice the site follows the operating system
setting. Set the first-visit default with `default_theme:` in `_data/site.yml`
(`system`, `light`, or `dark`).

All colours resolve through CSS custom properties in the theme block at the end
of `styles.css`. To retune a colour, change the token — not the rule that uses
it. Two token families:

- `--paper`, `--surface`, `--ink`, `--line`, `--chip-*` — the reading sections.
- `--band-*` — the full-bleed bands: hero, research, contact, footer, and the
  page heroes on News and Teaching.

The research panel flips too, including the connectome figure. `connectome.png`
was authored on a dark navy ground, so the page uses `connectome-cutout.png` —
the same figure with that ground removed to transparency. Dark mode shows it at
its original brightness; light mode darkens and saturates it with a CSS filter,
so one file serves both themes. If you replace the figure, run the same cutout
step or supply a PNG that already has a transparent background.

Panel-specific colours live in their own `--stage-*` token group, separate from
`--band-*`, because the panel needs a card, a scrim, and hotspot glass that the
open page does not.

Canvas colours cannot come from CSS. The torus behind the portrait and the
ambient neurons behind the research band each carry two palettes in `script.js`
and swap on the `themechange` event. If you add another canvas, listen for that
event rather than reading the theme once at load.

## Adding a project

1. Copy an existing file in `_projects/`, e.g. `_projects/01-sfm.md`.
2. Put a thumbnail in `images/portfolio/` and point `image:` at it.
3. `symbol:` is the small two/three-character tile in the image corner.
4. `links:` renders the small Report / Code pills under the blurb.

## Local preview

`preview-local.html`, `preview-news.html` and `preview-teaching.html` are static
snapshots, not live pages. Regenerate them after editing content:

```
pip install python-liquid pyyaml
python tools/build-preview.py
```

## The hero background clip

Self-hosted, not a YouTube embed. `_data/site.yml` holds two paths:

```yaml
hero_video_mp4: /video/hero-flapper.mp4
hero_poster: /images/hero-poster.jpg
```

The `<video>` element ships with the poster and **no source**. `script.js`
attaches the source only when the viewport is at least 700px wide, motion is not
reduced, and data-saver is off — so phones never download it — and pauses
playback when the hero scrolls away.

To swap the clip, encode it the same way and replace the file:

```
ffmpeg -i source.mp4 -an -vf "scale=1280:-2,fps=24"   -c:v libx264 -preset veryslow -crf 34 -pix_fmt yuv420p   -movflags +faststart video/hero-flapper.mp4
ffmpeg -ss 0.2 -i video/hero-flapper.mp4 -frames:v 1 -q:v 6 images/hero-poster.jpg
```

`-an` strips audio (autoplay requires muted anyway), and `+faststart` lets
playback begin before the download finishes. Keep it under ~5 MB.

## Legibility

The type scale was raised across the board and muted text darkened, because the
original 8-11px secondary sizes were unreadable on a phone. If you adjust
colours, keep `--muted` and `--faint` dark enough in light mode and light enough
in dark mode to clear WCAG AA on their own surface. There is also a
`prefers-contrast: more` block that tightens both further for visitors who ask
their OS for higher contrast, and a `pointer: coarse` block that gives every
link a 44px tap target on touch screens.

The fixed header paints a gradient scrim behind itself until you scroll, so the
navigation stays readable over a bright frame of the hero video.

## Research Objective section

The layout is the original narrow copy column beside the connectome stage. The
only addition is a small bee/Crazyflie mark under the copy, set by
`objective_image` in `_data/site.yml`. It is a transparent PNG, so it sits on
either theme without a plate; `.brain-map-bee` caps it at 150px.
