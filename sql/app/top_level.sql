-- Top level player's stats.
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Time interval as string, e.g., '4 months'
--

SELECT
  COUNT(*) AS game_cnt,
  COUNT(DISTINCT b_name) AS opponent_cnt,
  ROUND(((COUNT(*) FILTER (WHERE a_frags > b_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS win_percent,
  ROUND(AVG(a_frags::FLOAT / GREATEST((a_frags + b_frags), 1)) * 100) AS avg_frag_percent,
  ROUND(SUM(a_frags)::NUMERIC / GREATEST(SUM(tl), 1), 1) AS avg_fpm,
  ROUND(SUM(a_kills)::NUMERIC / GREATEST(SUM(a_deaths), 1), 1) AS avg_kd,
  ROUND(AVG(a_lg_hits::NUMERIC / GREATEST(a_lg_attacks, 1)) * 100, 1) AS avg_lg_acc_percent,
  mode() WITHIN GROUP (ORDER BY map) AS most_frequent_map
FROM games
WHERE
  a_name = $1
  AND date > NOW() AT TIME ZONE 'utc' - INTERVAL $2
  AND mode = 'duel'
  AND dm = 3;
