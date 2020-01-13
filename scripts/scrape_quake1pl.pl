#!/usr/bin/env perl

#-------------------------------------------------------------------------------
#
# Downloads stat files from https://quake1.pl/demos/. Only files not found in
# $cfg->{data_quake1pl} directory are fetched and stored.
#
#-------------------------------------------------------------------------------

use strict;
use warnings;
use lib "../src";
use LWP::UserAgent;
use LWP::Simple qw(getstore is_success);
use File::Path qw(make_path);
use File::Spec::Functions;
use File::Basename qw(dirname);
use Array::Split qw(split_by);
use Configuration qw($cfg);
use Data::Dumper;
use Log::Any::Adapter;
use Log::Any '$log', prefix => '[scrape_quake1pl] ';
Log::Any::Adapter->set(@{ $cfg->{log_scrape_quake1pl} });

my $base_address = 'https://quake1.pl/demos';

create_data_path();
fetch_stats();

sub fetch_stats {
    $log->info("Fetching from: $base_address");
    my $stat_urls = scrape_stat_urls(get_page($base_address));
    fetch_stat_files($stat_urls);
}

sub fetch_stat_files {
    my $stat_urls = shift;

    my ($ok_cnt, $bad_cnt, $existed_cnt) = (0, 0, 0);
    for my $stat_url (@$stat_urls) {
        my ($file_path, $url) = @$stat_url;
        if (-s $file_path) {
            $existed_cnt++;
        } else {
            sleep($cfg->{fetch_file_delay});
            my $r = getstore($url, $file_path);
            is_success($r) ? $ok_cnt++ : $bad_cnt++;
            if (($ok_cnt + $bad_cnt + $existed_cnt) % 100 == 0) {
                $log->info("  existed: $existed_cnt, fetched (ok): $ok_cnt, fetched (fail): $bad_cnt");
            }
        }
    }
    $log->info("  existed: $existed_cnt, fetched (ok): $ok_cnt, fetched (fail): $bad_cnt");
}

sub create_data_path {
    my $data_path = $cfg->{data_quake1pl};
    if (!-d $data_path) {
        make_path $data_path or die "Can't create a data path";
    }
}

sub get_page {
    my $url = shift;

    my $ua = new LWP::UserAgent;
    $ua->timeout(120);
    my $request = new HTTP::Request('GET', $url);
    my $response = $ua->request($request);
    my $content = $response->content();
    return $content;
}

# Returns an array of pairs [txt, url]
sub scrape_stat_urls {
    my $page = shift;

    my @urls = $page =~ m/href="(.+?\.txt)/g; # [txt, url, txt, url, ...]
    @urls = map { [catfile($cfg->{data_quake1pl}, $_), "$base_address/$_"] } @urls;
    return \@urls;
}
