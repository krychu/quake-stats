#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Mojolicious::Lite;
use PG;

get '/1vs1' => sub {
    my $c = shift;
    $c->render(template => '1vs1index');
};

get '/1vs1/:player' => sub {
    my $c = shift;
    $c->render(template => '1vs1');
};

# API

# Players
get '/api/1vs1/players' => sub {
    my $c = shift;
    my $players = PG::get_players();
    $c->render(json => $players);
};

# Recent games
get '/api/1vs1/:player/games/:cnt' => sub {
    my $c = shift;
    my $player = $c->stash('player');
    my $game_cnt = $c->stash('cnt');
    my $games = PG::get_games($player, $game_cnt);
    $c->render(json => $games);
};

# Opponents
get '/api/1vs1/:player/opponents' => sub {
    my $c = shift;
    my $player = $c->stash('player');
    my $interval_str = '4 months';
    my $opponents = PG::get_opponents($player, $interval_str);
    $c->render(json => $opponents);
};

# Maps
get '/api/1vs1/:player/maps' => sub {
    my $c = shift;
    my $player = $c->stash('player');
    my $interval_str = '4 months';
    my $maps = PG::get_maps($player, $interval_str);
    $c->render(json => $maps);
};

app->start;

__DATA__

@@ 1vs1index.html.ep

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Quake World Stats</title>
    <link href="https://fonts.googleapis.com/css?family=Inconsolata|Audiowide|Bree+Serif|Odibee+Sans|Titillium+Web&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/app.css"/>
  </head>
  <body>
    <script>
      const PAGE = 'duel_players';
    </script>

    <div id="main" class="main--players">
      <div id="players">duel</div>
    </div>

    <script type="module" src="/app.js"></script>
  </body>
</html>

@@ 1vs1.html.ep

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Quake World Stats</title>
    <link href="https://fonts.googleapis.com/css?family=Inconsolata|Audiowide|Bree+Serif|Odibee+Sans|Titillium+Web&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/app.css"/>
  </head>
  <body>
    <script>
      const PAGE = 'duel_player';
      const SV_PLAYER = '<%= $player %>';
    </script>

    <div id="main">
      <div id="player"><a href="/1vs1">duel</a> / <%= $player %></div>
    </div>

    <script type="module" src="/app.js"></script>
  </body>
</html>
