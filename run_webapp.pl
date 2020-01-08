#!/usr/bin/env perl

use strict;
use warnings;
use File::Basename;
use File::Spec::Functions;

my $dirname = catfile(dirname(__FILE__), 'web');
system("cd $dirname; morbo app.pl");
