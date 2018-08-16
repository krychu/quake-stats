-- game cnt and opponent cnt month by month
with recent_games as (
  select game_id, name as name_a, date
  from games inner join game_players on games.id = game_players.game_id
  where name = 'speedball'
    and mode = 'duel'
  order by date desc
), opponents as (
  select date_trunc('month', date)::date as date_bucket, name, count(*) as game_cnt
  from recent_games inner join game_players on recent_games.game_id = game_players.game_id
  where name != name_a
  group by date_bucket, name
)
select to_char(date_bucket, 'YYYY-MM'), sum(game_cnt), count(*) as opponent_cnt
from opponents
group by date_bucket
order by date_bucket desc;



-- avg kill proportion per player for that last N games
with recent_games as (
  select game_id, kills::float / greatest( kills + deaths, 1 ) as kill_proportion, kills + deaths as kdsum
  from games inner join game_players on games.id = game_players.game_id
  where name = 'speedball'
    and mode = 'duel'
  order by date desc
  limit 100
), opponents as (
  select name, avg( kill_proportion ) as avg_kill_proportion, count(*) as game_cnt
  from recent_games inner join game_players on recent_games.game_id = game_players.game_id
  where name != 'speedball'
    and kdsum > 0
  group by name
)
select * from opponents;

-- avg kill proportion N games by N games
with recent_games as (
  select game_id, name as name_a, kills::float / greatest(kills + deaths, 1) as kill_proportion, kills + deaths as kdsum, (row_number() over (order by date desc)) / 50 as bucket
  from games inner join game_players on games.id = game_players.game_id
  where name = 'speedball'
    and mode = 'duel'
  order by date desc
), opponents as (
  select name, avg(kill_proportion) as avg_kill_proportion, count(*) as game_cnt, bucket
  from recent_games inner join game_players on recent_games.game_id = game_players.game_id
  where name != name_a
    and kdsum > 0
  group by name, bucket
), timeline as (
  select bucket, avg(avg_kill_proportion) as avg_avg_kill_proportion, count(*) as opponent_cnt
  from opponents
  group by bucket
)
select * from timeline order by bucket;

-- avg kill proportion month by month
with recent_games as (
  select game_id, name as name_a, kills::float / greatest(kills + deaths, 1) as kill_proportion, kills + deaths as kdsum, date_trunc('month', date)::date as date_bucket
  from games inner join game_players on games.id = game_players.game_id
  where name = 'speedball'
    and mode = 'duel'
), opponents as (
  select name, avg(kill_proportion) as avg_kill_proportion, count(*) as game_cnt, date_bucket
  from recent_games inner join game_players on recent_games.game_id = game_players.game_id
  where name != name_a
    and kdsum > 0
  group by name, date_bucket
), months as (
  select date_bucket, avg(avg_kill_proportion) as avg_avg_kill_proportion, count(*) as opponent_cnt
  from opponents
  group by date_bucket
)
select * from months order by date_bucket desc;


-- in prod
-- frags proportion month by month
WITH recent_games as (
    SELECT
      game_id,
      frags,
      name                              AS name_a,
      date_trunc('month', date) :: DATE AS date_bucket
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = 'speedball'
          AND mode = 'duel'
    ORDER BY date DESC
), duels as (
    SELECT
      recent_games.frags :: FLOAT / greatest(recent_games.frags + game_players.frags, 1) AS frag_proportion,
      game_players.name                                                                  AS name_b,
      date_bucket
    FROM recent_games
      INNER JOIN game_players ON recent_games.game_id = game_players.game_id
    WHERE name != name_a
), opponents as (
    SELECT
      avg(frag_proportion) AS avg_frag_proportion,
      count(*)             AS game_cnt,
      date_bucket
    FROM duels
    GROUP BY name_b, date_bucket
), months as (
    SELECT
      to_char(date_bucket, 'YYYY-MM') AS date_bucket,
      avg(avg_frag_proportion)        AS avg_avg_frag_proportion,
      count(*)                        AS opponent_cnt,
      sum(game_cnt)                   AS game_cnt
    FROM opponents
    GROUP BY date_bucket
    ORDER BY date_bucket DESC
), buckets as (
    SELECT to_char(DATE '2017-01-01' + (INTERVAL '1 month' * generate_series(0, 11)), 'YYYY-MM') AS date_bucket
)
SELECT buckets.date_bucket, round(avg_avg_frag_proportion::numeric, 3)::float as avg_avg_frag_proportion, opponent_cnt::integer, game_cnt::integer
FROM buckets LEFT OUTER JOIN months ON buckets.date_bucket = months.date_bucket
ORDER BY date_bucket;


-- win probability
with recent_games as (
  select game_id, frags
  from games inner join game_players on games.id = game_players.game_id
  where name = 'speedball'
    and mode = 'duel'
  order by date DESC
  limit 200
), duels as (
  select case when recent_games.frags > game_players.frags then 1 else 0 end as win, case when recent_games.frags < game_players.frags then 1 else 0 end as loss, game_players.name
  from recent_games inner join game_players on recent_games.game_id = game_players.game_id
  where name != 'speedball'
)
select name, sum(win)::float / greatest(sum(loss), 1) as wl, sum(win)::float / (sum(win) + sum(loss)) as win_probability, count(*) as game_cnt
from duels
group by name;


-- in prod
-- win probability month by month (avg of per-player)
WITH recent_games as (
    SELECT
      game_id,
      frags,
      name                              AS name_a,
      date_trunc('month', date) :: DATE AS date_bucket
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = 'speedball'
          AND mode = 'duel'
    ORDER BY date DESC
), duels as (
    SELECT
      sum(CASE WHEN recent_games.frags > game_players.frags
        THEN 1
          ELSE 0 END)   AS win_cnt,
      sum(CASE WHEN recent_games.frags < game_players.frags
        THEN 1
          ELSE 0 END)   AS loss_cnt,
      game_players.name AS name_b,
      date_bucket
    FROM recent_games
      INNER JOIN game_players ON recent_games.game_id = game_players.game_id
    WHERE name != name_a
    GROUP BY name_b, date_bucket
), duels_2 as (
    SELECT
      name_b,
      win_cnt,
      loss_cnt,
      win_cnt :: FLOAT / greatest(win_cnt + loss_cnt, 1) AS win_probability,
      date_bucket
    FROM duels
), months as (
    SELECT
      avg(win_probability)         AS avg_win_probability,
      count(*)                     AS opponent_cnt,
      sum(win_cnt) + sum(loss_cnt) AS game_cnt,
      to_char(date_bucket, 'YYYY-MM') as date_bucket
    FROM duels_2
    GROUP BY date_bucket
    ORDER BY date_bucket DESC
), buckets as (
    SELECT to_char(DATE '2017-01-01' + (INTERVAL '1 month' * generate_series(0, 11)), 'YYYY-MM') AS date_bucket
)
SELECT buckets.date_bucket, round(avg_win_probability::numeric, 3)::float as avg_win_probability, opponent_cnt::integer, game_cnt::integer
FROM buckets LEFT OUTER JOIN months ON buckets.date_bucket = months.date_bucket
ORDER BY date_bucket;


-- in prod
-- lg accuracy month by month
WITH recent_games as (
    SELECT
      game_id,
      date_trunc('month', date) :: DATE                 AS date_bucket,
      lg_direct_hits :: FLOAT / greatest(lg_attacks, 1) AS lg_accuracy,
      name                                              AS name_a
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = 'speedball'
          AND mode = 'duel'
    ORDER BY date DESC
), opponents as (
    SELECT
      date_bucket,
      avg(lg_accuracy) AS avg_lg_accuracy,
      count(*)         AS game_cnt
    FROM recent_games
      INNER JOIN game_players ON recent_games.game_id = game_players.game_id
    WHERE name != name_a
    GROUP BY date_bucket, game_players.name
), months as (
    SELECT
      to_char(date_bucket, 'YYYY-MM') AS date_bucket,
      avg(avg_lg_accuracy)            AS avg_avg_lg_accuracy,
      count(*)                        AS opponent_cnt,
      sum(game_cnt)                   AS game_cnt
    FROM opponents
    GROUP BY date_bucket
    ORDER BY date_bucket DESC
), buckets as (
    SELECT to_char(DATE '2017-01-01' + (INTERVAL '1 month' * generate_series(0, 11)), 'YYYY-MM') AS date_bucket
)
SELECT buckets.date_bucket, round(avg_avg_lg_accuracy::numeric, 3)::float as avg_avg_lg_accuracy, opponent_cnt::integer, game_cnt::integer
FROM buckets LEFT OUTER JOIN months ON buckets.date_bucket = months.date_bucket
ORDER BY date_bucket;


SELECT to_char(date '2018-01-01' + (interval '1 month' * generate_series(0,5)), 'YYYY-MM');

SELECT to_char(DATE '2008-01-01' + (interval '1 month' * generate_series(0,56)), 'Mon-YY') AS months