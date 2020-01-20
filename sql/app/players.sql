-- 1vs1 player list
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Time interval as string, e.g., '4 months'

SELECT
  name,
  COUNT(*) as game_cnt,
  ROUND(((COUNT(*) FILTER (WHERE a_frags > b_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS a_win_percent,
  ROUND(((COUNT(*) FILTER (WHERE b_frags > a_frags))::FLOAT / GREATEST(COUNT(*), 1)) * 100) AS b_win_percent,
  TO_CHAR(MIN(NOW() - date), 'DD:HH24:MM:SS') as last_game_date
FROM games
WHERE mode = 'duel'
  AND dm = 3
GROUP BY a_name
-- HAVING count(*) > 10 HERE
ORDER BY name asc
LIMIT 10000;
