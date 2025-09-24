# Wizardhead "The Obsidian Plot"

This is the code for the website wizardhead.com and
was initiated using the "Astro Starter Kit: Minimal"
scaffold.

I'm using deno instead of node for this, so there
may be inconsistencies if you try to run with node.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── content/
│   ├── normalized/ (generated)
│   └── obsidian-vault/ (symlinked root to my content vault)
├── dist/ (generated)
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── scripts/
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `/content/obsidian-vault/` is a symlink to the Obsidian vault I do all my content-management for the website with.  It contains solely of `.md` files and various images in its `Attachments` folder.

The `/content/normalized/` folder contains `.mdx` files that are essentially just copies of the `.md` files from the Obsidian vault, except that various features are normalized for use with Astro instead of Obsidian:

  * Obsidian-style WikiLinks (i.e. `[[Links like this]]`) are converted to
    standard Markdown links `[Links like this](/perma/link/to/whatever)`
  * Special support for transclusions `![[Some page]]` where I use display
    text prefices as directives to use special components to render the
    transcluded content, such as `![[Crazy Videos | <video-wall>]]

Any static assets, like images, can be placed in the `public/` directory.

## TODO

Images in articles should probably be clickable to open up full-sized.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `deno install`         | Installs dependencies                            |
| `deno dev`             | Starts local dev server at `localhost:4321`      |
| `deno build`           | Build your production site to `./dist/`          |
| `deno preview`         | Preview your build locally, before deploying     |
| `deno astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `deno astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
