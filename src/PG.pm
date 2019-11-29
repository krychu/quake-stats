package PG;

use strict;
use warnings;
use Configuration qw($cfg);
use DBD::Pg;
use File::Slurp;
use Array::Split qw(split_by);
use Data::Dumper;

my %queries;

# singleton dbh connection
{
    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    $queries{select_games} = $dbh->prepare(scalar(read_file('../sql/app/games.sql')));

    sub get_dbh {
        return $dbh;
    }
};

sub get_games {
    my ($player, $game_cnt) = @_;
    my $query = $queries{select_games};

    $query->execute($player, $game_cnt);
    my @games = split_by(2, @{ $query->fetchall_arrayref({}) });
    return \@games;
}

1;
