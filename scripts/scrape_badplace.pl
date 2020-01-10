#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use LWP::UserAgent;
use File::Fetch;
use File::Path qw( make_path );
use File::Spec::Functions;
use File::Basename qw(dirname);
use Configuration qw($cfg);
use Log::Any::Adapter;
use Log::Any '$log', prefix => '[run_ingest] ';
Log::Any::Adapter->set(@{ $cfg->{log_run_scrape_badplace} });

my $base_address = "https://badplace.eu";

create_data_path();
get_stat_files();

sub get_stat_files {
    my $server_urls = scrape_server_urls(get_page($base_address . '/server'));
    for my $server_url (@$server_urls) {
        $log->info("Fetching from: $server_url");
        my $stat_urls = scrape_stat_urls(get_page($server_url));
        my $ok_cnt = 0;
        my $bad_cnt = 0;
        for my $stat_url (@$stat_urls) {
            my $ff = File::Fetch->new(uri => $stat_url);
            my $where = $ff->fetch(to => get_data_path());# or $log->error("Couldn't fetch: $stat_url");
            if ($where) {
                #$log->info("Fetched: $stat_url");
                $ok_cnt++;
            } else {
                $bad_cnt++;
                #$log->error("Couldn't fetch: $stat_url");
            }
        }
        $log->info("  $ok_cnt files fetched, $bad_cnt failed");
    }
}

sub get_data_path {
    return catfile(dirname(__FILE__), '..', 'data');
}

sub create_data_path {
    my $data_path = get_data_path();
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

sub scrape_server_urls {
    my $page = shift;

    my @urls = $page =~ m/href="(\/server.+?)"/g;
    @urls = map { $base_address . $_ } @urls;
    return \@urls;
}

sub scrape_stat_urls {
    my $page = shift;

    my @urls = $page =~ m/href="(.+?downloadfile.+?)"/g;
    @urls = map { $base_address . $_ } @urls;
    return \@urls;
}

  # https://badplace.eu/server/
  # https://badplace.eu/server/nl2.badplace.eu/
