# Upload checklist

What the site still needs from you, and what has already been wired up.

Status key: **BLOCKING** = a visitor sees a placeholder today ·
**CONFIRM** = filled in from public sources, please sanity-check ·
**OPTIONAL** = polish.

---

## 1. BLOCKING — two news cards are still placeholders

Every other card uses a real photo. The exceptions:

| Card | File today | Then edit |
|---|---|---|
| Future Faculty Fellow | `images/news/future-faculty.svg` (placeholder: "Replace with a preferred UMD / program photo") | `_news/11-future-faculty.md` |
| AIM Symposium | `images/news/aim-symposium.svg` (placeholder: "Replace with a photo from the poster session") | `_news/06-aim-symposium.md` |

To fix either: drop a JPG into `images/news/`, then change the one `image:` line,
e.g.

```yaml
image: /images/news/future-faculty.jpg
```

**Format for any news photo:** JPG, landscape, **1200 × 780 px**, under 300 KB.
The homepage strip crops to 224 × 126 and the news page to 240 × 160, both
`object-fit: cover` — keep the subject centred and away from the edges.

---

## 2. CONFIRM — dates filled in from public sources

You said to check chronology, so I did. Please confirm these before pushing;
they are now printed on the cards.

| News entry | Date used | Where it came from |
|---|---|---|
| Telluride talk | Workshop ran **28 Jun – 17 Jul 2026** | [Telluride 2026 site](https://sites.google.com/view/telluride-2026/home) — I do not know which day you spoke |
| CGTN America feature | **4 Jul 2026** | the date in the CGTN article URL |
| PolarDepth → RA-L / IROS 2026 | **June 2026** | timestamp decoded from your LinkedIn announcement (17 Jun 2026) |
| NYC Computer Vision Day @ NYU | **27 Apr 2026** | [NYU Tandon](https://engineering.nyu.edu/news/nyc-computer-vision-day-drew-hundreds-talented-researchers-brooklyn) |
| Maryland Day | **25 Apr 2026** | [UMD](https://marylandday.umd.edu/) |
| Princeton Robotics Symposium | **20 Apr 2026** | [Princeton Robotics](https://robotics.princeton.edu/events/2026/princeton-robotics-inaugural-symposium) |
| Outstanding Achievement Award | **2025–2026 academic year** | the wording on your certificate — no specific award date shown |
| Future Faculty Fellow | **2026**, no month | no public date found |
| AI Demo Day | **16 Oct 2025** | [UMD Research](https://research.umd.edu/news/umd-hosts-media-day-showcase-ai-innovation), which names you and the Flapper/Crazyflie demos |

Two caveats worth reading:

- **Baltimore Sun link.** I linked
  `baltimoresun.com/2025/10/16/ai-robots-rescue/` — same date as AI Demo Day, and
  the Sun's own social post describes the tiny-drone work. But the article is
  paywalled, so I could not confirm it names you. Swap the link if it is the
  wrong piece.
- **IROS 2026 workshop.** Added as `_news/01-iros-workshop.md`, using the banner
  from [insect-autonomy.github.io](https://insect-autonomy.github.io/) as the card
  image. Dated **1 October 2026, Pittsburgh** from that site. One thing to check:
  the workshop page currently names only **Chahat Singh and Kaushik Jayaram**
  under "Correspondence" and has no organizers section, so your name is not
  visible there. Worth asking them to list the full organizing committee.
- **AIM symposium.** Added at your request as `_news/06-aim-symposium.md`, dated
  **5 May 2026** from [Maryland Today](https://today.umd.edu/briefs/inaugural-aim-symposium-highlights-ai-research-and-learning-innovation-at-umd).
  It needs a photo — see section 1.
- **Two dates I still cannot source:** which day you spoke at Telluride (the
  workshop ran 28 Jun – 17 Jul), and the Future Faculty Fellow date. Also worth
  confirming that the Future Faculty Program is the Clark School one, since you
  are in CS rather than Engineering.

---

## 3. Already done — nothing for you to do

**Your new photos**, cropped to 3:2 and optimised:

| Your file | Now | Used by |
|---|---|---|
| `telluride_talk.jpg` | `images/news/telluride-talk.jpg` | Telluride talk |
| `cgtn_america.png` | `images/news/cgtn-feature.jpg` | CGTN feature |
| `princeton_nyu.jpg` | `images/news/poster-polardepth.jpg` | **both** Princeton and NYU cards, as you asked |
| `maryland_day.jpg` | `images/news/maryland-day.jpg` | Maryland Day |
| `outstanding_achievement_award.jpg` | `images/news/outstanding-achievement.jpg` | Outstanding Achievement Award |
| `ai_demoday.png` | `images/news/ai-demo-day.jpg` | AI Demo Day |
| `naitri_profile_img.jpg` | `images/naitri-portrait.jpg` | hero portrait |

| `bee_crazyflie.png` | `images/research/bee-crazyflie.png` | small mark in the Research Objective column (white ground and drop shadow keyed out) |
| `Naitri_Rajyaguru_CV2026.pdf` | `data/Naitri_Rajyaguru_CV.pdf` | every "CV ↗" link |

**Migrated from the old site:** portrait fallback, favicon, four experience
logos, five project thumbnails, and the CodedVO GIF.

**Corrections taken from the 2026 CV:**

- Added the missing **Graduate Research Assistant, PRG (Aug 2021–May 2023)**
  role, where the Science Robotics optical-flow work sits.
- **Future Faculty Fellowship is 2025–2027**, so that news entry moved from 2026
  into the 2025 block. The month is still unknown.
- Ph.D. card now notes Dean's Fellowship *and* Future Faculty Fellow.

**Not yet on the site, but in the CV** — say the word and I will add any of them:
B.E. Electronics & Communication, Gujarat Technological University (2019, Gold
Medalist); mentoring (Aryan Tajne, Joshua Au, Alec Luterman); reviewing for
TPAMI, ICRA, IROS, Nature Communications, ACM Computing Surveys, and TVCJ.

**No more hot-linking.** The PolarDepth banner used to be pulled live from
`prg.cs.umd.edu` in three places. I rendered `banner_polarnav_final.pdf` from
your Downloads to `images/research/polardepth-banner.jpg` and pointed all three
at it. The site now loads no images from other servers.

---

## 4. About the background video

**Do not use a GIF.** A 48-second GIF at any usable size lands somewhere between
50 and 200 MB, is capped at 256 colours, and cannot be hardware-decoded. It is
the worst option on every axis that matters here.

`Videos/background_website.mp4` was **370 MB, 4K, 61 Mbps** — unusable as-is.
It has been re-encoded and wired in:

| | Before | Now |
|---|---|---|
| Resolution | 3840 × 2160 | 1280 × 720 |
| Bitrate | 61 Mbps | 0.78 Mbps |
| Audio | AAC | stripped (autoplay requires muted anyway) |
| Size | 370 MB | **4.5 MB** |
| | | `+faststart`, so playback begins before the file finishes downloading |

Quality holds up because the clip sits behind a translucent scrim rather than
being shown at full strength.

A VP9 WebM was also tried. It came out **15.5 MB** — three times larger than the
H.264 on this footage, because of the fine hexagonal netting. So the site ships
the MP4 only, which every browser supports.

**How it loads** (`script.js`): the `<video>` ships with a poster and no source.
The source is attached only when the screen is ≥ 700 px wide, motion is not
reduced, and data-saver is off. Phones, reduced-motion visitors, and data-saver
users get `images/hero-poster.jpg` (203 KB) and never download the video.
Playback also pauses when the hero scrolls out of view.

**One thing to decide:** the clip is 48 s and loops. If you would rather it be a
tighter loop, name a start and end time and it can be re-cut — a 15 s loop would
drop it to roughly 1.5 MB.

The YouTube embed is gone, so the site now sets no third-party cookies.

---

## 5. OPTIONAL — asset weight

The homepage pulls about 2.2 MB of images plus the 4.5 MB video.

| File | Now | Suggested |
|---|---|---|
| `images/research/codedvo_working.gif` | 1397 KB | The heaviest image on the page. Re-encode as a muted looping MP4 like the hero, or trim frames |
| `images/research/connectome.png` | 659 KB | Only used in the small Purposive Memory card now. Resize to ~600 px wide, target < 120 KB |
| `images/logos/umd.png` | 293 KB, 1200 × 1200 | Displays at 34 px. Resize to 256 × 256, target < 30 KB |
| `images/news/maryland-day.jpg` | 222 KB | Fine, but 150 KB is reachable at quality 78 |
| `images/news/poster-polardepth.jpg` | 194 KB | Same |
| `images/hero-poster.jpg` | 203 KB | Shown before the video starts and on every phone. 120 KB is reachable |

**Portrait resolution.** `naitri_profile_img.jpg` is only 400 × 400. It sits in a
286 × 356 slot, so on a high-DPI screen it renders slightly soft. If you have the
original at 1000 px or larger, drop it in and repoint `portrait:` in
`_data/site.yml`. The old headshot is still there as `images/naitri.jpeg`
(800 × 800) if you prefer to switch back.

**Files kept but not served.** `images/portfolio/*.png` are the full-size
originals; the cards use the 52 px crops in `images/portfolio/thumbs/`. Kept
because they are the source for those crops and useful if you ever want larger
project cards.

---

## 6. OPTIONAL — content gaps

- **Old projects not brought across.** The old repo has thumbnails for ten more
  projects that were never on the live page: `biped`, `calib`, `depth`, `marine`,
  `multi_agent`, `multi_task`, `pblite`, `swap`, `tsdf`, `wpnet`. To add one,
  copy its PNG into `images/portfolio/` and copy the front matter from an
  existing `_projects/*.md`.
- **Two research figures.** `images/research/connectome.png` and
  `insect-brain-regions.png` look like they came from a published paper or press
  release rather than your own work. If so, add a credit or swap them — the
  `media_label:` field in `_research/01-reasoning.md` and `03-flight.md` is a
  natural place for it. (`connectome-cutout.png` is derived from the first, with
  its dark background removed so it works in both themes.)

---

## 7. Where each thing lives

```
_data/site.yml          name, bio, portrait, CV/social links, hero video,
                        section headings, default colour scheme
_research/*.md          the three connectome placecards
_publications/*.md      papers
_news/*.md              homepage strip + news archive (one file feeds both)
_experience/*.md        roles + logos
_projects/*.md          project cards (thumbnail, category, blurb, repo link)
_teaching/*.md          teaching page
images/                 all local media
video/                  hero background clip
```

## 8. Previewing before you push

GitHub Pages builds the real site. To check locally without installing Ruby:

```
pip install python-liquid pyyaml
python tools/build-preview.py
```

That regenerates `preview-local.html`, `preview-news.html` and
`preview-teaching.html`. Open `preview-local.html` and use the sun/moon toggle in
the header to check both themes. Re-run the script after any content edit — the
preview files are snapshots, not live.
