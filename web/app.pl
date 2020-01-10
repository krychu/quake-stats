#!/usr/bin/env perl

use strict;
use warnings;
use lib "../src";
use Mojolicious::Lite;
use Proc::Find;
use PG;
use Status;

get '/' => sub {
    my $c = shift;
    $c->redirect_to('/1vs1');
};

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

    my $servers = Status::servers(24, 1);
    my $game_cnts = Status::agg_game_cnts($servers);

    $c->stash(
        status_webapp      => Status::status_webapp(),
        status_statscraper => Status::status_statscraper(),
        status_ingestion   => Status::status_ingestion(),
        servers            => $servers,
        game_cnts          => $game_cnts,
        file_cnt           => Status::file_cnt(),
        disk_space         => Status::disk_space(),
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

    <div id="status-container">

      <h2>QuakeStats Status</h2>

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

      <div class="status-line-separator"></div>

      <div class="status-line">
        <div class="status-line__name">file count</div>
        <div class="status-line__value"><%= $file_cnt %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">disk space</div>
        <div class="status-line__value"><%= $disk_space %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">total games</div>
        <div class="status-line__value"><%= $game_cnts->{total} %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">added in last 24h</div>
        <div class="status-line__value"><%= $game_cnts->{24} %></div>
      </div>

      <div class="status-line">
        <div class="status-line__name">added in last 1h</div>
        <div class="status-line__value"><%= $game_cnts->{1} %></div>
      </div>

      <!-- <h2>Servers</h2> -->

      <div class="status-line-separator"></div>

      <div class="server-line server-line--header">
        <div class="server-line__host">server</div>
        <div class="server-line__game-cnt server-line--header">total</div>
        <div class="server-line__game-cnt server-line--header">24h</div>
        <div class="server-line__game-cnt server-line--header">1h</div>
      </div>

% for my $hostname (keys %$servers) {
      <div class="server-line">
        <div class="server-line__host"><%= $hostname %></div>
        <div class="server-line__game-cnt"><%= $servers->{$hostname}->{total} %></div>
        <div class="server-line__game-cnt"><%= $servers->{$hostname}->{24} %></div>
        <div class="server-line__game-cnt"><%= $servers->{$hostname}->{1} %></div>
      </div>
% }

    </div>

  </body>
</html>
