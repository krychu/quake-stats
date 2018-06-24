DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP SEQUENCE IF EXISTS game_players_id_seq;
DROP SEQUENCE IF EXISTS games_id_seq;

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
  team                 TEXT,

  -- stats
  frags                INTEGER,
  deaths               INTEGER,
  tk                   INTEGER,
  spawn_frags          INTEGER,
  kills                INTEGER,
  suicides             INTEGER,

  -- dmg
  dmg_taken            INTEGER,
  dmg_given            INTEGER,
  dmg_team             INTEGER,
  dmg_self             INTEGER,
  dmg_team_weapons     INTEGER,
  dmg_enemy_weapons    INTEGER,

  xfer                 INTEGER,
  spree_max            INTEGER,
  spree_quad           INTEGER,
  control              REAL,
  speed_max            REAL,
  speed_avg            REAL,

  -- weapons
  axe_attacks          INTEGER,
  axe_hits             INTEGER,
  axe_kills_total      INTEGER,
  axe_kills_team       INTEGER,
  axe_kills_enemy      INTEGER,
  axe_kills_self       INTEGER,
  axe_deaths           INTEGER,
  axe_pickups_dropped  INTEGER,
  axe_pickups_taken    INTEGER,
  axe_dmg_enemy        INTEGER,
  axe_dmg_team         INTEGER,

  sg_attacks           INTEGER,
  sg_hits              INTEGER,
  sg_kills_total       INTEGER,
  sg_kills_team        INTEGER,
  sg_kills_enemy       INTEGER,
  sg_kills_self        INTEGER,
  sg_deaths            INTEGER,
  sg_pickups_dropped   INTEGER,
  sg_pickups_taken     INTEGER,
  sg_dmg_enemy         INTEGER,
  sg_dmg_team          INTEGER,

  gl_attacks           INTEGER,
  gl_hits              INTEGER,
  gl_real              INTEGER,
  gl_virtual           INTEGER,
  gl_kills_total       INTEGER,
  gl_kills_team        INTEGER,
  gl_kills_enemy       INTEGER,
  gl_kills_self        INTEGER,
  gl_deaths            INTEGER,
  gl_pickups_dropped   INTEGER,
  gl_pickups_taken     INTEGER,
  gl_pickups_total_taken INTEGER,
  gl_pickups_spawn_taken INTEGER,
  gl_pickips_spawn_total_taken INTEGER,
  gl_dmg_enemy         INTEGER,
  gl_dmg_team          INTEGER,

  rl_attacks           INTEGER,
  rl_hits              INTEGER,
  rl_real              INTEGER,
  rl_virtual           INTEGER,
  rl_kills_total       INTEGER,
  rl_kills_team        INTEGER,
  rl_kills_enemy       INTEGER,
  rl_kills_self        INTEGER,
  rl_deaths            INTEGER,
  rl_pickups_dropped   INTEGER,
  rl_pickups_taken     INTEGER,
  rl_pickups_total_taken INTEGER,
  rl_pickups_spawn_taken INTEGER,
  rl_pickups_spawn_total_taken INTEGER,
  rl_dmg_enemy         INTEGER,
  rl_dmg_team          INTEGER,

  lg_attacks           INTEGER,
  lg_hits              INTEGER,
  lg_kills_total       INTEGER,
  lg_kills_team        INTEGER,
  lg_kills_enemy       INTEGER,
  lg_kills_self        INTEGER,
  lg_deaths            INTEGER,
  lg_pickups_dropped   INTEGER,
  lg_pickups_taken     INTEGER,
  lg_dmg_enemy         INTEGER,
  lg_dmg_team          INTEGER,

  -- items
  health_15            INTEGER,
  health_25            INTEGER,
  health_100           INTEGER,
  ga                   INTEGER,
  ya                   INTEGER,
  ra                   INTEGER,
  q                    INTEGER,
  q_time               INTEGER,

  created_at           TIMESTAMP DEFAULT ( now() AT TIME ZONE 'utc' )
);
