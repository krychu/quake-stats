-- Recent games
--
-- Description
-- -----------
-- Recent duel games for the player. Each game consists of two rows: One row
-- with the player stats for the game, and the other row with the equivalent
-- opponent stats for the game. These rows are not combined in any way. The
-- application has to do it to assemble the complete set of stats for the game.
--
-- Placeholders
-- ------------
-- $1 Player name
-- $2 Game count
--
WITH recent_game_ids AS (
     SELECT games.id
     FROM games
     INNER JOIN game_players ON games.id = game_players.game_id
     WHERE name = $1
     AND dm = 3
     AND mode = 'duel'
     -- AND duration > (tl * 60) + 10
     ORDER BY DATE DESC
     LIMIT $2
), recent_games AS (
    SELECT game_id,
           name,
           frags,
           rl_damage,
           lg_damage,
           CASE WHEN lg_attacks <> 0 THEN lg_direct_hits::FLOAT / lg_attacks ELSE NULL END AS lg_accuracy,
           damage_given,
           damage_taken,
           health_100,
           ra,
           ya,
           speed_avg,
           kills,
           deaths
    FROM game_players
    WHERE game_id IN ( SELECT id FROM recent_game_ids )
), recent_games_full AS (
    SELECT *
    FROM recent_games
        INNER JOIN games ON recent_games.game_id = games.id
)
SELECT game_id,
       name,
       map,
       tl,
       date as raw_date,
       to_char(now() - date, 'DD:HH24:MM:SS') as date,
       frags,
       rl_damage,
       lg_damage,
       lg_accuracy,
       damage_given,
       damage_taken,
       health_100,
       ra,
       ya,
       speed_avg,
       kills,
       deaths
FROM recent_games_full
ORDER BY raw_date desc, game_id, name <> $1;
