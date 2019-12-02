-- Get 100 recent games for bps
WITH recent_game_ids AS (
     SELECT games.id
     FROM games
     INNER JOIN game_players ON games.id = game_players.game_id
     WHERE name = 'bps'
     AND map != 'end'
     AND mode = 'duel'
     ORDER BY DATE DESC
     LIMIT 100
), recent_games AS (
    SELECT game_id,
           name,
           frags,
           rl_damage,
           lg_damage,
           CASE WHEN lg_attacks <> 0 THEN lg_direct_hits::FLOAT / lg_attacks ELSE 0 END AS lg_accuracy,
           damage_given,
           damage_taken,
           health_100,
           ra,
           ya
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
       tl * 60 AS tl,
       to_char(now() - date, 'DD:HH24:MM:SS')
       frags,
       rl_damage,
       lg_damage,
       lg_accuracy,
       damage_given,
       damage_taken,
       health_100,
       ra,
       ya
FROM recent_games_full
ORDER BY DATE desc, game_id, name <> 'bps'
