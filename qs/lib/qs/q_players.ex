defmodule Queries.Players do

  def get_players() do
    query = """
SELECT name, count(*) as game_cnt
FROM game_players
    INNER JOIN games on game_players.game_id = games.id
WHERE mode = 'duel'
    AND dm = 3
GROUP BY name
-- HAVING count(*) > 1
ORDER BY name asc;
    """

    PG.query(query)
    |> Map.get(:rows)
    |> Enum.map(fn(row) -> Enum.zip([:name, :game_cnt], row) end)
    |> Enum.map(fn(kw) -> Enum.into(kw, %{}) end)
  end

end
