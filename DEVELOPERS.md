## Developer tooling

Continuous Integration (CI) will test your patches for coding style, quality issues and run the tests in the 'tests' folder. Code that fails these tests are rejected by the CI bot "jenkinsbot".

**Before submitting a patch make sure it passes the coding style tests that you can execute locally.**


### Install using npm

To get the results most consistent with Continuous Integration, run:\
`npm ci`

This might take a minute or more. This will install the same version (as defined in `package-lock.json`) of each required node_module as used by the CI jobs into the node_modules folder in the project.


### Install using pnpm (faster)

Pnpm is an alternative to npm that stores packages in a global folder (`<mount point>/.pnpm-store` on the same drive) and (sym)links them from `node_modules`, thus saving install time and space requirement. Works on *nixes (using symlinks) and windows (using junctions) too.

To use, install pnpm once (globally):\
`npx pnpm add -g pnpm`
To update later: `pnpm add -g pnpm`

Install the packages:\
`pnpm i`

This generates `pnpm-lock.yaml`, which is not committed to repository now. Add it to `.git/info/exclude`.


### Running coding style tests

To run the coding style tests:\
`npm -s run lint`

To test only `*.js` and `*.json` files:\
`npm -s run lint`

To test only `*.css` and `*.less` files:\
`npm -s run lint`

To fix trivial coding style errors, like missing spaces between parameters and parenthesis in `*.js` and `*.json` files:\
`npm -s run lint:js -- --fix`

To fix trivial coding style errors, like missing spaces between parameters and parenthesis in `*.css` and `*.less` files:\
`npm -s run lint:styles -- --fix`

Alternatively, use `pnpm` instead of `npm` for concise and more readable error messages.


### Shorthands

For an extensive series of fixes in this area, you may wish to add shell aliases like:
```
# Lint *.js, *.json, *.css, *.less, i18n/*.json
alias    lint='npm -s run lint'
# Lint *.js, *.json
alias  lintjs='npm -s run lint:js'
# Lint *.less, *.css
alias  lintss='npm -s run lint:styles'
# Fix trivial lint errors in *.js, *.json
alias lfixjs='npm -s run lint:js -- --fix'
# Fix trivial lint errors in *.less, *.css
alias lfixless='npm -s run lint:styles -- --fix'
```
to your `~/.bash_profile` file or its equivalent. This will add the short commands 
You could also use shorter custom commands:
```
alias lfj='npm -s run lint:js -- --fix'
alias lfs='npm -s run lint:styles -- --fix'
alias ltj='npm -s run lint:js'
alias lts='npm -s run lint:styles'
```

You might also want to use `pnpm` or shortcuts to silence the long and useless `npm` stack traces:
```
alias  np='npm -s'
alias npr='npm -s run'
```


### Updating modules

The version of direct dependencies of each project are pinned in `package.json`, those are updated by the [LibraryUpgrader bot](https://www.mediawiki.org/wiki/Libraryupgrader/2.0) ([status](http://libraryupgrader2.wmflabs.org/)), which also updates `package-lock.json` and with that the result of `npm ci`.
To get those updates run `npm ci` after pulling LibraryUpgrader's patch.

To update the dependencies of the installed modules run:
`npm i` (install)
This will update the versions in `package-lock.json` incrementally, *without* changing the folder structure of node_modules. If build and tests succeed with the updated modules than submit a patch with the updated `package-lock.json`.

Occasionally the module dependencies change, changing the folder structure of node_modules. When this happens, *deleting* and recreating `package-lock.json` will result in a file with significant (structural) differences. Before committing such patch, do a through test that all npm script run successfully. Delete all the global modules before the test (rename the global `npm` and `npm-cache` folders somewhere in your user folder, depending on your system), otherwise these might change the behavior on your system and issues will come out only when CI runs the tests. Then run in the project:
```
rm -r node_modules package-lock.json  &&  npm i
```
This will regenerate `package-lock.json` with the most up-to-date versions of dependencies. Submit as a patch if all tests pass.


### Changing icons

Icons in the .svg format are minified. After changing an icon invoke the minifier:\
`npm -s run svgmin`

To install the 'svgo' module globally (needs to be updated occasionally, no other risks involved):\
`npm i -s -g svgo`

