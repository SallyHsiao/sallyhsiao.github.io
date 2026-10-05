# Sally Hsiao — Academic Portfolio

A responsive, single-page academic portfolio presenting interdisciplinary work across psychology, urban planning, cultural research, digital health, humanities, and community engagement.

The website is built with plain HTML, CSS, and JavaScript. It has no framework, package manager, build step, or server-side dependency, so it can be hosted directly with GitHub Pages.

## Portfolio structure

The public navigation currently contains nine sections:

1. About Me
2. Current Research — Analytic-Holistic Thinking and Cultural Fit
3. Initiative Research Project — Social Appearance Anxiety
4. Award-Winning Project — Interactive Design for Art Therapy
5. Urban Planning Design
6. Research Project, Ma Lab
7. Virtual Tourism Research Proposal
8. Volunteering & Activities
9. Highlighted Academic Projects

Projects 10 and 11 remain in the source code for future use, but are intentionally hidden from the carousel, project content, and project navigator.

## Files required for publishing

Keep the following structure at the root of the GitHub repository:

```text
website2026/
├── index.html
├── styles.css
├── script.js
├── README.md
├── .gitignore
├── assets/
│   └── ...all portfolio images
└── mandala-animation/
    └── index.html
```

For the website itself, the folders that must be uploaded are:

- `assets/` — all portfolio covers, diagrams, photographs, and research figures.
- `mandala-animation/` — the embedded and full-page interactive art-therapy experience.

The three root website files—`index.html`, `styles.css`, and `script.js`—must also be uploaded. `README.md` and `.gitignore` are recommended repository files, although they are not required by the browser to render the website.

Do not upload the original working folder named `（交互）坛城沙画参与式艺术治疗方案设计/`. Its deployable webpage has already been copied into `mandala-animation/`; the original folder also contains development files and a nested Git repository that are not needed by GitHub Pages.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly also displays most of the site, but a local server is recommended for consistent iframe and browser behavior.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload or commit the required root files and folders listed above without changing their relative paths.
3. Push the files to the repository's `main` branch.
4. Open the repository's **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`, then save.
7. Wait for GitHub Pages to finish deploying, then open the URL shown in the Pages settings.

Because the site uses relative paths, it works both as a GitHub user site and under a repository subpath.

## Notes before making the repository public

- GitHub Pages and a public repository make the portfolio text, photographs, figures, and contact information publicly accessible.
- Keep filenames and capitalization unchanged; GitHub Pages runs on a case-sensitive filesystem.
- Upload the complete `assets/` folder, including images for currently hidden projects, so those projects can be restored later without rebuilding the repository.
