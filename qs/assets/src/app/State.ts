import * as log from "./Log";
import * as cmd from "./Cmd";

const commands: [string, Cmd][] = [
  [ "state_set_main_html_root",        cmd_state_set_main_html_root ],
  [ "state_set_games_html_root",       cmd_state_set_games_html_root ]
]

/*
  - No listeners for state changes, this leads to fragmented, hard to track
    execution flow.
  - If one part of state is in some progress you can express it with status.

 */
class State {
  player: string | null = null;
  //num_games:                  number = 10;

  data: Data = {
    game_cnt: 40,
    games: [],
    game_cnts: [],
    win_probabilities: []
  }

  html_main: HTMLElement | null = null

  games_chart: GamesChart = {
    game_cnt: 20,
    html_root_id: "duel-games-chart",
    html_root: null
    // svg_width: 800,
    // svg_
    //html_root: null
    // uses games.data
  }

  games: Games = {
    show_game_cnt: 20,
    //game_cnt: 40,
    //data: [],
    html_root_id: "duel-games",
    html_root: null
  }

  cmds: Cmds = {
    funcs: {},
    buffer: []
  }
}

interface Data {
  game_cnt: number;
  games: Duel[];
  game_cnts: [string, number][];
  win_probabilities: any[];
  //win_probabilities:
}

interface GamesChart {
  game_cnt: number;
  html_root_id: string;
  html_root: HTMLElement | null;
  // svg_width: number;
  // svg_height: number;
  //html_root: HTMLElement | null;
}

interface Games {
  //status: "requesting_data" | "data_ready";
  show_game_cnt: number;
  //game_cnt: number;
  //data: any[];//[][GameData, GameData];
  //data: GameData[];
  //data: [GameData, GameData][];
  //data: Duel[];
  html_root_id: string;
  html_root: HTMLElement | null;
}

type Duel = [GameData, GameData];

interface GameData {
  // this order should stay sync with the UI design
  game_id: number;
  name: string;
  map: string;
  tl: number;
  raw_date: number;
  date: string;
  frags: number;
  rl_damage: number;
  lg_damage: number;
  lg_accuracy: number;
  damage_given: number;
  damage_taken: number;
  health_100: number;
  ra: number;
  ya: number;
  speed_avg: number;
}

//type CmdFunc = (data?: any): void
type Cmd = (data?: any) => Promise<any>;

interface ScheduledCmd {
  name: string;
  data?: any;
  resolve: any;
  reject: any;
}

interface Cmds {
  funcs: {[name: string]: (data?: any) => Promise<any>};
  //buffer: [{name: string, data?: any}];
  //buffer: Array<{name: string, data?: any}>;
  //buffer: {name: string, data?: any}[];
  buffer: ScheduledCmd[];
}

// interface HTML {
//   games_container:            HTMLElement = null;
// }

// function state_set(action, data) {
//   switch (action) {
//     case "game_data":
//       break;
//     case ""
//   }
// }
//  html:                       HTML = new HTML(); // 

// function create_state(): State {
//   return {
//     player: null,
//     num_games
//   }

/**
 * State has to be created before any of the init() methods are called. This is because init() are typically call
 */
//const state = new State();
let state: State;

export function init() {
  log.log("State module initialized");
  state = new State();
  (window as any).state = state;
  cmd.add_cmds(commands);
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
function cmd_state_set_main_html_root(html_root: HTMLElement): Promise<void> {
  state.html_main = html_root;
  return Promise.resolve();
}

function cmd_state_set_games_html_root(root: HTMLElement): Promise<any> {
  state.games.html_root = root;
  return Promise.resolve();
}

export { state, ScheduledCmd, GameData, Duel, Cmd };
