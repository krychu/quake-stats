-- 1vs1 player list.
--
-- Placeholders
-- ------------
-- $1 Time interval as string, e.g., '4 months'
-- $2 Sorting field name
-- $3 Sort direction (asc or desc)

WITH duel_players AS (
  SELECT
    a_name AS name,
    COUNT(*) AS game_cnt,
    COUNT(DISTINCT b_name) AS opponent_cnt,
    ROUND(((COUNT(*) FILTER (WHERE a_frags > b_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS a_win_percent,
    ROUND(((COUNT(*) FILTER (WHERE b_frags > a_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS b_win_percent,
    ROUND(AVG(a_lg_hits::NUMERIC / GREATEST(a_lg_attacks, 1)) * 100, 1) AS avg_lg_acc_percent,
    GREATEST(ROUND(AVG(a_frags::FLOAT / GREATEST((a_frags + b_frags), 1)) * 100), 0) AS avg_frag_percent,
    (MIN(EXTRACT(EPOCH FROM NOW() - date) / 60))::INTEGER AS last_game_minutes_ago
    --TO_CHAR(MIN(NOW() - date), 'DD:HH24:MM:SS') as last_game_date
  FROM games
  WHERE mode = 'duel'
    AND dm = 3
    AND date > NOW() AT TIME ZONE 'utc' - INTERVAL $1
  GROUP BY a_name
  LIMIT 1000
)
SELECT *
FROM duel_players
ORDER BY
  CASE WHEN $3 = 'desc' THEN
    $2
  END DESC NULLS LAST,
  CASE WHEN $3 = 'asc' THEN
    $2
  END ASC
  NULLS LAST;

