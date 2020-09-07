#!/usr/bin/env bash

alteredFilePaths=$(git ls-files -m '*.js');
files=( "$@" )

function _lint () {
  npx eslint $alteredFilePaths --fix
}

function _test () {
  npm run test:api:path "${files[0]}" -- --bail
}

function _commit () {
  echo "TCR => COMMIT"
  git commit -am "TCR:WIP"
}

function _revert () {
  echo "TCR => REVERT"
  git checkout HEAD lib/
}

if [ -n "$alteredFilePaths" ] ; then
  if _lint ; then
    if _test ; then _commit ; else _revert ; fi
  else
    echo "TCR => ABORT"
  fi
else
  echo "TCR => NOTHING HAS CHANGED"
fi
