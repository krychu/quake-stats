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

get '/1vs1/*player' => sub {
    my $c = shift;
    $c->render(template => '1vs1');
};

get '/status' => sub {
    my $c = shift;

    my $game_cnts = Status::game_cnts(24, 1);
    my $agg_game_cnts = Status::agg_game_cnts($game_cnts);

    $c->stash(
        run_status         => Status::run_status(),
        game_cnts          => $game_cnts,
        agg_game_cnts      => $agg_game_cnts,
        disk_usage         => Status::disk_usage(24, 1),
        );

    $c->render(template => 'status');
};

# API

# Main: Activity
get '/api/1vs1/activity' => sub {
    my $c = shift;
    my $activity = PG::get_activity();
    return $c->render(json => $activity);
};

# Main: Players
post '/api/1vs1/players' => sub {
    my $c = shift;
    my $time_period = $c->param("time_period");
    my $sort_column_name = $c->param("sort_column_name");
    my $pg_sort_field = {
        player      => "name",
        games       => "game_cnt",
        opponents   => "opponent_cnt",
        winrate     => "a_win_percent",
        frags       => "avg_frag_percent",
        "lg hits"   => "avg_lg_acc_percent",
        last        => "last_game_date"
    }->{$sort_column_name};
    my $sort_direction = $c->param("sort_direction");
    my $players = PG::get_players($time_period, $pg_sort_field, $sort_direction);
    $c->render(json => $players);
};

# Player: Top-level stats
post '/api/1vs1/:player/top' => sub {
    my $c = shift;
    my $time_period = $c->param("time_period");
    my $player = $c->stash('player');
    my $top = PG::get_top($player, $time_period);
    $c->render(json => $top);
};

# Player: Games
post '/api/1vs1/:player/games/:cnt' => sub {
    my $c = shift;
    my $time_period = $c->param("time_period");
    my $sort_column_name = $c->param("sort_column_name");
    my $pg_sort_field = {
        when       => "raw_date",
        frags      => "a_frags",
        opponent   => "b_name",
        map        => "map",
        dmg        => "a_dmg_percent",
        "rl/min"   => "a_rl_dmg_minute",
        "lg/min"   => "a_lg_dmg_minute",
        "lg acc"   => "a_lg_acc_percent",
        ra         => "a_ra",
        ya         => "a_ya",
        mh         => "a_mh"
    }->{$sort_column_name};
    my $sort_direction = $c->param("sort_direction");
    my $player = $c->stash('player');
    my $game_cnt = $c->stash('cnt');
    my $games = PG::get_games($player, $game_cnt, $time_period, $pg_sort_field, $sort_direction);
    $c->render(json => $games);
};

# Player: Opponents
post '/api/1vs1/:player/opponents' => sub {
    my $c = shift;
    my $time_period = $c->param("time_period");
    my $sort_column_name = $c->param("sort_column_name");
    my $pg_sort_field = {
        opponent   => "name",
        games      => "game_cnt",
        winrate    => "a_win_percent",
        frags      => "a_avg_frag_percent",
        dmg        => "a_avg_dmg_percent",
        "lg acc"   => "a_avg_lg_acc_percent",
        "fq map"   => "most_frequent_map"
    }->{$sort_column_name};
    my $sort_direction = $c->param("sort_direction");
    my $player = $c->stash('player');
    my $opponents = PG::get_opponents($player, $time_period, $pg_sort_field, $sort_direction);
    $c->render(json => $opponents);
};

# Player: Maps
post '/api/1vs1/:player/maps' => sub {
    my $c = shift;
    my $time_period = $c->param("time_period");
    my $sort_column_name = $c->param("sort_column_name");
    my $pg_sort_field = {
        map        => "map",
        games      => "game_cnt",
        opponents  => "opponent_cnt",
        winrate    => "a_win_percent",
        frags      => "a_avg_frag_percent",
        dmg        => "a_avg_dmg_percent",
        "dmg/min"  => "a_avg_dmg_minute"
    }->{$sort_column_name};
    my $sort_direction = $c->param("sort_direction");
    my $player = $c->stash('player');
    my $maps = PG::get_maps($player, $time_period, $pg_sort_field, $sort_direction);
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
  <body class="theme-krychu">
    <script>
      const PAGE = 'duel_players';
    </script>

    <div id="main">
      <div id="main__title">duel</div>
      <div id="main__activity"></div>
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
  <body class="theme-krychu">
    <script>
      const PAGE = 'duel_player';
      const SV_PLAYER = '<%= $player %>';
    </script>

    <div id="main">
      <div id="main__title"><a href="/1vs1">duel</a> / <%= $player %></div>
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

      <h3># Processes</h3>
% for my $run_script ('run_webapp', 'run_ingest', 'run_scrape_qtv', 'run_scrape_badplace', 'run_scrape_quake1pl') {
      <div class="status-line">
        <div class="status-line__name"><%= $run_script =~ s/run_//r %></div>
        <div class="status-line__value <%= $run_status->{$run_script} eq 'running' ? 'status-line__value--green' : 'status-line__value--red' %>"><%= $run_status->{$run_script} %></div>
      </div>
% }

      <h3># Scrape (disk)</h3>

      <div class="scraper-line scraper-line--header">
        <div class="scraper-line__name">data path</div>
        <div class="scraper-line__value scraper-line--header">total files</div>
        <div class="scraper-line__value scraper-line--header">24h</div>
        <div class="scraper-line__value scraper-line--header">1h</div>
        <div class="scraper-line__value scraper-line--header">size (MB)</div>
      </div>

% for my $data_path (grep {$_ ne 'total'} sort(keys(%$disk_usage))) {
      <div class="scraper-line">
        <div class="scraper-line__name"><%= $data_path %></div>
        <div class="scraper-line__value"><%= $disk_usage->{$data_path}->{file_cnt} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{$data_path}->{24} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{$data_path}->{1} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{$data_path}->{size} %></div>
      </div>
% }

      <div class="scraper-line scraper-line--avg">
        <div class="scraper-line__name">total</div>
        <div class="scraper-line__value"><%= $disk_usage->{total}->{file_cnt} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{total}->{24} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{total}->{1} %></div>
        <div class="scraper-line__value"><%= $disk_usage->{total}->{size} %></div>
      </div>

      <h3># Ingest (db)</h3>

      <div class="server-line server-line--header">
        <div class="server-line__host">server</div>
        <div class="server-line__game-cnt server-line--header">total games</div>
        <div class="server-line__game-cnt server-line--header">24h</div>
        <div class="server-line__game-cnt server-line--header">1h</div>
      </div>

% for my $hostname (sort keys %$game_cnts) {
      <div class="server-line">
        <div class="server-line__host"><%= $hostname %></div>
        <div class="server-line__game-cnt"><%= $game_cnts->{$hostname}->{total} %></div>
        <div class="server-line__game-cnt"><%= $game_cnts->{$hostname}->{24} %></div>
        <div class="server-line__game-cnt"><%= $game_cnts->{$hostname}->{1} %></div>
      </div>
% }

      <div class="server-line server-line--avg">
        <div class="server-line__host">total</div>
        <div class="server-line__game-cnt"><%= $agg_game_cnts->{total} %></div>
        <div class="server-line__game-cnt"><%= $agg_game_cnts->{24} %></div>
        <div class="server-line__game-cnt"><%= $agg_game_cnts->{1} %></div>
      </div>


    </div>

  </body>
</html>
