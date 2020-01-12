#!/usr/bin/env perl

use strict;
use warnings;
use lib 'src';
use File::Basename;
use File::Spec::Functions;
use Configuration qw($cfg);

my $dirname = catfile(dirname(__FILE__), 'scripts');

while (1) {
    qx/cd $dirname; .\/scrape_badplace.pl/;
    sleep($cfg->{scrape_delay});
}

