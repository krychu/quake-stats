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
  frags: number;
  name: string;
  map: string;
  frags_percent: number;
  rl_vs_lg: number;
  lg_accuracy: number;
  dmg_min: number;
  ra: number;
  ya: number;
  mh: number;
  date: string;
  kd: number;
  dmg_gt: number;
  lg_acc: number;
  dmg_per_minute: number;

  tl: number;
  ping: number;
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

const state = new State();
(window as any).state = state;
export { state, ScheduledCmd, GameData, Duel, Cmd };
