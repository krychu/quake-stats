#!/usr/bin/env perl

#-------------------------------------------------------------------------------
#
# Periodically add new stat files from different data dirs to pg.
#
#-------------------------------------------------------------------------------

use strict;
use warnings;
use lib '../src';
use File::Basename;
use File::Spec::Functions;
use File::Slurp;
use DBD::Pg;
use JSON::Parse qw(parse_json);
use Syntax::Keyword::Try;
use Configuration qw($cfg);
use Encode qw(decode encode);
use Data::Dumper;
use Log::Any::Adapter;
use Log::Any '$log', prefix => '[ingest] ';
Log::Any::Adapter->set(@{ $cfg->{log_ingest} });

my $chartbl = quake_chartbl();

try {
    my @data_dirs = ($cfg->{data_qtv}, $cfg->{data_badplace}, $cfg->{data_quake1pl});
    for my $data_dir (@data_dirs) {
        my $abs_paths = get_stat_abs_paths($data_dir);
        insert_stat_files($abs_paths);
    }
}
catch {
    my $error = $@ || 'unknown error';
    $log->error("exception: $@");
}

# Return absolute paths to all stat files, sorted by date (most recent first).
sub get_stat_abs_paths {
    my $data_dir = shift;

    my @abs_paths = read_dir($data_dir, prefix => 1);
    @abs_paths = sort {(stat $b)[10] <=> (stat $a)[10]} @abs_paths;

    return \@abs_paths;
}

sub insert_stat_files {
    my $abs_paths = shift;

    if (!scalar(@$abs_paths)) {
        return;
    }

    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    my $sth_game = $dbh->prepare(scalar(read_file('../sql/app/insert_game.sql')));
    my $sth_game_player = $dbh->prepare(scalar(read_file('../sql/app/insert_game_player.sql')));

    my ($cnt, $skip_cnt) = (0, 0);
    for my $abs_path (@$abs_paths) {
        $log->info("Adding: $abs_path");

        my $txt = read_file($abs_path);
        if (!format_ok($txt)) {
            $skip_cnt++;
            next;
        }
        $txt = decode_names($txt);
        my $json = parse_json($txt);
        preprocess_date($json);
        my $file = basename($abs_path);
        last if is_already_added($dbh, $file, $json);

        my $pg_game_id = insert_game($sth_game, $json, $file);
        map {insert_game_player($sth_game_player, $pg_game_id, $_)} @{$json->{players}};
        $cnt++;
    }

    $log->info("New stat files added: $cnt, files skept: $skip_cnt (unsupported format)\n");

    $sth_game->finish or die "Cannot finish the game statement";
    $sth_game_player->finish or die "Cannot finish the game_player statement";
    $dbh->disconnect or die "Disconnection error: $DBI::errstr\n";
}

sub format_ok {
    my $txt = shift;

    # old json (e.g., badplace/duel_meag_vs_bro[aerowalk]170520-0741.txt)
    if (!($txt =~ m/frags/)) {
        return 0;
    }

    # xml (e.g., quake1pl/duel_(vvd)_vs_tiall[aerowalk]011018-0019.txt)
    if ($txt =~ m/<\?xml/) {
        return 0;
    }

    return 1;
}

sub is_already_added {
    my ($dbh, $file, $json) = @_;

    my $ref = $dbh->selectrow_arrayref(
        q{
        SELECT 1
        FROM games
        WHERE file = ?
        }, undef,
        $file
        );

    return defined($ref);
}

# Returns id of the inserted game.
sub insert_game {
    my ($sth, $json, $file) = @_;

    $sth->execute(
        $json->{version},
        $json->{date},
        $json->{map},
        $json->{hostname},
        $json->{ip},
        $json->{port},
        $json->{mode},
        $json->{tl},
        $json->{dm},
        $json->{duration},
        $json->{demo},
        $file
        );

    return $sth->fetch()->[0];
}

sub preprocess_date {
    my $json = shift;

    my $date = $json->{date};
    if ($date =~ m/Summer Time/) {
        $json->{date} = $date =~ s/Summer Time//r;
    }
}

sub insert_game_player {
    my ($sth, $pg_game_id, $player) = @_;

    # print Dumper($player);

    $sth->execute(
        $pg_game_id,
        $player->{'top-color'},
        $player->{'bottom-color'},
        $player->{ping},
        $player->{name},

        $player->{stats}->{frags},
        $player->{stats}->{deaths},
        $player->{stats}->{'spawn-frags'},
        $player->{stats}->{kills},
        $player->{stats}->{suicides},

        $player->{dmg}->{taken},
        $player->{dmg}->{given},
        $player->{dmg}->{self},

        $player->{spree}->{max},
        $player->{spree}->{quad},
        $player->{control},
        $player->{speed}->{max},
        $player->{speed}->{avg},

        $player->{items}->{health_15}->{took},
        $player->{items}->{health_25}->{took},
        $player->{items}->{health_100}->{took},
        $player->{items}->{ga}->{took},
        $player->{items}->{ya}->{took},
        $player->{items}->{ra}->{took},
        $player->{items}->{q}->{took},
        $player->{items}->{q}->{time},

        $player->{weapons}->{sg}->{acc}->{attacks},
        $player->{weapons}->{sg}->{acc}->{hits},
        $player->{weapons}->{sg}->{kills}->{total},
        $player->{weapons}->{sg}->{deaths},
        $player->{weapons}->{sg}->{damage}->{enemy},

        $player->{weapons}->{gl}->{acc}->{attacks},
        $player->{weapons}->{gl}->{acc}->{hits},
        $player->{weapons}->{gl}->{acc}->{virtual},
        $player->{weapons}->{gl}->{kills}->{total},
        $player->{weapons}->{gl}->{deaths},
        $player->{weapons}->{gl}->{pickups}->{taken},
        $player->{weapons}->{gl}->{damage}->{enemy},

        $player->{weapons}->{rl}->{acc}->{attacks},
        $player->{weapons}->{rl}->{acc}->{hits},
        $player->{weapons}->{rl}->{acc}->{virtual},
        $player->{weapons}->{rl}->{kills}->{total},
        $player->{weapons}->{rl}->{deaths},
        $player->{weapons}->{rl}->{pickups}->{taken},
        $player->{weapons}->{rl}->{damage}->{enemy},

        $player->{weapons}->{lg}->{acc}->{attacks},
        $player->{weapons}->{lg}->{acc}->{hits},
        $player->{weapons}->{lg}->{kills}->{total},
        $player->{weapons}->{lg}->{deaths},
        $player->{weapons}->{lg}->{pickups}->{taken},
        $player->{weapons}->{lg}->{damage}->{enemy}
        );
}

sub quake_chartbl {
    my @tbl;

    for (my $i=0; $i<32; $i++) {
        $tbl[$i] = $tbl[$i + 128] = '#';
    }

    for (my $i=32; $i<128; $i++) {
        $tbl[$i] = $tbl[$i + 128] = chr($i);
    }

    # special cases

    # dot
    $tbl[5] = $tbl[14] = $tbl[15] = $tbl[28] = $tbl[46] = '.';
    $tbl[5 + 128] = $tbl[14 + 128] = $tbl[28 + 128] = $tbl[46 + 128] = '.';

    # numbers
    for (my $i=18; $i<28; $i++) {
        $tbl[$i] = $tbl[$i + 128] = chr($i + 30);
    }

    # brackets
    $tbl[16] = $tbl[16 + 128] = '[';
    $tbl[17] = $tbl[17 + 128] = ']';
    $tbl[29] = $tbl[29 + 128] = $tbl[128] = '(';
    $tbl[31] = $tbl[31 + 128] = $tbl[130] = ')';

    # left arrow
    $tbl[127] = '>';
    # right arrow
    $tbl[141] = '<';

    # '='
    $tbl[30] = $tbl[129] = $tbl[30 + 128] = '=';

    return \@tbl;
}

sub decode_names {
    my $txt = shift;
    $txt =~ s/(\\u00(..))/$chartbl->[hex($2)]/ge;
    return $txt;
}