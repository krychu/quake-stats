import "./GamesTable/GamesTable";
import { GamesTable } from "./GamesTable/GamesTable";
import { GamesChart } from "./GamesChart/GamesChart";
//import SVG from "svg.js";
//import * as svg from "svg.js";

export function main() {
  const stats = document.getElementById("stats");
  const recentGames = document.createElement("games-table") as GamesTable;
  recentGames.player = "LocKtar";
  recentGames.gameCnt = 10;
  stats.appendChild(recentGames);

  const recentGamesChart = document.createElement( "games-chart" ) as GamesChart;
  recentGamesChart.plyaer = "LocKtar";
  recentGamesChart.gameCnt = 10;
  stats.
}

main();
