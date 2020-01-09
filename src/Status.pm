package Status;

use strict;
use warnings;
use lib ".";
use Proc::Find;
use Configuration qw($cfg);

require Exporter;
our @ISA = qw(Exporter);
our @EXPORT_OK = qw(
    status_webapp
    status_statscraper
    status_ingestion
    game_cnt
    servers
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
sub game_cnt {
    my $hours_cnt = shift;

    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    my $game_cnt;

    if ($hours_cnt) {
        $game_cnt = $dbh->selectrow_arrayref(
            qq{
              SELECT COUNT(*)
              FROM games
              WHERE created_at > now() AT TIME ZONE 'utc' - interval '$hours_cnt hours'
            }
            )->[0];
    } else {
        $game_cnt = $dbh->selectrow_arrayref(
            qq{
              SELECT COUNT(*)
              FROM games;
            })->[0];
    }

    $dbh->disconnect or die "Can't disconnect";

    return $game_cnt;
}

sub servers {
    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    my $servers = $dbh->selectall_arrayref(
        q{
          SELECT hostname, ip, port, COUNT(*) game_cnt
          FROM games
          GROUP BY hostname, ip, port
          ORDER BY hostname;
        }, { Slice => {} });

    $dbh->disconnect or die "Can't disconnect";

    return $servers;
}

1;
