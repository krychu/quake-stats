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
    |> Enum.each( fn(player) -> pg_add_game_player(player, pg_game_id, pg_pid) end )
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

  def pg_add_game_player(json, pg_game_id, pg_pid) do
    query = """
    INSERT INTO game_players(
      game_id,
      top_color,
      bottom_color,
      ping,
      name,

      frags,
      deaths,
      spawn_frags,
      kills,
      suicides,

      damage_taken,
      damage_given,
      damage_self,

      spree_max,
      spree_quad,
      control,
      speed_max,
      speed_avg,

      health_15,
      health_25,
      health_100,
      ga,
      ya,
      ra,
      q,
      q_time,

      sg_attacks,
      sg_direct_hits,
      sg_kills,
      sg_deaths,
      sg_damage,

      gl_attacks,
      gl_direct_hits,
      gl_effective_hits,
      gl_kills,
      gl_deaths,
      gl_picked,
      gl_damage,

      rl_attacks,
      rl_direct_hits,
      rl_effective_hits,
      rl_kills,
      rl_deaths,
      rl_picked,
      rl_damage,

      lg_attacks,
      lg_direct_hits,
      lg_kills,
      lg_deaths,
      lg_picked,
      lg_damage
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51);
    """
    %{num_rows: 1} = Postgrex.query!(pg_pid, query, [
          pg_game_id,
          json["top-color"],
          json["bottom-color"],
          json["ping"],
          json["name"],

          json["stats"]["frags"],
          json["stats"]["deaths"],
          json["stats"]["spawn-frags"],
          json["stats"]["kills"],
          json["stats"]["suicides"],

          json["dmg"]["taken"],
          json["dmg"]["given"],
          json["dmg"]["self"],

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
          json["items"]["q"]["time"],

          json["weapons"]["sg"]["acc"]["attacks"],
          json["weapons"]["sg"]["acc"]["hits"],
          json["weapons"]["sg"]["kills"]["total"],
          json["weapons"]["sg"]["deaths"],
          json["weapons"]["sg"]["damage"]["enemy"],

          json["weapons"]["gl"]["acc"]["attacks"],
          json["weapons"]["gl"]["acc"]["hits"],
          json["weapons"]["gl"]["acc"]["virtual"],
          json["weapons"]["gl"]["kills"]["total"],
          json["weapons"]["gl"]["deaths"],
          json["weapons"]["gl"]["pickups"]["taken"],
          json["weapons"]["gl"]["damage"]["enemy"],

          json["weapons"]["rl"]["acc"]["attacks"],
          json["weapons"]["rl"]["acc"]["hits"],
          json["weapons"]["rl"]["acc"]["virtual"],
          json["weapons"]["rl"]["kills"]["total"],
          json["weapons"]["rl"]["deaths"],
          json["weapons"]["rl"]["pickups"]["taken"],
          json["weapons"]["rl"]["damage"]["enemy"],

          json["weapons"]["lg"]["acc"]["attacks"],
          json["weapons"]["lg"]["acc"]["hits"],
          json["weapons"]["lg"]["kills"]["total"],
          json["weapons"]["lg"]["deaths"],
          json["weapons"]["lg"]["pickups"]["taken"],
          json["weapons"]["lg"]["damage"]["enemy"]
        ])
  end

  def pg_get do
    Postgrex.start_link(hostname: "192.168.1.106", port: 32768, username: "postgres", database: "quakestats")
  end

end

Test.main()

