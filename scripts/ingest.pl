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
use Math::Round;
use List::Util qw(min max);
use Data::Dumper;
use Log::Any::Adapter;
use Log::Any '$log', prefix => '[ingest] ';
Log::Any::Adapter->set(@{ $cfg->{log_ingest} });

my $chartbl = quake_chartbl();

try {
    my @data_dirs = ($cfg->{data_qtv}, $cfg->{data_badplace}, $cfg->{data_quake1pl});
    my ($dbh, $sth_game) = prepare_dbh();
    for my $data_dir (@data_dirs) {
        my $abs_paths = get_stat_abs_paths($data_dir);
        insert_stat_files($dbh, $abs_paths, $sth_game);
    }
    finish_dbh($dbh, $sth_game);
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

sub prepare_dbh {
    my $dbh = DBI->connect("dbi:Pg:host=$cfg->{postgresql_host};port=$cfg->{postgresql_port};dbname=$cfg->{postgresql_dbname}", $cfg->{postgresql_user}, '', {AutoCommit => 1, RaiseError => 1, PrintError => 1});

    my $sth_game = prepare_sth_game($dbh);
    return ($dbh, $sth_game);
}

sub finish_dbh {
    my ($dbh, $sth_game) = @_;

    $sth_game->finish or die "Cannot finish the game statement";
    $dbh->disconnect or die "Disconnection error: $DBI::errstr\n";
}

sub insert_stat_files {
    my ($dbh, $abs_paths, $sth_game) = @_;

    my ($cnt, $skip_cnt) = (0, 0);
    for my $abs_path (@$abs_paths) {
        $log->info("Adding: $abs_path");

        my $txt = read_file($abs_path);

        # skip if the format is unsupported
        if (!format_ok($txt)) {
            $skip_cnt++;
            next;
        }

        # txt pre-processing
        $txt = decode_names($txt);

        # json pre-processing
        my $json;
        try {
            $json = parse_json($txt);
            clean_dates($json);
        }
        catch {
            $log->error("parse error: $abs_path (skipping)");
            $skip_cnt++;
            next;
        }

        my $file = basename($abs_path);
        last if is_already_added($dbh, $file, $json);

        my ($record_0, $record_1) = prepare_records($json, $file);
        insert_game($record_0, $record_1, $file, $sth_game);

        $cnt++;
    }
    $log->info("New stat files added: $cnt, files skept: $skip_cnt (unsupported format or parsing problems)\n");
}

sub insert_game {
    my ($record_0, $record_1, $file, $sth_game) = @_;

    for my $r ($record_0, $record_1) {
        $sth_game->execute( @{$r}{ @{columns()} } );
    }
}

sub prepare_records {
    my ($json, $file) = @_;

    my ($a_json, $b_json) = @{ $json->{players} };

    my $record_0 = {
        date                 => $json->{date},
        map                  => $json->{map},
        hostname             => $json->{hostname},
        mode                 => $json->{mode},
        tl                   => $json->{tl},
        dm                   => $json->{dm},
        duration             => $json->{duration},
        demo                 => $json->{demo},
        file                 => $file,

        a_name               => $a_json->{name},
        a_top_color          => $a_json->{'top-color'},
        a_bottom_color       => $a_json->{'bottom-color'},
        a_ping               => $a_json->{ping},
        a_frags              => $a_json->{stats}{frags},
        a_spawn_frags        => $a_json->{stats}{'spawn-frags'},
        a_suicides           => $a_json->{stats}{suicides},
        a_kills              => $a_json->{stats}{kills},
        a_deaths             => $a_json->{stats}{deaths},
        a_spree_max          => $a_json->{spree}{max},
        a_dmg_given          => $a_json->{dmg}{given}, # should it subtract self?
        a_dmg_taken          => $a_json->{dmg}{taken},
        a_rl_attacks         => $a_json->{weapons}{rl}{acc}{attacks},
        a_rl_hits            => $a_json->{weapons}{rl}{acc}{hits},
        a_rl_virtual         => $a_json->{weapons}{rl}{acc}{virtual},
        a_rl_kills           => $a_json->{weapons}{rl}{kills}{enemy}, # what is total and self here?
        a_rl_deaths          => $a_json->{weapons}{rl}{deaths},
        a_rl_dmg_given       => $a_json->{weapons}{rl}{damage}{enemy},
        a_rl_dmg_taken       => $b_json->{weapons}{rl}{damage}{enemy},
        a_lg_attacks         => $a_json->{weapons}{lg}{acc}{attacks},
        a_lg_hits            => $a_json->{weapons}{lg}{acc}{hits},
        a_lg_kills           => $a_json->{weapons}{lg}{kills}{enemy},
        a_lg_deaths          => $a_json->{weapons}{lg}{deaths},
        a_lg_dmg_given       => $a_json->{weapons}{lg}{damage}{enemy},
        a_lg_dmg_taken       => $b_json->{weapons}{lg}{damage}{enemy},
        a_ra                 => $a_json->{items}{ra}{took},
        a_ya                 => $a_json->{items}{ya}{took},
        a_mh                 => $a_json->{items}{health_100}{took},
        a_speed_avg          => round($a_json->{speed}{avg}),

        b_name               => $b_json->{name},
        b_top_color          => $b_json->{'top-color'},
        b_bottom_color       => $b_json->{'bottom-color'},
        b_ping               => $b_json->{ping},
        b_frags              => $b_json->{stats}{frags},
        b_spawn_frags        => $b_json->{stats}{'spawn-frags'},
        b_suicides           => $b_json->{stats}{suicides},
        b_kills              => $b_json->{stats}{kills},
        b_deaths             => $b_json->{stats}{deaths},
        b_spree_max          => $b_json->{spree}{max},
        b_dmg_given          => $b_json->{dmg}{given}, # should it subtract self?
        b_dmg_taken          => $b_json->{dmg}{taken},
        b_rl_attacks         => $b_json->{weapons}{rl}{acc}{attacks},
        b_rl_hits            => $b_json->{weapons}{rl}{acc}{hits},
        b_rl_virtual         => $b_json->{weapons}{rl}{acc}{virtual},
        b_rl_kills           => $b_json->{weapons}{rl}{kills}{enemy}, # what is total and self here?
        b_rl_deaths          => $b_json->{weapons}{rl}{deaths},
        b_rl_dmg_given       => $b_json->{weapons}{rl}{damage}{enemy},
        b_rl_dmg_taken       => $a_json->{weapons}{rl}{damage}{enemy},
        b_lg_attacks         => $b_json->{weapons}{lg}{acc}{attacks},
        b_lg_hits            => $b_json->{weapons}{lg}{acc}{hits},
        b_lg_kills           => $b_json->{weapons}{lg}{kills}{enemy},
        b_lg_deaths          => $b_json->{weapons}{lg}{deaths},
        b_lg_dmg_given       => $b_json->{weapons}{lg}{damage}{enemy},
        b_lg_dmg_taken       => $a_json->{weapons}{lg}{damage}{enemy},
        b_ra                 => $b_json->{items}{ra}{took},
        b_ya                 => $b_json->{items}{ya}{took},
        b_mh                 => $b_json->{items}{health_100}{took},
        b_speed_avg          => round($b_json->{speed}{avg})
    };

    my $record_1 = { %$record_0 }; # shallow copy
    my @ignore = qw{a_win a_loss a_draw};
    for my $key (keys %$record_0) {
        next if (grep {$key eq $_} @ignore);

        my $new_key = $key =~ s/^a_/b_/r;
        if ($new_key eq $key) {
            $new_key = $key =~ s/^b_/a_/r;
        }
        if ($new_key ne $key) {
            $record_1->{$new_key} = $record_0->{$key};
        }
    }

    # $record_1->{a_win} = $record_0->{a_loss};
    # $record_1->{a_loss} = $record_0->{a_win};

    return ($record_0, $record_1);
}

sub prepare_sth_game {
    my $dbh = shift;

    my @columns = @{columns()};
    my $columns_str = join(",", @columns);
    my $vars_str = join(",", map { '$' . $_ } 1 .. scalar(@columns));
    return $dbh->prepare(
        qq{
        INSERT INTO games ($columns_str)
        VALUES ($vars_str);
        });
}

sub columns {
    return [qw{
            date
            map
            hostname
            mode
            tl
            dm
            duration
            demo
            file

            a_name
            a_top_color
            a_bottom_color
            a_ping
            a_frags
            a_spawn_frags
            a_suicides
            a_kills
            a_deaths
            a_spree_max
            a_dmg_given
            a_dmg_taken
            a_rl_attacks
            a_rl_hits
            a_rl_virtual
            a_rl_kills
            a_rl_deaths
            a_rl_dmg_given
            a_rl_dmg_taken
            a_lg_attacks
            a_lg_hits
            a_lg_kills
            a_lg_deaths
            a_lg_dmg_given
            a_lg_dmg_taken
            a_ra
            a_ya
            a_mh
            a_speed_avg

            b_name
            b_top_color
            b_bottom_color
            b_ping
            b_frags
            b_spawn_frags
            b_suicides
            b_kills
            b_deaths
            b_spree_max
            b_dmg_given
            b_dmg_taken
            b_rl_attacks
            b_rl_hits
            b_rl_virtual
            b_rl_kills
            b_rl_deaths
            b_rl_dmg_given
            b_rl_dmg_taken
            b_lg_attacks
            b_lg_hits
            b_lg_kills
            b_lg_deaths
            b_lg_dmg_given
            b_lg_dmg_taken
            b_ra
            b_ya
            b_mh
            b_speed_avg
            }];
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

sub clean_dates {
    my $json = shift;

    my $date = $json->{date};
    if ($date =~ m/Summer Time/) {
        $json->{date} = $date =~ s/Summer Time//r;
    }
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
