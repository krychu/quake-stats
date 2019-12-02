-- top opponents
WITH recent_games AS (
    SELECT
      name AS name_a,
      game_id,
      date,
      frags,
      lg_direct_hits,
      lg_attacks,
      damage_given,
      tl,
			map
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = 'speedball'
          AND date > DATE('2017-08-01') - INTERVAL '4 months'
					AND mode = 'duel'
    ORDER BY date DESC
), duels AS (
    SELECT
      date,
      CASE WHEN recent_games.frags > game_players.frags THEN 1 ELSE 0 END AS win,
      CASE WHEN recent_games.frags < game_players.frags THEN 1 ELSE 0 END AS loss,
      recent_games.frags::FLOAT / GREATEST(recent_games.frags + game_players.frags, 1) AS frag_proportion,
      recent_games.lg_direct_hits::FLOAT / GREATEST(recent_games.lg_attacks, 1) AS lg_accuracy,
      recent_games.damage_given::FLOAT / GREATEST(recent_games.damage_given + game_players.damage_given, 1) AS dmg_proportion,
      recent_games.damage_given::FLOAT / tl AS dmg_per_minute,
      game_players.name AS name_b,
			map
    FROM recent_games
      INNER JOIN game_players ON recent_games.game_id = game_players.game_id
    WHERE name != name_a
), opponents AS (
    SELECT
      name_b,
      COUNT(*) AS game_cnt,
      SUM(win) AS win_cnt,
      SUM(loss) AS loss_cnt,
      ROUND(AVG(frag_proportion)::NUMERIC, 3)::TEXT AS avg_frag_proportion,
      ROUND(MAX(frag_proportion)::NUMERIC, 3)::TEXT AS max_frag_proportion,
      ROUND(MIN(frag_proportion)::NUMERIC, 3)::TEXT AS min_frag_proportion,
      ROUND(AVG(lg_accuracy)::NUMERIC, 3)::TEXT AS avg_lg_accuracy,
      ROUND(AVG(dmg_proportion)::NUMERIC, 3)::TEXT AS avg_dmg_proportion,
      ROUND(AVG(dmg_per_minute)::NUMERIC, 0)::TEXT AS avg_dmg_per_minute,
			mode() WITHIN GROUP (ORDER BY map) AS most_frequent_map
    FROM duels
    GROUP BY name_b
)
SELECT *,
  ROUND( (win_cnt :: FLOAT / GREATEST( win_cnt + loss_cnt, 1 ))::numeric , 3 )::TEXT AS avg_win_probability
FROM opponents ORDER BY game_cnt DESC;

