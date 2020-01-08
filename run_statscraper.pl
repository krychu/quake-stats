#!/usr/bin/env perl

use strict;
use warnings;
use lib 'src';
use File::Basename;
use File::Spec::Functions;
use Configuration qw($cfg);

my $dirname = catfile(dirname(__FILE__), 'statscraper');

while (1) {
    qx/cd $dirname; python3 scrape.py/;
    sleep($cfg->{scrape_delay});
}

#my $dirname_stats = catfile($dirname, 'statscraper', 'stats', 'duel', 'all_maps');

