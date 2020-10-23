#!/usr/bin/env perl

#-------------------------------------------------------------------------------
#
# Downloads stat files from the registered badplace servers. Only files not
# found in $cfg->{data_badplace} directory are fetched and stored.
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
use Log::Any '$log', prefix => '[scrape_badplace] ';
Log::Any::Adapter->set(@{ $cfg->{log_scrape_badplace} });

my $base_address = "https://badplace.eu";

create_data_path();
fetch_stat_files();

sub fetch_stat_files {
    my $server_urls = fetch_servers();
    $log->info("Fetched " . scalar(@$server_urls) . " servers");

    for my $server_url (@$server_urls) {
        fetch_server_stat_files($server_url);
    }
}

sub fetch_servers {
    return scrape_server_urls(get_page($base_address . '/server'));
}

sub fetch_server_stat_files {
    my $server_url = shift;

    $log->info("Fetching from: $server_url");
    my $stat_urls = scrape_all_stat_urls($server_url);
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
    my $data_path = $cfg->{data_badplace};
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

    my @urls = $page =~ m/href="(\/server\/.+?)"/g;
    @urls = map { $base_address . $_ } @urls;

    return \@urls;
}

sub scrape_all_stat_urls {
    my $server_url = shift;

    my $i = 1;
    my @all_urls;
    while (1) {
        my $url = $server_url . "view/?page=$i";
        my $urls = scrape_stat_urls(get_page($url));
        if (scalar(@$urls) == 0) {
            last;
        }
        push(@all_urls, @$urls);
        $i++;
    };

    return \@all_urls;
}

# Returns an array of pairs [txt, url]
sub scrape_stat_urls {
    my $page = shift;

    my @urls = $page =~ m/viewgame.+?>(.+?\.txt).+?href="(.+?downloadfile.+?)"/sg; # [txt, url, txt, url, ...]
    @urls = split_by(2, @urls); # ([txt, url], [txt, url], ...)
    @urls = map { [catfile($cfg->{data_badplace}, $_->[0]), $base_address . $_->[1]] } @urls;
    return \@urls;
}
