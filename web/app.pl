#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Mojolicious::Lite;
use PG;

get '/' => sub {
    my $c = shift;
    $c->stash(player => "Locust");
    $c->render(template => 'main');
    #$c->render(text => 'Hello World!');
};

get '/api/1vs1/:player/games/:cnt' => sub {
    my $c = shift;
    my $player = $c->stash('player');
    my $game_cnt = $c->stash('cnt');
    my $games = PG::get_games($player, $game_cnt);
    $c->render(json => $games);
};

app->start;

__DATA__

@@ main.html.ep

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Quake World Stats</title>
    <link rel="stylesheet" href="app.css"/>
  </head>
  <body>
    <script>
      const PAGE = 'duel_player';
      const SV_PLAYER = '<%= $player %>';
    </script>

    <div id="main">
      <div id="1vs1-games-chart"></div>
      <div id="1vs1-performance"></div>
      <div id="1vs1-development"></div>
    </div>

    <script type="module" src="app.js"></script>
  </body>
</html>
