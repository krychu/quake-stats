-- Top maps
--
-- Description
-- -----------
-- Top maps for the player. One map per row with all related stats. The stats
-- are averages of averages: first, the averages per map-opponent are
-- calculated, and later these are averaged to get the final stat.
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Time interval as string, e.g., '4 months'

-- old notes:
-- MATERIALIZED VIEW WITH ALL PLAYER-MAP ENTRIES?
-- top maps calculated from per player per map stats
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
	WHERE name = $1
		AND date > DATE('2017-11-01') - INTERVAL $s
		AND mode = 'duel'
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
), map_opponents AS (
	SELECT
		map,
		count(*) AS game_cnt,
		SUM(win) AS win_cnt,
		SUM(loss) AS loss_cnt,
		AVG(frag_proportion) AS avg_frag_proportion,
		MAX(frag_proportion) AS max_frag_proportion,
		MIN(frag_proportion) AS min_frag_proportion,
		AVG(lg_accuracy) AS avg_lg_accuracy,
		AVG(dmg_proportion) AS avg_dmg_proportion,
		AVG(dmg_per_minute) AS avg_dmg_per_minute
		FROM duels
		GROUP BY map, name_b
), map_opponents_2 AS (
	SELECT *,
		win_cnt::FLOAT / GREATEST(win_cnt + loss_cnt, 1) as avg_win_probability
	FROM map_opponents
), maps AS (
	SELECT
		map,
		SUM(game_cnt) AS game_cnt,
		COUNT(*) AS opponent_cnt,
		ROUND(AVG(avg_win_probability)::numeric, 3)::TEXT AS avg_avg_win_probability,
		ROUND(AVG(avg_frag_proportion)::numeric, 3)::TEXT AS avg_avg_frag_proportion,
		ROUND(MAX(max_frag_proportion)::numeric, 3)::TEXT AS max_max_frag_proportion,
		ROUND(MIN(min_frag_proportion)::numeric, 3)::TEXT AS min_min_frag_proportion,
		ROUND(AVG(avg_lg_accuracy)::numeric, 3)::TEXT AS avg_avg_lg_accuracy,
		ROUND(AVG(avg_dmg_proportion)::numeric, 3)::TEXT AS avg_avg_dmg_proportion,
		ROUND(AVG(avg_dmg_per_minute)::numeric, 3)::TEXT AS avg_avg_dmg_per_minute
	FROM map_opponents_2
	GROUP BY map
)
SELECT * FROM maps ORDER BY game_cnt DESC;
