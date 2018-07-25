#!/bin/bash

createdb --username postgres quakestats
psql --username postgres --dbname quakestats --file /schema.sql
