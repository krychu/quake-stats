-- 1vs1 player list
--
SELECT name, count(*) as game_cnt
FROM game_players
  INNER JOIN games on game_players.game_id = games.id
WHERE mode = 'duel'
  AND dm = 3
GROUP BY name
-- HAVING count(*) > 10
ORDER BY name asc
LIMIT 10000;
