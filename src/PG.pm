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

    $queries{select_1vs1_games} = $dbh->prepare(scalar(read_file('../sql/app/games.sql')));
    $queries{select_1vs1_opponents} = $dbh->prepare(scalar(read_file('../sql/app/opponents.sql')));

    sub get_dbh {
        return $dbh;
    }
};

sub get_games {
    my ($player, $game_cnt) = @_;
    my $query = $queries{select_1vs1_games};

    $query->execute($player, $game_cnt);
    my @games = split_by(2, @{ $query->fetchall_arrayref({}) });
    return \@games;
}

sub get_opponents {
    my ($player, $interval_str) = @_;
    my $query = $queries{select_1vs1_opponents};

    $query->execute($player, $interval_str);
    return $query->fetchall_arrayref({});
}

1;
