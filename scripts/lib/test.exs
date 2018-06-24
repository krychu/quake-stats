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
    pg_add_game_players(json, pg_game_id, pg_pid)
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

  def pg_add_game_players(json, pg_game_id, pg_pid) do
    json["players"]
    |> Enum.each( fn(player) -> pg_add_game_player(player, pg_game_id, pg_pid) end )
  end

  def pg_add_game_player(json, pg_game_id, pg_pid) do
    query = """
    INSERT INTO game_players(game_id, top_color, bottom_color, ping, name, team,
      frags, deaths, tk, spawn_frags, kills, suicides,
      dmg_taken, dmg_given, dmg_team, dmg_self, dmg_team_weapons, dmg_enemy_weapons,
      xfer, spree_max, spree_quad, control, speed_max, speed_avg,
      axe_attacks, axe_hits, axe_kills_total, axe_kills_team, axe_kills_enemy, axe_kills_self, axe_deaths, axe_pickups_dropped, axe_pickups_taken, axe_dmg_enemy, axe_dmg_team,
      sg_attacks, sg_hits, sg_kills_total, sg_kills_team, sg_kills_enemy, sg_kills_self, sg_deaths, sg_pickups_dropped, sg_pickups_taken, sg_dmg_enemy, sg_dmg_team,
      gl_attacks, gl_hits, gl_kills_total, gl_kills_team, gl_kills_enemy, gl_kills_self, gl_deaths, gl_pickups_dropped, gl_pickups_taken, gl_dmg_enemy, gl_dmg_team,
      rl_attacks, rl_hits, rl_kills_total, rl_kills_team, rl_kills_enemy, rl_kills_self, rl_deaths, rl_pickups_dropped, rl_pickups_taken, rl_dmg_enemy, rl_dmg_team,
      lg_attacks, lg_hits, lg_kills_total, lg_kills_team, lg_kills_enemy, lg_kills_self, lg_deaths, lg_pickups_dropped, lg_pickups_taken, lg_dmg_enemy, lg_dmg_team,
      health_15, health_25, health_100, ga, ya, ra, q, q_time)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87);
    """
    %{num_rows: 1} = Postgrex.query!(pg_pid, query, [
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

          json["axe"]["acc"]["attacks"],
          json["axe"]["acc"]["hits"],
          json["axe"]["kills"]["total"],
          json["axe"]["kills"]["team"],
          json["axe"]["kills"]["enemy"],
          json["axe"]["kills"]["self"],
          json["axe"]["deaths"],
          json["axe"]["pickups"]["dropped"],
          json["axe"]["pickups"]["taken"],
          json["axe"]["damage"]["enemy"],
          json["axe"]["damage"]["team"],

          json["sg_attacks"],
          json["sg_hits"],
          json["sg_kills_total"],
          json["sg_kills_team"],
          json["sg_kills_enemy"],
          json["sg_kills_self"],
          json["sg_deaths"],
          json["sg_pickups_dropped"],
          json["sg_pickups_taken"],
          json["sg_dmg_enemy"],
          json["sg_dmg_team"],

          json["gl"]["acc"]["attacks"],
          json["gl"]["acc"]["hits"],
          json["gl"]["acc"]["real"],
          json["gl"]["acc"]["virtual"],
          json["gl"]["kills"]["total"],
          json["gl"]["kills"]["team"],
          json["gl"]["kills"]["enemy"],
          json["gl"]["kills"]["self"],
          json["gl"]["deaths"],
          json["gl"]["pickups"]["dropped"],
          json["gl"]["pickups"]["taken"],
          json["gl"]["pickups"]["total-taken"],
          json["gl"]["pickups"]["spawn-taken"],
          json["gl"]["pickups"]["spawn-total-taken"],
          json["gl"]["damage"]["enemy"],
          json["gl"]["damage"]["team"],

          json["rl"]["acc"]["attacks"],
          json["rl"]["acc"]["hits"],
          json["rl"]["acc"]["real"],
          json["rl"]["acc"]["virtual"],
          json["rl"]["kills"]["total"],
          json["rl"]["kills"]["team"],
          json["rl"]["kills"]["enemy"],
          json["rl"]["kills"]["self"],
          json["rl"]["deaths"],
          json["rl"]["pickups"]["dropped"],
          json["rl"]["pickups"]["taken"],
          json["rl"]["pickups"]["total-taken"],
          json["rl"]["pickups"]["spawn-taken"],
          json["rl"]["pickups"]["spawn-total-taken"],
          json["rl"]["damage"]["enemy"],
          json["rl"]["damage"]["team"],

          json["lg_attacks"],
          json["lg_hits"],
          json["lg_kills_total"],
          json["lg_kills_team"],
          json["lg_kills_enemy"],
          json["lg_kills_self"],
          json["lg_deaths"],
          json["lg_pickups_dropped"],
          json["lg_pickups_taken"],
          json["lg_dmg_enemy"],
          json["lg_dmg_team"],
          json["health_15"],
          json["health_25"],
          json["health_100"],
          json["ga"]["took"],
          json["ya"]["took"],
          json["ra"]["took"],
          json["q"]["took"],
          json["q"]["time"]
        ])
  end

  def pg_get do
    Postgrex.start_link(hostname: "192.168.1.106", port: 32768, username: "postgres", database: "quakestats")
  end

end

Test.main()

