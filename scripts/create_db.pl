#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Configuration qw($cfg);
use Log::Any '$log', prefix => '[create_db] ';

$log->info('create database');

qx/PGPASSWORD=$cfg->{postgresql_password} createdb --host $cfg->{postgresql_host} --port $cfg->{postgresql_port} --username $cfg->{postgresql_user} $cfg->{postgresql_dbname} > \/dev\/null/;

