#!/usr/bin/env perl

use strict;
use warnings;
use lib "src";
use Configuration qw($cfg);
use File::Basename;
use File::Spec::Functions;

my $scripts_dirname = catfile(dirname(__FILE__), 'scripts');
my $web_dirname = catfile(dirname(__FILE__), 'web');

my $usage = "  Usage
  -----

    ./ctrl.pl command

  Available commands
  ------------------

    createdb                 -- Create PostgreSQL database
    loadschema               -- Load schema.sql which drops and re-creates tables and indices

    deletedata               -- Delete all scraped data
    scrape-quake1pl          -- Scrape stat files from quake1.pl
    scrape-badplace          -- Scrape stat files from badplace
    scrape-qtv               -- Scrape stat files from qtv
    ingest                   -- Ingest scraped files into database
    webapp                   -- Run webapp

    run-scrape-quake1pl      -- These are above commands run periodically, not once
    run-scrape-badplace
    run-scrape-qtv
    run-ingest

    webapp-dev               -- Watch & rebuild web files

";

my $cmd_createdb = "PGPASSWORD=$cfg->{postgresql_password} createdb --host $cfg->{postgresql_host} --port $cfg->{postgresql_port} --username $cfg->{postgresql_user} $cfg->{postgresql_dbname} > \/dev\/null";
my $cmd_loadschema = "PGPASSWORD=$cfg->{postgresql_password} psql --host $cfg->{postgresql_host} --port $cfg->{postgresql_port} --username $cfg->{postgresql_user} --dbname $cfg->{postgresql_dbname} --file $cfg->{postgresql_schema} > \/dev\/null";

my $cmd_map = {
    "createdb"                  => sub { run_once(".", $cmd_createdb)},
    "loadschema"                => sub { run_once(".", $cmd_loadschema); },

    "deletedata"                => sub { run_once(".", "rm -rf data/*"); },
    "scrape-quake1pl"           => sub { run_once($scripts_dirname, "./scrape_quake1pl.pl"); },
    "scrape-badplace"           => sub { run_once($scripts_dirname, "./scrape_badplace.pl"); },
    "scrape-qtv"                => sub { run_once($scripts_dirname, "./scrape_qtv.pl"); },
    "ingest"                    => sub { run_once($scripts_dirname, "./ingest.pl"); },
#    "webapp"                    => sub { run_once($web_dirname, "/usr/local/Cellar/perl/5.30.1/bin/morbo app.pl"); },
    "webapp"                    => sub { run_once($web_dirname, "~/perl5/perlbrew/perls/perl-5.31.3/bin/morbo app.pl"); },

    "run-scrape-quake1pl"       => sub { run_periodically("scrape-quake1pl", $cfg->{scrape_delay}); },
    "run-scrape-badplace"       => sub { run_periodically("scrape-badplace", $cfg->{scrape_delay}); },
    "run-scrape-qtv"            => sub { run_periodically("scrape-qtv", $cfg->{scrape_delay}); },
    "run-ingest"                => sub { run_periodically("ingest", $cfg->{ingest_delay}); },

    "webapp-dev"                => sub { run_once($web_dirname, "npx webpack --watch"); },
};

if ($#ARGV < 0 || !exists($cmd_map->{$ARGV[0]})) {
    print($usage);
    exit();
}

# run the command
$cmd_map->{$ARGV[0]}->();

sub run_once {
    my ($dirname, $cmd) = @_;

    system("cd $dirname; $cmd");
    #qx/cd $dirname; ./$script/;
}

sub run_periodically {
    my ($cmd_name, $delay) = @_;
    while (1) {
        $cmd_map->{$cmd_name}->();
        sleep($delay);
    }
}
