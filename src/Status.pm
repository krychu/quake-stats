package Status;

use strict;
use warnings;
use lib ".";
use Proc::Find;
use File::Slurp;
use Filesys::DiskUsage qw(du);
use Configuration qw($cfg);

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT_OK = qw(
    run_status
    agg_game_cnts
    game_cnts
    file_cnt
    disk_usage
    );

sub run_status {
    my ($running, $notrunning) = ('running', 'not running');
    return {
        run_webapp          => Proc::Find::proc_exists(cmndline => 'perl ./run_webapp.pl') ? $running : $notrunning,
        run_scrape_qtv      => Proc::Find::proc_exists(cmndline => 'perl ./run_scrape_qtv.pl') ? $running : $notrunning,
        run_scrape_badplace => Proc::Find::proc_exists(cmndline => 'perl ./run_scrape_badplace.pl') ? $running : $notrunning,
        run_scrape_quake1pl => Proc::Find::proc_exists(cmndline => 'perl ./run_scrape_quake1pl.pl') ? $running : $notrunning,
        run_ingest          => Proc::Find::proc_exists(cmndline => 'perl ./run_ingest.pl') ? $running : $notrunning
    }
}

# sub file_cnt {
#     my @paths = read_dir($cfg->{stats_path}, prefix => 1);
#     return scalar(@paths);
# }

# Returns disk usage.
#
# {
#   total: {file_cnt => 10, size => 4.7, 24 => 8},
#   path1: {file_cnt => 7, size => 3.21, 24 => 5},
#   ...
# }
sub disk_usage {
    my @hour_cnts = @_;

    my @paths = ($cfg->{data_qtv}, $cfg->{data_badplace}, $cfg->{data_quake1pl});

    # per-path stats
    my %du;
    for my $path (@paths) {
        if (-d $path) {
            my @files = read_dir($path, prefix => 1);
            $du{$path} = {
                file_cnt => scalar(@files),
                size     => sprintf("%.2f", du({blocks => 1, exclude => qr/^\./}, $path) / 1048576.0),
            };

            for my $hour_cnt (@hour_cnts) {
                my $recent_cnt = 0;
                for my $file (@files) {
                    my ($dev,$ino,$mode,$nlink,$uid,$gid,$rdev,$size,$atime,$mtime,$ctime,$blksize,$blocks) = stat($file);
                    $recent_cnt++ if ((time() - $mtime) < (24*$hour_cnt*60));
                }
                $du{$path}->{$hour_cnt} = $recent_cnt;
            }
        } else {
            $du{$path} = {file_cnt => 0, size => 0};
            ($du{$path}->{$_} = 0) for (@hour_cnts);
        }
    }

    # total
    $du{total} = {file_cnt => 0, size => 0};
    ($du{total}->{$_} = 0) for (@hour_cnts);
    for my $path (grep {$_ ne 'total'} keys(%du)) {
        $du{total}->{file_cnt} += $du{$path}->{file_cnt};
        $du{total}->{size} += $du{$path}->{size};
        ($du{total}->{$_} += $du{$path}->{$_}) for (@hour_cnts);
    }

    my %du_short_paths;
    for my $path (@paths) {
        $du_short_paths{$path =~ s/.+?\/(data)/$1/r} = $du{$path};
    }
    $du_short_paths{total} = $du{total};

    return \%du_short_paths;
}

# Returns game counts given a hash returned by servers():
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
sub game_cnts {
    my @hours_cnts = @_;

    my $servers = _game_cnts(); # get total
    for my $hours_cnt (@hours_cnts) {
        my $servers_h = _game_cnts($hours_cnt);
        for my $server (keys %$servers) {
            $servers->{$server}->{$hours_cnt} = exists $servers_h->{$server}->{$hours_cnt} ? $servers_h->{$server}->{$hours_cnt} : 0;
        }
    }

    return $servers;
}

sub _game_cnts {
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
