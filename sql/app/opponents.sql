-- Top opponents
--
-- Description
-- -----------
-- Top opponents for the player. One opponent per row with all related stats.
-- The stats are averages across games against the opponent.
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Time interval as string, e.g., '4 months'
--

SELECT
  b_name AS name,
  COUNT(*) AS game_cnt,

  ROUND(((COUNT(*) FILTER (WHERE a_frags > b_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS a_win_percent,
  ROUND(((COUNT(*) FILTER (WHERE b_frags > a_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS b_win_percent,
  ROUND(AVG(a_frags::FLOAT / GREATEST((a_frags + b_frags), 1)) * 100) AS a_avg_frag_percent,
  ROUND(AVG(b_frags::FLOAT / GREATEST((a_frags + b_frags), 1)) * 100) AS b_avg_frag_percent,
  ROUND(AVG(a_dmg_given::FLOAT / GREATEST((a_dmg_given + b_dmg_given), 1)) * 100) AS a_avg_dmg_percent,
  ROUND(AVG(b_dmg_given::FLOAT / GREATEST((a_dmg_given + b_dmg_given), 1)) * 100) AS b_avg_dmg_percent,
  ROUND(AVG(a_lg_hits::FLOAT / GREATEST(a_lg_attacks, 1)) * 100) AS a_avg_lg_acc_percent,
  ROUND(AVG(b_lg_hits::FLOAT / GREATEST(b_lg_attacks, 1)) * 100) AS b_avg_lg_acc_percent,

  mode() WITHIN GROUP (ORDER BY map) AS most_frequent_map
FROM games
WHERE
  a_name = $1
  AND date > NOW() AT TIME ZONE 'utc' - INTERVAL $2
  AND mode = 'duel'
  AND dm = 3
GROUP BY
  b_name
ORDER BY b_win_percent DESC;
