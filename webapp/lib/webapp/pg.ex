defmodule PG do
  def get_pg() do
    Postgrex.start_link(hostname: "192.168.1.106", port: 32768, username: "postgres", database: "quakestats")
  end

  def get_recent_games( pg_pid, player, cnt ) do
    query = """
    WITH recent_games AS (
    SELECT games.id
    FROM games
    INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = $1
      AND map != 'end'
      AND mode = 'duel'
    ORDER BY date DESC
    LIMIT $2
    )
    --SELECT *gs
    SELECT game_id,
           date,
           map,
           tl,
           ping,
           name,
           frags,
           kills::FLOAT / greatest(deaths, 1) as kd,
           coalesce(ra, 0),
           ya,
           ga,
           health_100,
           rl_effective_hits::FLOAT/greatest(rl_attacks,1) as rl_acc,
           rl_damage::FLOAT/greatest(rl_attacks,1) as rl_avg_dmg,
           lg_direct_hits::FLOAT/greatest(lg_attacks,1) AS lg_acc,
           lg_damage::FLOAT/greatest(lg_attacks,1) AS lg_avg_dmg,
           damage_given,
           damage_taken,
           damage_given::FLOAT/greatest(damage_taken, 1) as dmg_gt,
           damage_given::FLOAT/tl AS dmg_per_minute
    FROM games INNER JOIN game_players ON games.id = game_players.game_id
    WHERE games.id IN ( SELECT id FROM recent_games )
    ORDER BY date DESC;
    """

    Postgrex.query!(pg_pid, query, [player, cnt])
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> Enum.zip([:game_id, :date, :map, :tl, :ping, :name, :frags, :kd, :ra, :ya, :ga, :health_100, :rl_acc, :rl_avg_dmg, :lg_acc, :lg_avg_dmg, :damage_given, :damage_taken, :dmg_gt, :dmg_per_minute], row) end)
    |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
    |> Enum.group_by(&(&1.game_id))
    |> Enum.map(fn({_game_id, games}) -> games |> Enum.sort( fn(a,_b) -> a.name == player end ) end)
    |> Enum.sort( fn( a, b ) -> NaiveDateTime.compare(hd(a).date, hd(b).date) == :gt end) # also could use .to_erl(a) < .to_erl(b)
  end

  # def get_game_cnt_timeline( pg_pid, player ) do
  #   query = """
  #   WITH recent_games as (
  #     SELECT game_id, name as name_a, date
  #     FROM games INNER JOIN game_players ON games.id = game_players.game_id
  #     WHERE name = $1
  #     AND mode = 'duel'
  #     ORDER BY date DESC
  #   ), opponents as (
  #     SELECT date_trunc('month', date)::date as date_bucket, name, count(*) as game_cnt
  #     FROM recent_games INNER JOIN game_players ON recent_games.game_id = game_players.game_id
  #     WHERE name != name_a
  #     GROUP BY date_bucket, name
  #   )
  #   SELECT to_char(date_bucket, 'YYYY-MM'), sum(game_cnt)::integer as game_cnt, count(*) as opponent_cnt
  #   FROM opponents
  #   GROUP BY date_bucket
  #   ORDER BY date_bucket desc;
  #   """

  #   Postgrex.query!(pg_pid, query, [player])
  #   |> Map.get(:rows)
  #   |> Enum.map( fn(row) -> Enum.zip( [:date_bucket, :game_cnt, :opponent_cnt], row ) end )
  #   |> Enum.map( fn(kw) -> Enum.into( kw, %{} ) end )
  # end

  def get_win_probability_timeline( pg_pid, player ) do
    query = """
WITH recent_games as (
    SELECT
      game_id,
      frags,
      name                              AS name_a,
      date_trunc('month', date) :: DATE AS date_bucket
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = $1
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
    """

    Postgrex.query!(pg_pid, query, [player])
    |> Map.get(:rows)
    |> Enum.map( fn(row) -> Enum.zip( [:date_bucket, :avg_win_probability, :opponent_cnt, :game_cnt], row ) end )
    |> Enum.map( fn(kw) -> Enum.into( kw, %{} ) end )
  end

  def get_frags_proportion_timeline( pg_pid, player ) do
    query = """
WITH recent_games as (
    SELECT
      game_id,
      frags,
      name                              AS name_a,
      date_trunc('month', date) :: DATE AS date_bucket
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = $1
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
    """

    Postgrex.query!( pg_pid, query, [player] )
    |> Map.get(:rows)
    |> Enum.map( fn(row) -> Enum.zip( [:date_bucket, :avg_avg_frag_proportion, :opponent_cnt, :game_cnt], row ) end )
    |> Enum.map( fn(kw) -> Enum.into( kw, %{} ) end )
  end

  def get_lg_accuracy_timeline( pg_pid, player ) do
    query = """
WITH recent_games as (
    SELECT
      game_id,
      date_trunc('month', date) :: DATE                 AS date_bucket,
      lg_direct_hits :: FLOAT / greatest(lg_attacks, 1) AS lg_accuracy,
      name                                              AS name_a
    FROM games
      INNER JOIN game_players ON games.id = game_players.game_id
    WHERE name = $1
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
    """

    Postgrex.query!( pg_pid, query, [player] )
    |> Map.get( :rows )
    |> Enum.map( fn(row) -> Enum.zip( [:date_bucket, :avg_avg_lg_accuracy, :opponent_cnt, :game_cnt ], row ) end )
    |> Enum.map( fn(kw) -> Enum.into( kw, %{} ) end )
  end
end
