#!/usr/bin/env bash

export ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ ! -x $ROOT/config.js ]; then
    echo -e  "module.exports = {port: 54321, client: 'pg', report: true, connection: {database: 'cell', username: 'cell', password: 'cell'}}\n\nif (!module.parent) {console.log(JSON.stringify(module.exports))}" > $ROOT/config.js
fi

export KNEX=`node $ROOT/config.js`
export PS1="\W-\t\\$ \[$(tput sgr0)\]"

alias elka="node $ROOT"

bash
