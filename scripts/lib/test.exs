defmodule Test do
  def main() do
    #    IO.puts "Hello, World! [Elixir]"
    # {:ok, json} = get_json("../sampledata/games/20170727-203959-382e4367f7e64b9e990623bf370dcce3.json")
    # IO.puts Map.get(json, "version")
    #IO.puts length(get_filenames())
    {:ok, pg_pid} = pg_get()

    results = get_filenames()
    |> Enum.with_index(0)
    |> Enum.map( fn({filename, i}) ->
      if rem(i, 100) == 0, do: IO.write "."
      pg_add_file(filename, pg_pid)
    end)
    |> Enum.reduce( %{}, fn(x, acc) -> Map.update(acc, x, 1, &(&1 + 1)) end )

    IO.puts "\n#{ results.ok } files read successfully, #{ results.error } files skept"
  end

  def get_json(filename) do
    with {:ok, body} <- File.read(filename),
         {:ok, json} <- Poison.decode(body), do: {:ok, json}
  end

  def get_filenames do
    Path.wildcard("../sampledata/games/*.json")
  end

  def string_to_postgrex_ts(string) do
    {:ok, ts} = Timex.parse(string, "%F %T %z", :strftime)
    ts = Timex.Timezone.convert(ts, :utc)
    %NaiveDateTime{ year: ts.year, month: ts.month, day: ts.day, hour: ts.hour, minute: ts.minute, second: ts.second, microsecond: ts.microsecond }
  end

  # ----------------------------------------
  # pg
  # ----------------------------------------
  def pg_add_file(filename, pg_pid) do
    #IO.puts filename
    case get_json(filename) do
      {:ok, json} ->
        pg_add_json(json, pg_pid)
        :ok
      {:error, _} -> :error
    end
    # {:ok, json} = get_json(filename)
    # pg_add_json(json, pg_pid)
  end

  def pg_add_json(json, pg_pid) do
    pg_game_id = pg_add_game(json, pg_pid)
    json["players"]
    |> Enum.each( fn(player) ->
      pg_game_player_id = pg_add_game_player(player, pg_game_id, pg_pid)
      Enum.each(player["weapons"], fn({name, weapon}) ->
        pg_add_game_player_weapon(weapon, name, pg_game_id, pg_game_player_id, pg_pid)
      end )
    end )
    #pg_add_game_players(json, pg_game_id, pg_pid)
  end

  def pg_add_game(json, pg_pid) do
    query = """
    INSERT INTO games(version, date, map, hostname, ip, port, mode, tl, dm, duration, demo)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id;
    """
    %{num_rows: 1, rows: [[id]]} = Postgrex.query!(pg_pid, query, [
          json["version"],
          string_to_postgrex_ts(json["date"]),
          json["map"],
          json["hostname"],
          json["ip"],
          json["port"],
          json["mode"],
          json["tl"],
          json["dm"],
          json["duration"],
          json["demo"]
        ])
    id
  end

  # def pg_add_game_players(json, pg_game_id, pg_pid) do
  #   json["players"]
  #   |> Enum.each( fn(player) -> pg_add_game_player(player, pg_game_id, pg_pid) end )
  # end

  def pg_add_game_player(json, pg_game_id, pg_pid) do
    query = """
    INSERT INTO game_players(game_id, top_color, bottom_color, ping, name, team,
      frags, deaths, tk, spawn_frags, kills, suicides,
      dmg_taken, dmg_given, dmg_team, dmg_self, dmg_team_weapons, dmg_enemy_weapons,
      xfer, spree_max, spree_quad, control, speed_max, speed_avg,
      health_15, health_25, health_100, ga, ya, ra, q, q_time)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
    RETURNING id;
    """
    %{num_rows: 1, rows: [[id]]} = Postgrex.query!(pg_pid, query, [
          pg_game_id,
          json["top-color"],
          json["bottom-color"],
          json["ping"],
          json["name"],
          json["team"],

          json["stats"]["frags"],
          json["stats"]["deaths"],
          json["stats"]["tk"],
          json["stats"]["spawn-frags"],
          json["stats"]["kills"],
          json["stats"]["suicides"],

          json["dmg"]["taken"],
          json["dmg"]["given"],
          json["dmg"]["team"],
          json["dmg"]["self"],
          json["dmg"]["team-weapons"],
          json["dmg"]["enemy-weapons"],

          json["xfer"],
          json["spree"]["max"],
          json["spree"]["quad"],
          json["control"],
          json["speed"]["max"],
          json["speed"]["avg"],

          json["items"]["health_15"]["took"],
          json["items"]["health_25"]["took"],
          json["items"]["health_100"]["took"],
          json["items"]["ga"]["took"],
          json["items"]["ya"]["took"],
          json["items"]["ra"]["took"],
          json["items"]["q"]["took"],
          json["items"]["q"]["time"]
        ])
    id
  end

  def pg_add_game_player_weapon(weapon, name, pg_game_id, pg_game_player_id, pg_pid) do
    query = """
    INSERT INTO game_player_weapons(game_id, game_player_id,
      weapon, attacks, hits, real, virtual, kills_total, kills_team, kills_enemy, kills_self, deaths,
      pickups_dropped, pickups_taken, pickups_total_taken, pickups_spawn_taken, pickups_spawn_total_taken,
      damage_enemy, damage_team)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);
    """
    %{num_rows: 1} = Postgrex.query!(pg_pid, query, [
          pg_game_id,
          pg_game_player_id,

          name,
          weapon["acc"]["attacks"],
          weapon["acc"]["hits"],
          weapon["acc"]["real"],
          weapon["acc"]["virtual"],
          weapon["kills"]["total"],
          weapon["kills"]["team"],
          weapon["kills"]["enemy"],
          weapon["kills"]["self"],
          weapon["deaths"],
          weapon["pickups"]["dropped"],
          weapon["pickups"]["taken"],
          weapon["pickups"]["total-taken"],
          weapon["pickups"]["spawn-taken"],
          weapon["pickups"]["spawn-total-taken"],
          weapon["damage"]["enemy"],
          weapon["damage"]["team"]
        ])
  end

  def pg_get do
    Postgrex.start_link(hostname: "192.168.1.106", port: 32768, username: "postgres", database: "quakestats")
  end

end

Test.main()

