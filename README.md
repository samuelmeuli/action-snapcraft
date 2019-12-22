# Snapcraft Action

**GitHub Action for setting up Snapcraft**

## Overview

This action…

- Installs Snapcraft on macOS/Ubuntu
- Optionally logs you in to the Snap Store
- Allows you to run Snapcraft commands in your GitHub Actions workflows

## Usage

### Basic

To use this action, add the following step to your workflow:

```yml
- name: Install Snapcraft
  uses: samuelmeuli/action-snapcraft@v1
```

A full example:

```yml
name: My workflow

on: push

jobs:
  my-job:
    runs-on: ubuntu-latest

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v1

      - name: Install Snapcraft
        uses: samuelmeuli/action-snapcraft@v1

      # You can now run Snapcraft shell commands
      - name: Use Snapcraft
        run: snapcraft --help
```

### Log in

This action can also log you in to the Snap Store. For this to work, you need an [Ubuntu One account](https://snapcraft.io/account).

You will also need a Snap Store login token. To obtain one, run the following command on your machine:

```sh
snapcraft export-login --snaps SNAP_NAME --channels edge -
```

Copy that token and add it as a secret to GitHub Actions. You can do this in your GitHub repository under Settings → Secrets. The secret must be called `snapcraft_token`.

Finally, add the following option to your workflow step:

```yml
- name: Install Snapcraft
  uses: samuelmeuli/action-snapcraft@v1
  with:
    snapcraft_token: ${{ secrets.snapcraft_token }}
```

## Development

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

## Related

- [Lint Action](https://github.com/samuelmeuli/lint-action) – GitHub Action for detecting and fixing linting errors
- [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder) – GitHub Action for building and releasing Electron apps
- [Maven Publish Action](https://github.com/samuelmeuli/action-maven-publish) – GitHub Action for automatically publishing Maven packages
