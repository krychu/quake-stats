#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Mojolicious::Lite;
use Proc::Find;
use PG;
use Status;

get '/1vs1' => sub {
    my $c = shift;
    $c->render(template => '1vs1index');
};

get '/1vs1/:player' => sub {
    my $c = shift;
    $c->render(template => '1vs1');
};

get '/status' => sub {
    my $c = shift;

    $c->stash(
        status_webapp      => Status::status_webapp(),
        status_statscraper => Status::status_statscraper(),
        status_ingestion   => Status::status_ingestion(),
        game_cnt           => Status::game_cnt(),
        game_cnt_24h       => Status::game_cnt(24),
        game_cnt_1h        => Status::game_cnt(1),
        servers            => Status::servers(),
        servers_24h        => Status::servers(24),
        servers_1h         => Status::servers(1),
        );

    $c->render(template => 'status');
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

    <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">

    <link rel="manifest" href="/favicon/site.webmanifest">
    <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#ffffff">
    <link rel="apple-touch-icon" sizes="192x192" href="/favicon/apple-touch-icon.png">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="/favicon/browserconfig.xml">

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

    <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">

    <link rel="manifest" href="/favicon/site.webmanifest">
    <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#ffffff">
    <link rel="apple-touch-icon" sizes="192x192" href="/favicon/apple-touch-icon.png">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="/favicon/browserconfig.xml">

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

@@ status.html.ep

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Quake World Stats - Status</title>
    <link href="https://fonts.googleapis.com/css?family=Inconsolata|Audiowide|Bree+Serif|Odibee+Sans|Titillium+Web&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/status.css"/>

    <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">

    <link rel="manifest" href="/favicon/site.webmanifest">
    <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#ffffff">
    <link rel="apple-touch-icon" sizes="192x192" href="/favicon/apple-touch-icon.png">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-config" content="/favicon/browserconfig.xml">

  </head>
  <body>

    <div id="status-container">

      <h2>QuakeStats Status</h2>

      <div class="status-line">
        <div class="status-line__name">total games</div>
        <div class="status-line__value"><%= $game_cnt %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">added in last 1h</div>
        <div class="status-line__value"><%= $game_cnt_1h %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">added in last 24h</div>
        <div class="status-line__value"><%= $game_cnt_24h %></div>
      </div>

      <div class="status-line-separator"></div>

      <div class="status-line">
        <div class="status-line__name">webapp</div>
        <div class="status-line__value <%= $status_webapp eq 'running' ? 'status-line__value--green' : 'status-line__value--red' %>"><%= $status_webapp %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">statscraper</div>
        <div class="status-line__value <%= $status_statscraper eq 'running' ? 'status-line__value--green' : 'status-line__value--red' %>"><%= $status_statscraper %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">ingestion</div>
        <div class="status-line__value <%= $status_ingestion eq 'running' ? 'status-line__value--green' : 'status-line__value--red' %>"><%= $status_ingestion %></div>
      </div>

      <h2>Servers</h2>

% for my $server (@$servers) {
      <div class="server-line">
        <div class="server-line__host"><%= $server->{hostname} %></div>
        <div class="server-line__game-cnt"><%= $server->{game_cnt} %></div>
        <div class="server-line__game-cnt"><%= $servers_24h->{$server->{game_cnt}} %></div>
        <div class="server-line__game-cnt"><%= $servers_1h->{$server->{game_cnt}} %></div>
      </div>
% }

    </div>

  </body>
</html>
