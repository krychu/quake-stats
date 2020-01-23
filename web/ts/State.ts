import * as log from "./Log";
import * as cmd from "./Cmd";

const commands: [string, Cmd][] = [
  [ "state_set_main_html_root",          cmd_state_set_main_html_root ],
  [ "state_set_main_2cols_html_root",    cmd_state_set_main_2cols_html_root ],
  [ "state_set_games_html_root",         cmd_state_set_games_html_root ],
  [ "state_set_opponents_html_root",     cmd_state_set_opponents_html_root ],
  [ "state_set_maps_html_root",          cmd_state_set_maps_html_root ],

  // duel player
  [ "state_set_game_cnts",               cmd_state_set_game_cnts ],
  [ "state_set_games",                   cmd_state_set_games ],
  [ "state_set_opponents",               cmd_state_set_opponents ],
  [ "state_set_maps",                    cmd_state_set_maps ],
  [ "state_set_win_probabilities",       cmd_state_set_win_probabilities ],

  // duel players
  [ "state_set_activity_html_root",      cmd_state_set_activity_html_root ],
  [ "state_set_activity",                cmd_state_set_activity ],
  [ "state_set_duel_players_html_root",  cmd_state_set_duel_players_html_root ],
  [ "state_set_duel_players",            cmd_state_set_duel_players ],
  [ "state_set_gamesshort_html_root",    cmd_state_set_gamesshort_html_root ],
  [ "state_set_gamesshort",              cmd_state_set_gamesshort ]
]

/*
  - No listeners for state changes, this leads to fragmented, hard to track
    execution flow.
  - If one part of state is in some progress you can express it with status.

 */
let state: State = {
  //num_games:                  number = 10;

  html_main: null,
  html_main_2cols: null, // used on a main players page

  cmds: {
    funcs: {},
    buffer: []
  },

  duel_player: {
    player: null,

    data: {
      game_cnt: 40,
      games: [],
      opponents: [],
      maps: [],
      game_cnts: [],
      win_probabilities: []
    },

    games_chart: {
      game_cnt: 20,
      html_root_id: "1vs1-games-chart", // Can be removed
      html_root: null,
      html_chart_root: null
      // svg_width: 800,
      // svg_
      //html_root: null
      // uses games.data
    },

    games: {
      show_game_cnt: 20,
      //game_cnt: 40,
      //data: [],
      //html_root_id: "duel-games",
      html_root: null
    },

    opponents: {
      html_root: null,
    },

    maps: {
      html_root: null,
    }

  },

  // This should be another state?
  duel_players: {
    activity: {
      show_day_cnt: 40,
      html_root: null
    },

    players: {
      html_root: null
    },

    games: {
      show_game_cnt: 10,
      html_root: null
    },

    data: {
      players: [],
      games: [],
      activity: []
    }
  }
}

interface State {
  html_main: HTMLElement | null;
  html_main_2cols: HTMLElement | null;
  cmds: Cmds;

  //duel_player: DuelPlayerState;
  duel_player: {
    player: string | null;
    data: {
      game_cnt: number;
      games: GameData[];
      opponents: OpponentData[];
      maps: MapData[];
      game_cnts: [string, number][];
      win_probabilities: any[];
    };
    games_chart: GamesChart;
    games: Games;
    opponents: Opponents;
    maps: Maps;
  };

  duel_players: {
    activity: {
      show_day_cnt: number;
      html_root: HTMLElement | null
    },
    players: {
      html_root: HTMLElement | null
    },
    games: {
      show_game_cnt: number;
      html_root: HTMLElement | null
    }
    data: {
      players: DPS_PlayerData[];
      games: GameDataShort[];
      activity: DayActivity[];
    }
  };
}

/**
 * Dual Players
 */
// interface DPS_State {
//   players: { html_root: HTMLElement | null },
//   data: { players: DPS_PlayerData[] }
// }

interface DPS_PlayerData {
    name: string;
    game_cnt: number;
    a_win_percent: number;
    b_win_percent: number;
    last_game_date: string;
}

/**
 * Dual Player
 */
// interface DuelPlayerState {
//   player: string | null;
//   data: DuelPlayerData;
//   games_chart: GamesChart;
//   games: Games;
//   opponents: Opponents;
//   maps: Maps;
// }

// interface DuelPlayerData {
//   game_cnt: number;
//   games: Duel[];
//   opponents: OpponentData[];
//   maps: MapData[];
//   game_cnts: [string, number][];
//   win_probabilities: any[];
//   //win_probabilities:
// }

interface GamesChart {
  game_cnt: number;
  html_root_id: string; // Can be removed
  html_root: HTMLElement | null;
  html_chart_root: HTMLElement | null;
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
  //html_root_id: string;
  html_root: HTMLElement | null;
}

interface Opponents {
  html_root: HTMLElement | null;
}

interface Maps {
  html_root: HTMLElement | null;
}

//type Duel = [GameData, GameData];

export interface OpponentData {
  name: string;
  game_cnt: number;

  a_win_percent: number;
  a_avg_frag_percent: number;
  a_avg_dmg_percent: number;
  a_avg_lg_acc_percent: number;

  b_win_percent: number;
  b_avg_frag_percent: number;
  b_avg_dmg_percent: number;
  b_avg_lg_acc_percent: number;

  most_frequent_map: string;
}

export interface MapData {
  map: string;
  game_cnt: number;
  opponent_cnt: number;

  a_win_percent: number;
  a_avg_frag_percent: number;
  a_avg_dmg_percent: number;
  a_avg_dmg_minute: number;

  b_win_percent: number;
  b_avg_frag_percent: number;
  b_avg_dmg_percent: number;
  b_avg_dmg_minute: number;
}

interface GameData {
  // this order should stay sync with the UI design
  game_id: number;
  raw_date: number;
  date: string;
  map: string;

  a_name: string;
  a_frags: number;
  a_dmg_percent: number;
  a_rl_dmg_minute: number;
  a_lg_dmg_minute: number;
  a_lg_acc_percent: number;
  a_ra: number;
  a_ya: number;
  a_mh: number;
  a_speed_avg: number;

  b_name: string;
  b_frags: number;
  b_dmg_percent: number;
  b_rl_dmg_minute: number;
  b_lg_dmg_minute: number;
  b_lg_acc_percent: number;
  b_ra: number;
  b_ya: number;
  b_mh: number;
  b_speed_avg: number;
}

export type GameDataShort = Pick<GameData, "game_id" | "raw_date" | "date" | "map" | "a_name" | "a_frags" | "b_name" | "b_frags">;

export interface DayActivity {
  day_name: string;
  game_cnt: number;
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
//let state: State;

export function init() {
  log.log("State module initialized");
  //state = new State();
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

function cmd_state_set_main_2cols_html_root(html_root: HTMLElement): Promise<void> {
  state.html_main_2cols = html_root;
  return Promise.resolve();
}

function cmd_state_set_games_html_root(root: HTMLElement): Promise<any> {
  state.duel_player.games.html_root = root;
  return Promise.resolve();
}

function cmd_state_set_opponents_html_root(root: HTMLElement): Promise<any> {
  state.duel_player.opponents.html_root = root;
  return Promise.resolve();
}

function cmd_state_set_maps_html_root(root: HTMLElement): Promise<any> {
  state.duel_player.maps.html_root = root;
  return Promise.resolve();
}

/**
 * Duel Player
 */
function cmd_state_set_game_cnts(data: [string, number][]): Promise<any> {
  state.duel_player.data.game_cnts = data;
  return Promise.resolve();
}

function cmd_state_set_games(data: GameData[]): Promise<any> {
  state.duel_player.data.games = data;
  return Promise.resolve();
}

function cmd_state_set_opponents(data: OpponentData[]): Promise<any> {
  state.duel_player.data.opponents = data;
  return Promise.resolve();
}

function cmd_state_set_maps(data: MapData[]): Promise<any> {
  state.duel_player.data.maps = data;
  return Promise.resolve();
}

function cmd_state_set_win_probabilities(data: any[]): Promise<any> {
  state.duel_player.data.win_probabilities = data;
  return Promise.resolve();
}

/**
 * Duel Players
 */
function cmd_state_set_activity_html_root(html_root: HTMLElement): Promise<void> {
  state.duel_players.activity.html_root = html_root;
  return Promise.resolve();
}
function cmd_state_set_activity(data: DayActivity[]): Promise<void> {
  state.duel_players.data.activity = data;
  return Promise.resolve();
}
function cmd_state_set_duel_players_html_root(html_root: HTMLElement): Promise<void> {
  state.duel_players.players.html_root = html_root;
  return Promise.resolve();
}
function cmd_state_set_duel_players(data: DPS_PlayerData[]): Promise<void> {
  state.duel_players.data.players = data;
  return Promise.resolve();
}
function cmd_state_set_gamesshort_html_root(html_root: HTMLElement): Promise<void> {
  state.duel_players.games.html_root = html_root;
  return Promise.resolve();
}
function cmd_state_set_gamesshort(data: GameDataShort[]): Promise<void> {
  state.duel_players.data.games = data;
  return Promise.resolve();
}

export { state, ScheduledCmd, GameData, DPS_PlayerData, Cmd };
