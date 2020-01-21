-- 1vs1 player list.
--
-- Placeholders
-- ------------
-- $1 Time interval as string, e.g., '4 months'

SELECT
  a_name AS name,
  COUNT(*) AS game_cnt,
  ROUND(((COUNT(*) FILTER (WHERE a_frags > b_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS a_win_percent,
  ROUND(((COUNT(*) FILTER (WHERE b_frags > a_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS b_win_percent,
  TO_CHAR(MIN(NOW() - date), 'DD:HH24:MM:SS') as last_game_date
FROM games
WHERE mode = 'duel'
  AND dm = 3
  AND date > NOW() AT TIME ZONE 'utc' - INTERVAL $1
GROUP BY a_name
-- HAVING count(*) > 10 HERE
ORDER BY game_cnt DESC --a_name asc
LIMIT 10000;
