WITH recent_games AS (
	SELECT
		game_id,
		map,
		name AS name_a,
		frags,
		lg_direct_hits,
		lg_attacks,
		damage_given,
		tl
	FROM games INNER JOIN game_players ON games.id = game_players.game_id
	WHERE name = 'speedball'
		AND date > DATE('2017-11-01') - INTERVAL '3 months'
	ORDER BY date DESC
), duels AS (
	SELECT
		CASE WHEN recent_games.frags > game_players.frags THEN 1 ELSE 0 END as win,
		CASE WHEN recent_games.frags < game_players.frags THEN 1 ELSE 0 END as loss,
		recent_games.frags::FLOAT / GREATEST( recent_games.frags + game_players.frags, 1 ) as frag_proportion,
		recent_games.lg_direct_hits::FLOAT / GREATEST( recent_games.lg_attacks, 1 ) as lg_accuracy,
		recent_games.damage_given::FLOAT / GREATEST( recent_games.damage_given + game_players.damage_given, 1 ) as dmg_proportion,
		recent_games.damage_given::FLOAT / tl as dmg_per_minute,
		name as name_b,
		map
	FROM recent_games INNER JOIN game_players ON recent_games.game_id = game_players.game_id
	WHERE name != name_a
), maps AS (
	SELECT
		map,
		count(*) AS game_cnt,
		SUM(win) AS win_cnt,
		SUM(loss) AS loss_cnt,
		ROUND(AVG(frag_proportion)::numeric, 3)::TEXT AS avg_frag_proportion,
		ROUND(MAX(frag_proportion)::numeric, 3)::TEXT AS max_frag_proportion,
		ROUND(MIN(frag_proportion)::numeric, 3)::TEXT AS min_frag_proportion,
		ROUND(AVG(lg_accuracy)::numeric, 3)::TEXT AS avg_lg_accuracy,
		ROUND(AVG(dmg_proportion)::numeric, 3)::TEXT AS avg_dmg_proportion,
		ROUND(AVG(dmg_per_minute)::numeric, 3)::TEXT AS avg_dmg_per_minute
		FROM duels
		GROUP BY map
)
SELECT *,
	ROUND( (win_cnt::FLOAT / GREATEST(win_cnt + loss_cnt, 1))::numeric, 3 )::TEXT as avg_win_probability -- OOOOOPS THIS SHOULD BE PER PLAYER HERE AND IN THE PREVIOUS TAB
FROM maps ORDER BY game_cnt DESC;