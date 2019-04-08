#!/bin/sh

. $(dirname "$0")/config.sh

./pg_create_tables.sh
printf -- "+ import sample data from $SAMPLEDATA_PATH\n"
cd $SCRIPTS_PATH/../qs && mix run scripts/import_data.exs $PG_HOST $PG_PORT $PG_USER $PG_PASSWORD $PG_DB $SAMPLEDATA_PATH
