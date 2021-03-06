DROP TABLE IF EXISTS games;
DROP SEQUENCE IF EXISTS games_id_seq;

-- Important note: each game is two rows, each with players swapped. This is so
-- that you can query for a_name = X rows and get all games of player X.
CREATE SEQUENCE games_id_seq;
CREATE TABLE games
(
  id                   INTEGER PRIMARY KEY DEFAULT nextval('games_id_seq'),
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

  -- player a
  a_name               TEXT,
  a_top_color          INTEGER,
  a_bottom_color       INTEGER,
  a_ping               INTEGER,
  a_frags              INTEGER,
  a_spawn_frags        INTEGER,
  a_suicides           INTEGER,
  a_kills              INTEGER,
  a_deaths             INTEGER,
  a_spree_max          INTEGER,
  a_dmg_given          INTEGER,
  a_dmg_taken          INTEGER,
  a_rl_attacks         INTEGER,
  a_rl_hits            INTEGER,
  a_rl_virtual         INTEGER,
  a_rl_kills           INTEGER,
  a_rl_deaths          INTEGER,
  a_rl_dmg_given       INTEGER,
  a_rl_dmg_taken       INTEGER,
  a_lg_attacks         INTEGER,
  a_lg_hits            INTEGER,
  a_lg_kills           INTEGER,
  a_lg_deaths          INTEGER,
  a_lg_dmg_given       INTEGER,
  a_lg_dmg_taken       INTEGER,
  a_ra                 INTEGER,
  a_ya                 INTEGER,
  a_mh                 INTEGER,
  a_speed_avg          INTEGER,

  -- player b
  b_name               TEXT,
  b_top_color          INTEGER,
  b_bottom_color       INTEGER,
  b_ping               INTEGER,
  b_frags              INTEGER,
  b_spawn_frags        INTEGER,
  b_suicides           INTEGER,
  b_kills              INTEGER,
  b_deaths             INTEGER,
  b_spree_max          INTEGER,
  b_dmg_given          INTEGER,
  b_dmg_taken          INTEGER,
  b_rl_attacks         INTEGER,
  b_rl_hits            INTEGER,
  b_rl_virtual         INTEGER,
  b_rl_kills           INTEGER,
  b_rl_deaths          INTEGER,
  b_rl_dmg_given       INTEGER,
  b_rl_dmg_taken       INTEGER,
  b_lg_attacks         INTEGER,
  b_lg_hits            INTEGER,
  b_lg_kills           INTEGER,
  b_lg_deaths          INTEGER,
  b_lg_dmg_given       INTEGER,
  b_lg_dmg_taken       INTEGER,
  b_ra                 INTEGER,
  b_ya                 INTEGER,
  b_mh                 INTEGER,
  b_speed_avg          INTEGER
);
