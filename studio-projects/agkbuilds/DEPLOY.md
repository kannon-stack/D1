# Putting the Agkbuilds page online (free, GitHub Pages)

The finished page is a folder of plain files. GitHub Pages can host those for free, with no server. These steps give it the address **https://agk-builds.github.io**.

You need a free GitHub account. The steps are done in a web browser on github.com, and nothing needs to be installed.

## One-time setup

1. **Create the organization.** On github.com, click your profile picture → *Your organizations* → *New organization* → choose the **Free** plan. Name it **agk-builds**. (The name `agkbuilds` was already taken, and `agk-builds` has been created.) If a different name is ever needed, tell the Director before uploading: the page's address is built into its search and sharing tags, so the files have to be rebuilt for the new address.
2. **Create the repository.** Inside the new organization, click *New repository*. Name it exactly **agk-builds.github.io**, set it to **Public** (free Pages needs that), and create it. Leave "Add a README" off.
3. **Unzip the files.** Unzip `agkbuilds-site.zip` on your computer. You'll get the page's files and folders (`index.html`, `404.html`, `_next`, `drawings`, and more).
4. **Upload them.** In the new repository click *Add file → Upload files*. Drag in **everything inside the unzipped folder** (the files and folders themselves, not a folder wrapped around them, and not the zip). Wait for the upload to finish, then click *Commit changes* (commit straight to `main`).
5. **Add the hidden file.** Computers hide files whose names start with a dot, so `.nojekyll` is easy to miss. To be sure it is there, click *Add file → Create new file*, type the name `.nojekyll`, leave the contents empty and click *Commit changes*. (If GitHub says the file already exists, that's fine.) Without it, GitHub ignores the `_next` folder and the page loses its styles and fonts.
6. **Turn on Pages.** Open the repository's *Settings → Pages*. Under *Build and deployment*, set *Source* to **Deploy from a branch**, the branch to **main**, the folder to **/ (root)**, and click *Save*.
7. **Wait about a minute**, then open **https://agk-builds.github.io**. The first time, it can take a few minutes.

## Check it worked
- The page loads with the dark drawing-sheet look and the headline draws itself.
- "Start a conversation" opens an email to agkbuilds@gmail.com, and the phone number dials on a phone.
- A made-up address such as https://agk-builds.github.io/nothing shows the "Sheet not found" page.

If the page shows as plain unstyled text, the `.nojekyll` file (step 5) is missing.

## Updating the page later
Ask the Director to change it, then re-upload. The files are rebuilt with the address set:

```bash
cd studio-projects/agkbuilds/site && NEXT_PUBLIC_SITE_URL=https://agk-builds.github.io npm run build
```

The finished files are then in `studio-projects/agkbuilds/site/out/`. Upload them to the same repository (*Add file → Upload files*, which replaces files with the same names). Old files that no longer exist stay behind until you delete them in the repository.

## Using your own domain later
Buy the domain from any registrar (roughly $10–15 a year). In the repository's *Settings → Pages → Custom domain* enter it and follow GitHub's DNS instructions, then rebuild with `NEXT_PUBLIC_SITE_URL=https://your-domain` (as above) and upload the new `out/` files, so the page's search and sharing tags carry the new address.

## Other free hosts
- **Cloudflare Pages:** also free, with unlimited traffic for static pages. Create a project, choose *Upload assets* and drag in the same files. No `.nojekyll` file is needed.
- **Vercel:** its free "Hobby" plan is for personal, non-commercial use only, so it isn't suitable for a company page.
