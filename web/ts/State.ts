import * as log from "./Log";
import * as cmd from "./Cmd";
import { Games } from "./Games";
import { Opponents } from "./Opponents";
import { Maps } from "./Maps";
import { GamesChart } from "./GamesChart";
import { DuelPlayerPageData, DuelPlayersPageData } from "./Data";
import { DayActivity } from "./Activity";
import { Players } from "./Players";
import { Header } from "./Header";
import { TopLevel } from "./TopLevel";

const commands: [string, cmd.Cmd][] = [];

interface State {
    page: "duel_player" | "duel_players";
    html_main: HTMLElement | null;
    cmds: cmd.Cmds | null;
    header: Header | null;
    duel_player: DuelPlayerPage;
    duel_players: DuelPlayersPage;
};

interface DuelPlayersPage {
    data: DuelPlayersPageData | null;
    activity: DayActivity | null;
    players: Players | null;
};

interface DuelPlayerPage {
    player: string | null;
    data: DuelPlayerPageData | null;
    top_level: TopLevel | null;
    games_chart: GamesChart | null;
    games: Games | null;
    opponents: Opponents | null;
    maps: Maps | null;
};

/*
  - No listeners for state changes, this leads to fragmented, hard to track
    execution flow.
  - If one part of state is in some progress you can express it with status.

*/
let state: State = {
    page: (window as any).PAGE,
  html_main: null,

    cmds: null,
    header: null,

  duel_player: {
      player: null,
      data: null,
      top_level: null,
      games_chart: null,
      games: null,
      opponents: null,
      maps: null
  },

    // This should be another state?
    duel_players: {
        data: null,
        activity: null,
        players: null
  }
}

/**
 * State has to be created before any of the init() methods are called. This is because init() are typically call
 */
export function init() {
  log.log("State module initialized");
  (window as any).state = state;
  cmd.add_cmds(commands);
}

export function shutdown() {
}

export { state };
