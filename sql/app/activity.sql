-- Recent duel games.
--
-- Placeholders
-- ------------
-- $1 Game count
--

SELECT
id AS game_id,
date AS raw_date,
TO_CHAR(NOW() - date, 'DD:HH24:MM:SS') AS date,
map,

a_name,
a_frags,

b_name,
b_frags
FROM games
WHERE
dm = 3
AND mode = 'duel'
ORDER BY date DESC
LIMIT $1;
