#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Configuration qw($cfg);
use PG;
use File::Slurp;
use Syntax::Keyword::Try;
use JSON::Parse qw(json_file_to_perl);
use Log::Any '$log', prefix => '[import_sample_data] ';

#$| = 1;
STDOUT->autoflush(1);

my $dbh = PG::get_dbh();

# List json files with absolute paths (prefix => 1)
my @files = grep(/\.json$/, read_dir($cfg->{sample_data}, prefix => 1));

my ($ok, $bad) = (0, 0);
for my $i (0 .. $#files) {
    print('.') if $i % 100 == 0;
    my $r = insert_file($files[$i]);
    $r == 1 ? $ok++ : $bad++;
}
print("\n$ok files read successfully, $bad files skept\n");

sub insert_file {
    my $path = shift;

    try {
        my $json = json_file_to_perl($path);
        my $pg_game_id = insert_game($json);
        map {insert_player($_, $pg_game_id)} @{$json->{players}};
    } catch {
        return 0;
    }
    #for $player (@{$json->{players}})

    return 1;
}

sub insert_game {
    my $json = shift;
    my $row = $dbh->selectrow_hashref(
        q{
        INSERT INTO games (
          version,
          date,
          map,
          hostname,
          ip,
          port,
          mode,
          tl,
          dm,
          duration,
          demo
        )
        VALUES(?,?::timestamptz,?,?,?,?,?,?,?,?,?)
        RETURNING id;
        }, undef,
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
        $json->{demo}
        );

    if (!$row) {
        die "implement error handling: $@";
    }

    return $row->{id};
}

sub insert_player {
    my ($player, $pg_game_id) = @_;

    my $rv = $dbh->do(
        q{
        INSERT INTO game_players(
          game_id,
          top_color,
          bottom_color,
          ping,
          name,

          frags,
          deaths,
          spawn_frags,
          kills,
          suicides,

          damage_taken,
          damage_given,
          damage_self,

          spree_max,
          spree_quad,
          control,
          speed_max,
          speed_avg,

          health_15,
          health_25,
          health_100,
          ga,
          ya,
          ra,
          q,
          q_time,

          sg_attacks,
          sg_direct_hits,
          sg_kills,
          sg_deaths,
          sg_damage,

          gl_attacks,
          gl_direct_hits,
          gl_effective_hits,
          gl_kills,
          gl_deaths,
          gl_picked,
          gl_damage,

          rl_attacks,
          rl_direct_hits,
          rl_effective_hits,
          rl_kills,
          rl_deaths,
          rl_picked,
          rl_damage,

          lg_attacks,
          lg_direct_hits,
          lg_kills,
          lg_deaths,
          lg_picked,
          lg_damage
        )
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);
        }, undef,
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
        $player->{spped}->{avg},

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
