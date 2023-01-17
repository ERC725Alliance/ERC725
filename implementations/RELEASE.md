# **Release Process**

Releases are published when a commit including an increase in the `package.json` version number is merged to the `main` branch.

This command will increases the version automatically using [standard-version](https://github.com/conventional-changelog/standard-version):

```bash
$ npm run release
```

If the current branch contains new commits since the last git tag that contains [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) prefixes like `feat`, `fix` or `docs`, it will increase the version as follows:

- `feat` will increase the `minor` version
- `fix` and `docs` will increase the `patch` version

Standard-version then:

1. updates the `package.json` version
2. adds to the `CHANGELOG.md` all commit messages grouped by `Feature`, `Bug Fixes`, `Documentation` or `Other`
3. commits all changes under: `chore(release): <version>`

Then push the changes to `develop`:

```bash
$ git push origin develop
```

A NPM and GitHub release is created when a version change in `package.json` is merged into `main`.

A git tag will then be created, a GitHub Release created with the description of the PR to `main` as the release notes with the appended `CHANGELOG.md` content, and iOS and Android Artifacts attached.
At last a release will be published in NPM automatically.

&nbsp;

## Specific Version Increases

To ignore the automatic version increase in favour of a custom version use the `--release-as` flag with the argument `major`, `minor` or `patch` or a specific version number:

```bash
npm run release -- --release-as minor
# Or
npm run release -- --release-as 1.1.0
```

## Prerelease versions

To create a pre-release run:

```bash
npm run release -- --prerelease
```

If the lastest version is 1.0.0, the pre-release command will change the version to: `1.0.1-0`

To name the pre-release, set the name by adding `--prerelease <name>`

```bash
npm run release -- --prerelease alpha
```

If the latest version is 1.0.0 this will change the version to: `1.0.1-alpha.0`
