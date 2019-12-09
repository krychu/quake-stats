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
    WHERE name = $1
          AND date > DATE('2017-08-01') - INTERVAL $2
					AND mode = 'duel'
    ORDER BY date DESC
), duels AS (
    SELECT
      date,
      CASE WHEN recent_games.frags > game_players.frags THEN 1 ELSE 0 END AS win,
      CASE WHEN recent_games.frags < game_players.frags THEN 1 ELSE 0 END AS loss,
      recent_games.frags::FLOAT / GREATEST(recent_games.frags + game_players.frags, 1) AS frag_proportion,
      recent_games.lg_direct_hits::FLOAT / GREATEST(recent_games.lg_attacks, 1) AS lg_accuracy,
      game_players.lg_direct_hits::FLOAT / GREATEST(game_players.lg_attacks, 1) AS lg_accuracy_b,
      recent_games.damage_given::FLOAT / GREATEST(recent_games.damage_given + game_players.damage_given, 1) AS dmg_proportion,
      recent_games.damage_given::FLOAT / tl AS dmg_per_minute,
      game_players.damage_given::FLOAT / tl AS dmg_per_minute_b,
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
      --(SELECT COUNT(*) FROM duels) AS total_game_cnt,
      --ROUND(AVG(frag_proportion)::NUMERIC, 3)::TEXT AS avg_frag_proportion,
      ROUND(AVG(frag_proportion) * 100) AS avg_frag_proportion,
      ROUND(MAX(frag_proportion) * 100) AS max_frag_proportion,
      ROUND(MIN(frag_proportion) * 100) AS min_frag_proportion,
      ROUND(AVG(lg_accuracy) * 100) AS avg_lg_accuracy,
      ROUND(AVG(lg_accuracy_b) * 100) AS avg_lg_accuracy_b,
      ROUND(AVG(dmg_proportion) * 100) AS avg_dmg_proportion,
      ROUND(AVG(dmg_per_minute)) AS avg_dmg_per_minute,
      ROUND(AVG(dmg_per_minute_b)) AS avg_dmg_per_minute_b,
			mode() WITHIN GROUP (ORDER BY map) AS most_frequent_map
    FROM duels
    GROUP BY name_b
)
SELECT *,
  (SELECT MAX(game_cnt) FROM opponents) as max_game_cnt,
  100 - avg_frag_proportion AS avg_frag_proportion_b,
  100 - avg_dmg_proportion AS avg_dmg_proportion_b,
  ROUND((win_cnt :: FLOAT / GREATEST( win_cnt + loss_cnt, 1 )) * 100) AS avg_win_probability,
  100 - ROUND((win_cnt :: FLOAT / GREATEST( win_cnt + loss_cnt, 1 )) * 100) AS avg_win_probability_b
FROM opponents ORDER BY avg_win_probability ASC, game_cnt DESC;
