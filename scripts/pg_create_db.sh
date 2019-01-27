#!/bin/sh

. $(dirname "$0")/config.sh

printf -- "+ create database\n"
PGPASSWORD=$PG_PASSWORD createdb --host $PG_HOST --port $PG_PORT --username $PG_USER $PG_DB > /dev/null
