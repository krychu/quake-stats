#!/bin/sh

. $(dirname "$0")/config.sh

printf -- "+ load schema file\n"
PGPASSWORD=$PG_PASSWORD psql --host $PG_HOST --port $PG_PORT --username $PG_USER --dbname $PG_DB --file $APP_SCHEMA > /dev/null

