import "./GamesTable/GamesTable";
import { GamesTable } from "./GamesTable/GamesTable";

export function main() {
  const stats = document.getElementById("stats");
  const recentGames = document.createElement("games-table") as GamesTable;
  recentGames.player = "LocKtar";
  recentGames.gameCnt = 10;
  stats.appendChild(recentGames);
  console.log(recentGames);
}

main();
