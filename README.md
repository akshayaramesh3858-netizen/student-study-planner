# StudySpace Student Study Planner

A small, responsive study planner built with plain HTML, CSS, and JavaScript. Add tasks with a subject, description, due date, and priority; edit or delete them; mark them complete; and filter the list. Tasks are saved in your browser with `localStorage`.

## Run locally

1. Download or clone this project.
2. Open `index.html` in a modern web browser.

No build step or package installation is required. For a local development server in VS Code, install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

## Upload to GitHub

1. Create a new, empty repository on [GitHub](https://github.com/new).
2. Open a terminal in this project folder and run:

   ```bash
   git init
   git add index.html style.css script.js README.md
   git commit -m "Build student study planner"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

   Replace the remote URL with the URL for your repository. If Git asks you to identify yourself, configure `user.name` and `user.email` first.
3. To publish it as a website, open the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. GitHub Pages will show the published URL after deployment.

## Notes

- Tasks remain in the browser profile where they were created; they are not synced between devices.
- The page loads Google Fonts when an internet connection is available and falls back to local sans-serif fonts otherwise.