DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP SEQUENCE IF EXISTS game_players_id_seq;
DROP SEQUENCE IF EXISTS games_id_seq;

CREATE TABLE duels
(
  id                   INTEGER PRIMARY KEY DEFAULT nextval('duels_id_seq'),
  date                 TIMESTAMP,
  map                  TEXT,
  hostname             TEXT,
  mode                 TEXT,
  tl                   INTEGER,
  dm                   INTEGER,
  duration             INTEGER,
  demo                 TEXT,
  file                 TEXT,
  created_at           TIMESTAMP DEFAULT ( now() AT TIME ZONE 'utc' ),

  pl_name
);

CREATE SEQUENCE games_id_seq;
CREATE TABLE games
(
  id                   INTEGER PRIMARY KEY DEFAULT nextval('games_id_seq'),
  version              INTEGER,
  date                 TIMESTAMP,
  map                  TEXT,
  hostname             TEXT,
  ip                   TEXT,
  port                 INTEGER,
  mode                 TEXT,
  tl                   INTEGER,
  dm                   INTEGER,
  duration             INTEGER,
  demo                 TEXT,
  file                 TEXT,
  created_at           TIMESTAMP DEFAULT ( now() AT TIME ZONE 'utc' )
);

CREATE SEQUENCE game_players_id_seq;
CREATE TABLE game_players
(
  id                   INTEGER PRIMARY KEY DEFAULT nextval('game_players_id_seq'),
  game_id              INTEGER REFERENCES games (id),
  top_color            INTEGER,
  bottom_color         INTEGER,
  ping                 INTEGER,
  name                 TEXT,
  -- team                 TEXT,

  -- stats
  frags                INTEGER,
  deaths               INTEGER,
  -- tk                   INTEGER,
  spawn_frags          INTEGER,
  kills                INTEGER,
  suicides             INTEGER,

  -- dmg
  damage_taken         INTEGER,
  damage_given         INTEGER,
  --damage_team          INTEGER,
  damage_self          INTEGER,
  -- dmg_team_weapons     INTEGER,
  -- dmg_enemy_weapons    INTEGER,

  -- xfer                 INTEGER,
  spree_max            INTEGER,
  spree_quad           INTEGER,
  control              REAL,
  speed_max            REAL,
  speed_avg            REAL,

  -- items
  health_15            INTEGER,
  health_25            INTEGER,
  health_100           INTEGER,
  ga                   INTEGER,
  ya                   INTEGER,
  ra                   INTEGER,
  q                    INTEGER,
  q_time               INTEGER,

  -- weapons
  sg_attacks           INTEGER,
  sg_direct_hits       INTEGER,
  sg_kills             INTEGER,
  sg_deaths            INTEGER,
  sg_damage            INTEGER,

  gl_attacks           INTEGER,
  gl_direct_hits       INTEGER,
  gl_effective_hits    INTEGER,
  gl_kills             INTEGER,
  -- gl_kills_owner       INTEGER,
  gl_deaths            INTEGER,
  gl_picked            INTEGER,
  -- gl_dropped           INTEGER,
  gl_damage            INTEGER,

  rl_attacks           INTEGER,
  rl_direct_hits       INTEGER,
  rl_effective_hits    INTEGER,
  rl_kills             INTEGER,
  rl_deaths            INTEGER,
  rl_picked            INTEGER,
  rl_damage            INTEGER,


  lg_attacks           INTEGER,
  lg_direct_hits       INTEGER,
  lg_kills             INTEGER,
  lg_deaths            INTEGER,
  lg_picked            INTEGER,
  lg_damage            INTEGER,

  created_at           TIMESTAMP DEFAULT ( now() AT TIME ZONE 'utc' )
);

