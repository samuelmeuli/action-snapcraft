# Snapcraft Action

**GitHub Action for setting up Snapcraft**

## Overview

This action…

- Installs Snapcraft on Ubuntu 18.04+/macOS
- Optionally logs you in to the Snap Store
- Allows you to run Snapcraft commands in your GitHub Actions workflows

Note that the more recently created [snapcore/action-build] and [snapcore/action-publish] effectively copy the `use_lxd` strategy (below). Building using this actions still takes ~3:30 min less time than [snapcore/action-build].

[snapcore/action-build]: https://github.com/snapcore/action-build
[snapcore/action-publish]: https://github.com/snapcore/action-publish

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
    env:
      SNAPCRAFT_STORE_CREDENTIALS: ${{ secrets.SNAPCRAFT_TOKEN }}
    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3

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

NOTE: You will need to manually push a package to the Snap Store to get a valid SNAP_NAME first.

Copy that token and add it as a secret to GitHub Actions. You can do this in your GitHub repository under Settings → Secrets. You can name it `SNAPCRAFT_TOKEN` for convenience.

Set `SNAPCRAFT_STORE_CREDENTIALS` environment variable either in:

- root yml file: to be available for all jobs
- inside a job: to be available inside a specific job (recommended), or
- inside a step: to be available only in a specific step

```yml
env:
  SNAPCRAFT_STORE_CREDENTIALS: ${{ secrets.SNAPCRAFT_TOKEN }}
```

Finally, add the following option to your workflow step:

```yml
- name: Install Snapcraft
  uses: samuelmeuli/action-snapcraft@v1
  with:
    skip_install: true # optional, if already installed in an earlier step
```

### Build using LXD

Using `runs-on: ubuntu-20.04` or later, LXD is availabe by default. If using `runs-on: ubuntu-18.04`, LXD can be installed as shown below. This is an alternative to using `multipass` (GitHub VMs give the error `launch failed: CPU does not support KVM extensions.` when trying to use `multipass`).

```yml
- name: Install Snapcraft with LXD
  uses: samuelmeuli/action-snapcraft@v1
  with:
    use_lxd: ${{ matrix.os == "ubuntu-18.04" }}
- name: Build snap
  run: sg lxd -c 'snapcraft --use-lxd'
```

## Development

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

Currently maintained by [@casperdcl](https://github.com/casperdcl).

## Related

- [Lint Action](https://github.com/samuelmeuli/lint-action) – GitHub Action for detecting and fixing linting errors
- [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder) – GitHub Action for building and releasing Electron apps
- [Maven Publish Action](https://github.com/samuelmeuli/action-maven-publish) – GitHub Action for automatically publishing Maven packages
- [snapcore/action-build] – GitHub Action for installing LXD and Snapcraft, and building snaps
- [snapcore/action-publish] – GitHub Action for logging in and pushing to the Snap Store
