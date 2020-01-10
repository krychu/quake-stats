package Status;

use strict;
use warnings;
use lib ".";
use Proc::Find;
use File::Slurp;
use Configuration qw($cfg);

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT_OK = qw(
    status_webapp
    status_statscraper
    status_ingestion
    agg_game_cnts
    servers
    file_cnt
    disk_space
    );

sub status_webapp {
    return Proc::Find::proc_exists(cmndline => 'perl ./run_webapp.pl') ? "running" : "not running";
}

sub status_statscraper {
    return Proc::Find::proc_exists(cmndline => 'perl ./run_statscraper.pl') ? "running" : "not running";
}

sub status_ingestion {
    return Proc::Find::proc_exists(cmndline => 'perl ./run_ingest.pl') ? "running" : "not running";
}

# Returns the total number of games. If 'hours_cnt' is specified returns the
# number of games within these last number of hours.
# sub game_cnt {
#     my $hours_cnt = shift;

#     my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

#     my $game_cnt;

#     if ($hours_cnt) {
#         $game_cnt = $dbh->selectrow_arrayref(
#             qq{
#               SELECT COUNT(*)
#               FROM games
#               WHERE created_at > now() AT TIME ZONE 'utc' - interval '$hours_cnt hours';
#             }
#             )->[0];
#     } else {
#         $game_cnt = $dbh->selectrow_arrayref(
#             qq{
#               SELECT COUNT(*)
#               FROM games;
#             })->[0];
#     }

#     $dbh->disconnect or die "Can't disconnect";

#     return $game_cnt;
# }

sub file_cnt {
    my @paths = read_dir($cfg->{stats_path}, prefix => 1);
    return scalar(@paths);
}

sub disk_space {
    return `du -csh $cfg->{stats_path} | grep total | awk '{print \$1;}'`;
}

# Returns total game counts given a server hash returned by servers(). Apart
# from the grant total it also returns totals for each hour cnt included in the
# servers hash:
#
# {
#   "total": 304,
#   "24":    30,
#   ...
# }
sub agg_game_cnts {
    my $servers = shift;

    my @hostnames = keys(%$servers);
    my $agg = {};
    map {$agg->{$_} = 0} keys(%{$servers->{$hostnames[0]}});

    for my $hostname (@hostnames) {
        map {$agg->{$_} += $servers->{$hostname}->{$_}} keys(%$agg);
    }

    return $agg;
}

# Returns a hash with game counts per server:
#   {
#     "hostname1" => {
#        "total" => 340,
#        "24" => 119,
#        ...
#     }
#     ...
#   }
#
# Total is included by default. Other counts are included one per each attribute
# passed to the sub.
sub servers {
    my @hours_cnts = @_;

    my $servers = _servers();
    for my $hours_cnt (@hours_cnts) {
        my $servers_h = _servers($hours_cnt);
        for my $server (keys %$servers) {
            $servers->{$server}->{$hours_cnt} = exists $servers_h->{$server}->{$hours_cnt} ? $servers_h->{$server}->{$hours_cnt} : 0;
        }
    }

    return $servers;
}

sub _servers {
    my $hours_cnt = shift;

    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    my $servers;

    if ($hours_cnt) {
        $servers = $dbh->selectall_arrayref(
            qq{
              SELECT hostname, COUNT(*) as game_cnt
              FROM games
              WHERE created_at > now() AT TIME ZONE 'utc' - interval '$hours_cnt hours'
              GROUP BY hostname;
            }, { Slice => {} });
    } else {
        $servers = $dbh->selectall_arrayref(
            qq{
              SELECT hostname, COUNT(*) as game_cnt
              FROM games
              GROUP BY hostname;
            }, { Slice => {} });
    }

    $dbh->disconnect or die "Can't disconnect";

    my $servers_hash = {};
    my $key = defined($hours_cnt) ? $hours_cnt : 'total';
    for my $server (@$servers) {
        $servers_hash->{$server->{hostname}} = {$key => $server->{game_cnt}};
    }

    return $servers_hash;
}

1;
