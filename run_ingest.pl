#!/usr/bin/env perl

use strict;
use warnings;
use lib 'src';
use File::Basename;
use File::Spec::Functions;
use File::Slurp;
use Configuration qw($cfg);

my $dirname = catfile(dirname(__FILE__), 'statscraper', 'stats', 'duel', 'all_maps');

while (1) {
    opendir(my $dh, $dirname);
    my @files = read_dir($dirname, prefix => 1);
    @files = sort {(stat $a)[10] <=> (stat $b)[10]} @files;
    closedir($dh);

    #print join("\n", @files);

    sleep($cfg->{ingest_delay});
}


