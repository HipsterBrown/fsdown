#!/bin/sh
#
# run a single pouchdb test, using pouchdb-server
# in the server running on port 6984
#

./node_modules/.bin/pouchdb-server -p 6985 $SERVER_ARGS &
POUCHDB_SERVER_PID=$!

cd node_modules/pouchdb/
npm --min-cache 999999 install

COUCH_HOST=http://localhost:698% npm test

EXIT_STATUS=$?
if [[ ! -z $POUCHDB_SERVER_PID ]]; then
    kill $POUCHDB_SERVER_PID
  fi
  exit $EXIT_STATUS
