defmodule Queries do

  @spec get_game_cnts(String.t) :: [{String.t, number}]
  def get_game_cnts(name) do
    # $1 - name
    query = """
    WITH gg AS (
	  SELECT
		count(*) as game_cnt,
		to_char( date_trunc('month', date) :: DATE, 'YYYY-MM' ) AS month
	  FROM games
		INNER JOIN game_players ON games.id = game_players.game_id
	  WHERE
		name = $1
		AND mode = 'duel'
  	GROUP BY month
    ), months AS (
	  SELECT to_char(DATE '2018-08-01' - (INTERVAL '1 month' * generate_series(0,11)), 'YYYY-MM') as month ORDER BY month ASC
    )
    SELECT
    months.month,
    game_cnt
    FROM months
    LEFT OUTER JOIN gg ON months.month = gg.month;
    """

    PG.query(query, [name])
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> if (is_nil(Enum.at(row, 1))), do: [Enum.at(row, 0), 0], else: row end)
    #|> Enum.map(fn(row) -> if (is_nil(Enum.at(row, 1))), do: {Enum.at(row, 0), 0}, else: List.to_tuple(row) end)

    # |> Enum.map(fn(row) -> Enum.zip([:month, :game_cnt], row) end)
    # |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
  end

  #@spec get_games(String.t, number) :: [{}]
  def get_games(player, cnt) do
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

    # Postgrex.query!(pg_pid, query, [player, cnt])
    PG.query(query, [player, cnt])
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> Enum.zip([:game_id, :date, :map, :tl, :ping, :name, :frags, :kd, :ra, :ya, :ga, :health_100, :rl_acc, :rl_avg_dmg, :lg_acc, :lg_avg_dmg, :damage_given, :damage_taken, :dmg_gt, :dmg_per_minute], row) end)
    |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
    |> Enum.group_by(&(&1.game_id))
    |> Enum.map(fn({_game_id, games}) -> games |> Enum.sort( fn(a,_b) -> a.name == player end ) end)
    |> Enum.sort( fn( a, b ) -> NaiveDateTime.compare(hd(a).date, hd(b).date) == :gt end) # also could use .to_erl(a) < .to_erl(b)
  end

  # player -> [{month, win_probability}]
  # @spec get_win_probabilities(String.t) :: [{String.t, number}]
  def get_win_probabilities(player) do
    query = """
    WITH recent_games as ( -- 1. select all duel games of player A
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
    ), duels as ( -- 2. group by each player+month and count wins and losses
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
    ), duels_2 as ( -- 3. add win probability as wins/losses
      SELECT
        name_b,
        win_cnt,
        loss_cnt,
        win_cnt :: FLOAT / greatest(win_cnt + loss_cnt, 1) AS win_probability,
        date_bucket
      FROM duels
    ), months as ( -- 4. group by month and calculate average win probability
      SELECT
        avg(win_probability)         AS avg_win_probability,
        count(*)                     AS opponent_cnt,
        sum(win_cnt) + sum(loss_cnt) AS game_cnt,
        to_char(date_bucket, 'YYYY-MM') as date_bucket
      FROM duels_2
      GROUP BY date_bucket
      ORDER BY date_bucket DESC
    ), buckets as ( -- 5. generate monthly dates
      SELECT to_char(DATE '2017-10-01' + (INTERVAL '1 month' * generate_series(0, 11)), 'YYYY-MM') AS date_bucket
    ) -- 6. show monthly date with average win probability, number of opponents, and number of games
    SELECT
      buckets.date_bucket,
      round(avg_win_probability::numeric, 3)::float as avg_win_probability,
      opponent_cnt::integer,
      game_cnt::integer
    FROM buckets
      LEFT OUTER JOIN months ON buckets.date_bucket = months.date_bucket
    ORDER BY date_bucket;
    """

    PG.query(query, [player])
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> Enum.zip([:date_bucket, :avg_win_probability, :opponent_cnt, :game_cnt], row) end)
    |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)

  end
end
