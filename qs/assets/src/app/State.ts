import * as log from "./Log";
import * as cmd from "./Cmd";

const commands: [string, Cmd][] = [
  [ "state_set_main_html_root",          cmd_state_set_main_html_root ],
  [ "state_set_games_html_root",         cmd_state_set_games_html_root ],

  // duel player
  [ "state_set_game_cnts",               cmd_state_set_game_cnts ],
  [ "state_set_games",                   cmd_state_set_games ],
  [ "state_set_win_probabilities",       cmd_state_set_win_probabilities ],

  // duel players
  [ "state_set_duel_players_html_root",  cmd_state_set_duel_players_html_root ],
  [ "state_set_duel_players",            cmd_state_set_duel_players ]
]

/*
  - No listeners for state changes, this leads to fragmented, hard to track
    execution flow.
  - If one part of state is in some progress you can express it with status.

 */
let state: State = {
  //num_games:                  number = 10;

  html_main: null,

  cmds: {
    funcs: {},
    buffer: []
  },

  duel_player: {
    player: null,

    data: {
      game_cnt: 40,
      games: [],
      game_cnts: [],
      win_probabilities: []
    },

    games_chart: {
      game_cnt: 20,
      html_root_id: "duel-games-chart",
      html_root: null
      // svg_width: 800,
      // svg_
      //html_root: null
      // uses games.data
    },

    games: {
      show_game_cnt: 20,
      //game_cnt: 40,
      //data: [],
      html_root_id: "duel-games",
      html_root: null
    }

  },

  duel_players: {
    players: {
      html_root: null
    },

    data: {
      players: []
    }
  }
}

interface State {
  html_main: HTMLElement | null;
  cmds: Cmds;

  duel_player: DuelPlayerState;
  duel_players: DPS_State;
}

/**
 * Dual Players
 */
interface DPS_State {
  players: { html_root: HTMLElement | null },
  data: { players: DPS_PlayerData[] }
}

interface DPS_PlayerData {
  name: string;
  game_cnt: number;
}

/**
 * Dual Player
 */
interface DuelPlayerState {
  player: string | null;
  data: DuelPlayerData;
  games_chart: GamesChart;
  games: Games;
}

interface DuelPlayerData {
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

function cmd_state_set_games_html_root(root: HTMLElement): Promise<any> {
  state.duel_player.games.html_root = root;
  return Promise.resolve();
}

/**
 * Duel Player
 */
function cmd_state_set_game_cnts(data: [string, number][]): Promise<any> {
  state.duel_player.data.game_cnts = data;
  return Promise.resolve();
}

function cmd_state_set_games(data: Duel[]): Promise<any> {
  state.duel_player.data.games = data;
  return Promise.resolve();
}

function cmd_state_set_win_probabilities(data: any[]): Promise<any> {
  state.duel_player.data.win_probabilities = data;
  return Promise.resolve();
}

/**
 * Duel Players
 */
function cmd_state_set_duel_players_html_root(html_root: HTMLElement): Promise<void> {
  state.duel_players.players.html_root = html_root;
  return Promise.resolve();
}
function cmd_state_set_duel_players(data: DPS_PlayerData[]): Promise<void> {
  state.duel_players.data.players = data;
  return Promise.resolve();
}

export { state, ScheduledCmd, GameData, Duel, DPS_PlayerData, Cmd };
