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
        insert_stat_files($abs_paths, $sth_game);
        # my $abs_paths = get_stat_abs_paths($data_dir);
        # insert_stat_files($abs_paths, $sth_game);
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

    #my $sth_game = $dbh->prepare(scalar(read_file('../sql/app/insert_game.sql')));
    #my $sth_game_player = $dbh->prepare(scalar(read_file('../sql/app/insert_game_player.sql')));
    my $sth_game = prepare_sth_game($dbh);
    return ($dbh, $sth_game);
}

sub finish_dbh {
    my ($dbh, $sth_game) = @_;

    $sth_game->finish or die "Cannot finish the game statement";
    $dbh->disconnect or die "Disconnection error: $DBI::errstr\n";
}

sub insert_stat_files {
    my ($abs_paths, $sth_game) = @_;

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
        decode_names($txt);

        # json pre-processing
        my $json = parse_json($txt);
        clean_dates($json);

        my $file = basename($abs_path);
        last if is_already_added($dbh, $file, $json);

        my ($record_0, $record_1) = prepare_records($json, $file);
        insert_game($record_0, $record_1, $file, $sth_game);

        $cnt++;
    }
    $log->info("New stat files added: $cnt, files skept: $skip_cnt (unsupported format)\n");
}

sub insert_game {
    my ($record_0, $record_1, $file, $sth_game) = @_;

    for my $r ($record_0, $record_1) {
        $sth->execute(
            @{$r}{
                qw(date
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
                   b_bottom_color)}
            );
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
        file                 => $json->{file},

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
        a_speed_avg          => $a_json->{speed}{avg},

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
        b_speed_avg          => $b_json->{speed}{avg}
    }
}

sub prepare_sth_game {
    return $dbh->prepare(
        q{
        INSERT INTO games (
          date,
          map,
          hostname,
          mode,
          tl,
          dm,
          duration,
          demo,
          file,

          a_name,
          a_top_color,
          a_bottom_color,
          a_ping,
          a_frags,
          a_spawn_frags,
          a_suicides,
          a_kills,
          a_deaths,
          a_spree_max,
          a_dmg_given,
          a_dmg_taken,
          a_rl_attacks,
          a_rl_hits,
          a_rl_virtual,
          a_rl_kills,
          a_rl_deaths,
          a_rl_dmg_given,
          a_rl_dmg_taken,
          a_lg_attacks,
          a_lg_hits,
          a_lg_kills,
          a_lg_deaths,
          a_lg_dmg_given,
          a_lg_dmg_taken,
          a_ra,
          a_ya,
          a_mh,
          a_speed_avg,

          b_name,
          b_top_color,
          b_bottom_color,
          b_ping,
          b_frags,
          b_spawn_frags,
          b_suicides,
          b_kills,
          b_deaths,
          b_spree_max,
          b_dmg_given,
          b_dmg_taken,
          b_rl_attacks,
          b_rl_hits,
          b_rl_virtual,
          b_rl_kills,
          b_rl_deaths,
          b_rl_dmg_given,
          b_rl_dmg_taken,
          b_lg_attacks,
          b_lg_hits,
          b_lg_kills,
          b_lg_deaths,
          b_lg_dmg_given,
          b_lg_dmg_taken,
          b_ra,
          b_ya,
          b_mh,
          b_speed_avg
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67);
        });
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

sub clean_dates {
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
