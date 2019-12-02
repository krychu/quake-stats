-- top level stats

/* Query executed on 8 May 2019 at 22:07:57 */
/* Query executed on 6 May 2019 at 23:23:35 */


WITH game_ids AS (
	SELECT games.id, COUNT(DISTINCT(games.id)) as game_cnt
	FROM games
		INNER JOIN game_players ON games.id = game_players.game_id
	WHERE name = 'bps'
		AND dm = 3
		AND mode = 'duel'
	GROUP BY games.id
	ORDER BY date DESC
	LIMIT 100
), asd AS (
	SELECT
		game_id,
		ROUND(CAST((SUM(GREATEST(frags,0)) FILTER (WHERE name = 'bps'))::FLOAT / NULLIF(SUM(GREATEST(frags, 0)), 0) as NUMERIC), 2) as frags_proportion,
		ROUND(CAST((SUM(damage_given) FILTER (WHERE name = 'bps'))::FLOAT / NULLIF(SUM(damage_given), 0) as NUMERIC), 2) as damage_proportion,
		ROUND(CAST((SUM(damage_given) FILTER (WHERE name = 'bps'))::FLOAT / NULLIF(SUM(damage_taken) FILTER (WHERE name = 'bps'), 0) as NUMERIC), 2) as given_taken,
		SUM(damage_given) FILTER (WHERE name = 'bps') as damage_given,
		SUM(damage_taken) FILTER (WHERE name = 'bps') as damage_taken,
		SUM(frags) FILTER (WHERE name = 'bps') as frags_a,
		SUM(frags) FILTER (WHERE name != 'bps') as frags_b
	FROM game_players
	WHERE game_id IN ( SELECT id FROM game_ids )
	GROUP BY game_id
)
SELECT * FROM asd limit 10;
