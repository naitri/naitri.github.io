#!/usr/bin/env python3
"""Render the Jekyll sources to static preview files, no Ruby required.

GitHub Pages builds the real site. This script exists so the pages can be
opened straight from disk while editing content.

    pip install python-liquid pyyaml
    python tools/build-preview.py

Writes preview-local.html, preview-news.html and preview-teaching.html at the
repository root. Those files are excluded from the Jekyll build.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("Missing dependency: pip install pyyaml")

try:
    from liquid import Environment
except ImportError:  # pragma: no cover
    sys.exit("Missing dependency: pip install python-liquid")

ROOT = pathlib.Path(__file__).resolve().parent.parent
COLLECTIONS = ("research", "publications", "news", "experience", "projects", "teaching")

# Pages rendered locally are opened as files, so site-absolute URLs are rewritten
# to relative ones. On GitHub Pages the real paths are used unchanged.
LOCAL_REWRITES = (
    ("href=\"/", "href=\""),
    ("src=\"/", "src=\""),
    ("poster=\"/", "poster=\""),
    ("data-mp4=\"/", "data-mp4=\""),
)

FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", re.S)


INCLUDE = re.compile(r"\{%-?\s*include\s+([A-Za-z0-9_\-./]+)\s*-?%\}")


def expand_includes(text: str, depth: int = 0) -> str:
    """Jekyll allows unquoted include names, which strict Liquid does not parse.
    Splice the include files in before handing the template to the renderer."""
    if depth > 8:
        return text

    def swap(match: "re.Match") -> str:
        path = ROOT / "_includes" / match.group(1)
        if not path.is_file():
            raise SystemExit(f"Missing include: _includes/{match.group(1)}")
        return expand_includes(path.read_text(encoding="utf-8"), depth + 1)

    return INCLUDE.sub(swap, text)


def make_env() -> Environment:
    """Jekyll filters that plain Liquid does not ship."""
    env = Environment()
    env.filters["relative_url"] = lambda value: str(value or "")
    env.filters["absolute_url"] = lambda value: str(value or "")
    env.filters["jsonify"] = lambda value: json.dumps(value)
    return env


def split_front_matter(text: str) -> tuple[dict, str]:
    match = FRONT_MATTER.match(text)
    if not match:
        return {}, text
    data = yaml.safe_load(match.group(1)) or {}
    return data, match.group(2)


def markdownish(body: str) -> str:
    """Kramdown stand-in covering what the content files actually use:
    blank-line separated paragraphs with **bold** / *italic* / [text](url)."""
    html = []
    for block in re.split(r"\n\s*\n", body.strip()):
        if not block.strip():
            continue
        if block.lstrip().startswith("<"):
            html.append(block)
            continue
        text = block.strip()
        text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<em>\1</em>", text)
        text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
        html.append(f"<p>{text}</p>")
    return "\n".join(html)


def load_collection(name: str) -> list[dict]:
    directory = ROOT / f"_{name}"
    if not directory.is_dir():
        return []
    docs = []
    for path in sorted(directory.glob("*.md")):
        data, body = split_front_matter(path.read_text(encoding="utf-8"))
        data = dict(data)
        data["content"] = markdownish(body)
        data["path"] = str(path.relative_to(ROOT))
        docs.append(data)
    return docs


def build_site_context() -> dict:
    config = yaml.safe_load((ROOT / "_config.yml").read_text(encoding="utf-8")) or {}
    site_data = yaml.safe_load((ROOT / "_data" / "site.yml").read_text(encoding="utf-8")) or {}
    site = dict(config)
    site["data"] = {"site": site_data}
    for name in COLLECTIONS:
        site[name] = load_collection(name)
    return site


def render_page(env: Environment, site: dict, source: pathlib.Path, output: pathlib.Path) -> None:
    page, body = split_front_matter(source.read_text(encoding="utf-8"))
    page = dict(page)
    page.setdefault("layout", "default")

    content = env.from_string(expand_includes(body)).render(site=site, page=page)
    layout = (ROOT / "_layouts" / f"{page['layout']}.html").read_text(encoding="utf-8")
    html = env.from_string(expand_includes(layout)).render(site=site, page=page, content=content)

    # Local-file rewrites: absolute site paths and the two internal pages.
    # Root-anchored links ("/#research") must point at the homepage preview file,
    # otherwise they collapse to a same-page anchor ("#research") and the nav
    # silently stops working from news.html / teaching.html.
    html = html.replace('href="/#', 'href="preview-local.html#')
    for old, new in LOCAL_REWRITES:
        html = html.replace(old, new)
    # Match the anchored forms first ("news.html#telluride"), otherwise the
    # homepage highlight cards keep pointing at a file that does not exist here.
    html = html.replace('href="news.html#', 'href="preview-news.html#')
    html = html.replace('href="teaching.html#', 'href="preview-teaching.html#')
    html = html.replace('href="news.html"', 'href="preview-news.html"')
    html = html.replace('href="teaching.html"', 'href="preview-teaching.html"')
    html = html.replace('href=""', 'href="preview-local.html"')

    output.write_text(html, encoding="utf-8")
    print(f"  {source.name:16} -> {output.name}")


def main() -> None:
    site = build_site_context()
    env = make_env()
    print("Building static previews:")
    for source_name, output_name in (
        ("index.html", "preview-local.html"),
        ("news.html", "preview-news.html"),
        ("teaching.html", "preview-teaching.html"),
    ):
        render_page(env, site, ROOT / source_name, ROOT / output_name)
    print("Done. Open preview-local.html in a browser.")


if __name__ == "__main__":
    main()
