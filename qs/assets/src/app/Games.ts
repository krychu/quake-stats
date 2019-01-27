import { state, Duel, GameData, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";
//import * as utils from "./Utils";

// export interface CmdFetchGames {
//   player?: string;
//   num_games?: number;
// }
//export function cmd_fetch_games(args: CmdFetchGames) {

const commands: [string, Cmd][] = [
  [ "games_fetch_data",            cmd_games_fetch_data ],
  // [ "games_create_html_root",      cmd_games_create_html_root ],
  // [ "games_attach_html_root",      cmd_games_attach_html_root ],
  // WE CAN NIX THIS ONE AND HAVE RENDER ONLY WHICH PUTS STUFF INSIDE AN ELEMENT WITH THE GIVEN ID
  [ "games_find_html_root",        cmd_games_find_html_root ],
  [ "games_render_data",           cmd_games_render_data ],

  [ "state_set_games_data",        cmd_state_set_games_data ],
  [ "state_set_games_html_root",   cmd_state_set_games_html_root ],
//[ "games_data_gset",             cmd_games_data_gset ],
  //[ "games_html_root_gset",        cmd_games_html_root_gset ],
];

// cmd_state_set_game_data
// cmd_state_set_game_html_root

export function init() {
  cmd.add_cmds(commands);
  log.log("Games module initialized");
  // cmd.schedule_cmd("games_create_html_root");
  // cmd.schedule_cmd("games_attach_html_root");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------
function cmd_state_set_games_data(data: Duel[]): Promise<any> {
  state.games.data = data;
  return Promise.resolve();
}

function cmd_state_set_games_html_root(root: HTMLElement): Promise<any> {
  state.games.html_root = root;
  return Promise.resolve();
}

function cmd_games_fetch_data(): Promise<any> {
  const { player, games } = state;
  if (player == null) {
    log.log("Games::cmd_games_fetch - player is null");
    return Promise.reject();
  }

  return fetch(_api_url(player, games.game_cnt))
    .then((response) => response.json())
    .then((json) => {
      //cmd.schedule_cmd("state_set_games_data", json);
      return json;
      //return true;
      //cmd.schedule_cmd("games_render_data");
    });
}

// function cmd_games_create_html_root(): Promise<any> {
//   const root = utils.htmlToElement(`
//     <div class="games">
//     </div>
//   `);
//   //cmd.schedule_cmd("state_set_games_html_root", root);
//   return Promise.resolve(root);
// }

// function cmd_games_attach_html_root(html_id: string): Promise<any> {
//   const parent = document.getElementById(html_id);
//   if (parent == null || state.games.html_root == null) {
//     log.log("Games::cmd_games_attach_html_root - neessary elemets are not available");
//     return Promise.reject();
//   }
//   parent.append(state.games.html_root);
//   return Promise.resolve();
// }

function cmd_games_find_html_root(): Promise<any> {
  const html_root = document.getElementById(state.games.html_root_id);
  if (html_root == null) {
    log.log(`Games:cmd_games_find_html_root - can't find element with id '${state.games.html_root_id}'`);
    return Promise.reject();
  }

  return Promise.resolve(html_root);
}

function cmd_games_render_data(): Promise<any> {
  const { games } = state;

  if (games.html_root == null || games.data == null) {
    log.log("Games::cmd_games_render_data - state doesn't contain required data");
    return Promise.reject();
  }

  _html_remove_games(games.html_root);
  _html_render_games(games.data.slice(0, games.show_game_cnt), games.html_root);

  return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_games(element: HTMLElement) {
  console.log(element);
  log.log("IMPLEMENT ME: _html_remove_games");
}

function _html_render_games(data: Duel[], element: HTMLElement) {
  let rows = _html_render_games_header();
  rows += data.map(([a, b]) => _html_render_games_row(a, b)).join("");
  const html = `
${rows}
`;

  element.insertAdjacentHTML("beforeend", html);
}

function _api_url(player: string, game_cnt: number): string {
  return `/api/duel/${player}/games/${game_cnt}`;
}

function _html_render_games_header(): string {
  return `
<div class="header-row">
  <div class="cell opponent">opponent</div>
  <div class="cell map">map</div>
  <div class="cell frags">frags</div>
  <div class="cell">K/D</div>
  <div class="cell">G/T</div>
  <div class="cell">LG%</div>
  <div class="cell">dmg/min</div>
  <div class="cell">ra</div>
  <div class="cell"></div>
</div>
`;
}

function _html_render_games_row(a: GameData, b: GameData): string {
  return `
<div class="game-row ${a.frags > b.frags && "win"}">
  <div class="cell opponent">${b.name}</div>
  <div class="cell map">${a.map}</div>
  <div class="cell frags">
    <div class="frags-a">${a.frags}</div>
    <div class="frags-separator">:</div>
    <div class="frags-b">${b.frags}</div>
  </div>
  <div class="cell">${a.kd.toFixed(2)}</div>
  <div class="cell">${a.dmg_gt.toFixed(1)}</div>
  <div class="cell">${a.lg_acc != null && a.lg_acc.toFixed(2)}</div>
  <div class="cell">${a.dmg_per_minute.toFixed(0)}</div>
  <div class="cell">${a.ra}</div>
  <div class="cell">${(a.ra / Math.max(a.ra + b.ra, 1)).toFixed(1)}</div>
</div>
`;
}
