DROP TABLE IF EXISTS game_player_weapons;
DROP TABLE IF EXISTS game_players;
DROP TABLE IF EXISTS games;
DROP SEQUENCE IF EXISTS game_player_weapons_id_seq;
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

CREATE SEQUENCE game_player_weapons_id_seq;
CREATE TABLE game_player_weapons
(
  id                   INTEGER PRIMARY KEY DEFAULT nextval('game_player_weapons_id_seq'),
  game_id              INTEGER REFERENCES games (id),
  game_player_id       INTEGER REFERENCES game_players (id),

  weapon               TEXT,
  attacks              INTEGER,
  hits                 INTEGER,
  real                 INTEGER,
  virtual              INTEGER,
  kills_total          INTEGER,
  kills_team           INTEGER,
  kills_enemy          INTEGER,
  kills_self           INTEGER,
  deaths               INTEGER,
  pickups_dropped      INTEGER,
  pickups_taken        INTEGER,
  pickups_total_taken  INTEGER,
  pickups_spawn_taken  INTEGER,
  pickups_spawn_total_taken INTEGER,
  damage_enemy         INTEGER,
  damage_team          INTEGER,

  created_at           TIMESTAMP DEFAULT ( now() AT TIME ZONE 'utc' )
);
