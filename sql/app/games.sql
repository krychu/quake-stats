-- Recent games
--
-- Description
-- -----------
-- Recent duel games for the player. Each game is a single row.
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Game count
--

SELECT
  id AS game_id,
  date AS raw_date,
  TO_CHAR(NOW() - date, 'DD:HH24:MM:SS') AS date,
  map,

  a_name,
  a_frags,
  ROUND((a_dmg_given::FLOAT / GREATEST(a_dmg_given + a_dmg_taken, 1)) * 100) AS a_dmg_percent,
  ROUND(a_rl_dmg_given::FLOAT / tl) AS a_rl_dmg_minute,
  ROUND(a_lg_dmg_given::FLOAT / tl) AS a_lg_dmg_minute,
  ROUND((a_lg_hits::FLOAT / a_lg_attacks) * 100) AS a_lg_acc_percent,
  COALESCE(a_ra, 0) AS a_ra,
  COALESCE(a_ya, 0) AS a_ya,
  COALESCE(a_mh, 0) AS a_mh,
  a_speed_avg,

  b_name,
  b_frags,
  ROUND((b_dmg_given::FLOAT / GREATEST(a_dmg_given + a_dmg_taken, 1)) * 100) AS b_dmg_percent,
  ROUND(b_rl_dmg_given::FLOAT / tl) AS b_rl_dmg_minute,
  ROUND(b_lg_dmg_given::FLOAT / tl) AS b_lg_dmg_minute,
  ROUND((b_lg_hits::FLOAT / b_lg_attacks) * 100) AS b_lg_acc_percent,
  COALESCE(b_ra, 0) AS b_ra,
  COALESCE(b_ya, 0) AS b_ya,
  COALESCE(b_mh, 0) AS b_mh,
  b_speed_avg
FROM games
WHERE
  a_name = $1
  AND dm = 3
  AND mode = 'duel'
ORDER BY date DESC
LIMIT $2;
