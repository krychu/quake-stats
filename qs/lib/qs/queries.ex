defmodule Queries do
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
