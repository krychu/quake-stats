#!/usr/bin/env perl

#-------------------------------------------------------------------------------
#
# Downloads stat files from the registered qtv servers. Only files not found in
# $cfg->{data_qtv} directory are fetched and stored.
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
use Configuration qw($cfg);
use List::MoreUtils qw(uniq);
use URI::Encode;
use Log::Any::Adapter;
use Log::Any '$log', prefix => '[scrape_qtv] ';
use Data::Dumper;
Log::Any::Adapter->set(@{ $cfg->{log_run_scrape_badplace} });

my $qtv_api_servers = 'http://qtvapi.quakeworld.nu/api/v1/servers';

create_data_path();
fetch_stat_files();

sub fetch_stat_files {
    my $server_urls = fetch_servers();
    my $cnt = scalar(@$server_urls);
    $log->info("Fetched $cnt servers");

    my $num = 1;
    for my $server_url (@$server_urls) {
        $log->info("Fetching from: $server_url ($num/$cnt)");
        fetch_server_stat_files($server_url);
        $num++;
    }
}

sub fetch_servers {
    return scrape_server_urls(get_page($qtv_api_servers));
}

sub scrape_server_urls {
    my $page = shift;

    my @urls = $page =~ m/"IpAddress".+?"(.+?)"/g;
    @urls = uniq(@urls);
    @urls = map { "http://$_:28000" } @urls;

    return \@urls;
}

sub fetch_server_stat_files {
    my $server_url = shift;

    my $stat_urls = scrape_stat_urls(get_page($server_url . '/demos'), $server_url);
    my  ($ok_cnt, $bad_cnt, $existed_cnt) = (0, 0, 0);
    for my $stat_url (@$stat_urls) {
        my ($txt, $url) = @$stat_url;
        my $file_path = catfile($cfg->{data_qtv}, $txt);
        if (-s $file_path) {
            $existed_cnt++;
        } else {
            sleep($cfg->{fetch_file_delay});
            my $r = getstore($url, catfile($cfg->{data_qtv}, $txt));
            $log->info("  [new], url: $url, file: " . catfile($cfg->{data_qtv}, $txt));
            if (is_success($r)) {
                $ok_cnt++;
            } else {
                $bad_cnt++;
            }
            if (($ok_cnt + $bad_cnt + $existed_cnt) % 100 == 0) {
                $log->info("  existed: $existed_cnt, fetched (ok): $ok_cnt, fetched (fail): $bad_cnt");
            }
        }
    }
    $log->info("  existed: $existed_cnt, fetched (ok): $ok_cnt, fetched (fail): $bad_cnt");
}

# Returns an array of pairs [txt, url]
sub scrape_stat_urls {
    my ($page, $server_url) = @_;

    my $encoder = URI::Encode->new();
    my @urls = $page =~ /demos\/(.+?\.txt)/g;
    @urls = map { [$encoder->decode($_), $server_url . "/dl/demos/$_"] } @urls;
    return \@urls;
}

sub get_page {
    my $url = shift;

    my $ua = new LWP::UserAgent;
    $ua->timeout(60);
    my $request = new HTTP::Request('GET', $url);
    my $response = $ua->request($request);
    my $content = $response->content();
    return $content;
}

sub create_data_path {
    my $data_path = $cfg->{data_qtv};
    if (!-d $data_path) {
        make_path $data_path or die "Can't create a data path";
    }
}
