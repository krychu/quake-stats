defmodule Queries.Games do

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

  # #@spec get_games(String.t, number) :: [{}]
  # def get_games(player, cnt) do
  #   query = """
  #   WITH recent_games AS (
  #   SELECT games.id
  #   FROM games
  #   INNER JOIN game_players ON games.id = game_players.game_id
  #   WHERE name = $1
  #     AND map != 'end'
  #     AND mode = 'duel'
  #   ORDER BY date DESC
  #   LIMIT $2
  #   )
  #   --SELECT *gs
  #   SELECT game_id,
  #          date,
  #          map,
  #          tl,
  #          ping,
  #          name,
  #          frags,
  #          kills::FLOAT / greatest(deaths, 1) as kd,
  #          coalesce(ra, 0),
  #          ya,
  #          ga,
  #          health_100,
  #          rl_effective_hits::FLOAT/greatest(rl_attacks,1) as rl_acc,
  #          rl_damage::FLOAT/greatest(rl_attacks,1) as rl_avg_dmg,
  #          lg_direct_hits::FLOAT/greatest(lg_attacks,1) AS lg_acc,
  #          lg_damage::FLOAT/greatest(lg_attacks,1) AS lg_avg_dmg,
  #          damage_given,
  #          damage_taken,
  #          damage_given::FLOAT/greatest(damage_taken, 1) as dmg_gt,
  #          damage_given::FLOAT/tl AS dmg_per_minute
  #   FROM games INNER JOIN game_players ON games.id = game_players.game_id
  #   WHERE games.id IN ( SELECT id FROM recent_games )
  #   ORDER BY date DESC;
  #   """

  #   # Postgrex.query!(pg_pid, query, [player, cnt])
  #   PG.query(query, [player, cnt])
  #   |> Map.get(:rows)
  #   |> Enum.map(fn(row) -> Enum.zip([:game_id, :date, :map, :tl, :ping, :name, :frags, :kd, :ra, :ya, :ga, :health_100, :rl_acc, :rl_avg_dmg, :lg_acc, :lg_avg_dmg, :damage_given, :damage_taken, :dmg_gt, :dmg_per_minute], row) end)
  #   |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
  #   |> Enum.group_by(&(&1.game_id))
  #   |> Enum.map(fn({_game_id, games}) -> games |> Enum.sort( fn(a,_b) -> a.name == player end ) end)
  #   |> Enum.sort( fn( a, b ) -> NaiveDateTime.compare(hd(a).date, hd(b).date) == :gt end) # also could use .to_erl(a) < .to_erl(b)
  # end

  #@spec get_games(String.t, number) :: [{}]
  def get_games(player, cnt) do
    query = """
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
           speed_avg
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
       speed_avg
FROM recent_games_full
ORDER BY raw_date desc, game_id, name <> $1;
    """

    PG.query(query, [player, cnt])
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> Enum.zip([:game_id, :name, :map, :tl, :raw_date, :date, :frags, :rl_damage, :lg_damage, :lg_accuracy, :damage_given, :damage_taken, :health_100, :ra, :ya, :speed_avg], row) end)
    |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
    |> Enum.chunk_every(2)
  end
end
