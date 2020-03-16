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
-- $3 Time interval as string, e.g., '4 months'
-- $4 Sorting field name
-- $5 Sorting direction (asc or desc)

WITH duel_player_games AS (
  SELECT
    id AS game_id,
    date AS raw_date,
    --TO_CHAR(NOW() - date, 'DD:HH24:MM:SS') AS date,
    (EXTRACT(EPOCH FROM NOW() - date) / 60)::INTEGER AS minutes_ago,
    --TO_CHAR(NOW() - date, 'MM:SS') AS date,
    map,

    a_name,
    a_frags,
    GREATEST(a_frags,0) / GREATEST(GREATEST(a_frags,0) + GREATEST(b_frags,0), 1) AS a_frag_percent,
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
    GREATEST(b_frags,0) / GREATEST(GREATEST(a_frags,0) + GREATEST(b_frags,0), 1) AS b_frag_percent,
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
    AND date > NOW() AT TIME ZONE 'utc' - INTERVAL $3
    AND mode = 'duel'
    AND dm = 3
)
SELECT *
FROM duel_player_games
ORDER BY
  CASE WHEN $5 = 'desc' THEN
    $4
  END DESC NULLS LAST,
  CASE WHEN $5 = 'asc' THEN
    $4
  END ASC NULLS LAST
-- ORDER BY raw_date DESC
LIMIT $2;
