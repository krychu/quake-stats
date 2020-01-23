import { state, GameDataShort, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "gamesshort_create_html_root",      cmd_gamesshort_create_html_root ],
    [ "gamesshort_attach_html_root",      cmd_gamesshort_attach_html_root ],
    [ "gamesshort_render_data",           cmd_gamesshort_render_data ],
];

export function init() {
    cmd.add_cmds(commands);
    log.log("GamesShort module initialized");
}

export function shutdown() {
}

//------------------------------------------------------------------------------
// Commands
//------------------------------------------------------------------------------

function cmd_gamesshort_create_html_root(): Promise<any> {
    const html_root = document.createElement("div");
    html_root.className = "m11-gamesshort";
    return Promise.resolve(html_root);
}

function cmd_gamesshort_attach_html_root(): Promise<any> {
    if (state.duel_players.games.html_root == null || state.html_main_2cols == null) {
        log.log("Games::cmd_gamesshort_attach_html_root - state doesn't contain required data");
        return Promise.reject();
    }

    state.html_main_2cols.appendChild(state.duel_players.games.html_root);
    return Promise.resolve();
}

function cmd_gamesshort_render_data(): Promise<any> {
    //const { data, games } = state;

    if (state.duel_players.games.html_root == null || state.duel_players.data.games == null) {
        log.log("Games::cmd_games_render_data - state doesn't contain required data");
        return Promise.reject();
    }

    _html_remove_games(state.duel_players.games.html_root);
    _html_render_games(state.duel_players.data.games.slice(0, state.duel_players.games.show_game_cnt), state.duel_players.games.html_root);

    return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_games(element: HTMLElement) {
    console.log(element);
    log.log("IMPLEMENT ME: _html_remove_games");
}

function _html_render_games(data: GameDataShort[], element: HTMLElement) {
  let rows = _html_render_games_header();
  //rows += data.map(([a, b]) => _html_render_games_row(data)).join("");
  rows += data.map((g) => _html_render_games_row(g)).join("");
  const html = `
${rows}
`;

    element.insertAdjacentHTML("beforeend", html);
}

function _html_render_games_header(): string {
    return `
<div class="m11-gamesshort__header">
    <div class="m11-gamesshort__header__when-cell">when</div>
    <div class="m11-gamesshort__header__cell">player</div>
    <div class="m11-gamesshort__header__cmp-cell">frags</div>
    <div class="m11-gamesshort__header__cell">player</div>
    <div class="m11-games__header__map-cell">map</div>
</div>
`;
}

function _html_render_games_row(g: GameDataShort): string {
    return `
<div class="m11-gamesshort__game">
    <div class="m11-gamesshort__game__when-cell">${_time_ago(g.date)}</div>
    <div class="m11-gamesshort__game__player-a-cell"><div>${g.a_name}</div></div>
    <div class="m11-gamesshort__game__cmp-cell">${_cmp_frags(g)}</div>
    <div class="m11-gamesshort__game__player-b-cell"><div>${g.b_name}</div></div>
    <div class="m11-gamesshort__game__map-cell"><div>${g.map}</div></div>
</div>
`;
}

function _cmp_frags(g: GameDataShort): string {
  if (g.a_frags == null || g.a_frags == null) {
    return _cmp_na();
  }

  const [a_frags, b_frags] = [Math.max(g.a_frags, 0), Math.max(g.b_frags, 0)];

  // bar is in the range [-1; 1]
  let bar = 0;
  if (a_frags + b_frags !== 0) {
    bar = 2.0 * (b_frags / (a_frags + b_frags) - 0.5);
  }

  return _cmp(g.a_frags.toString(), g.b_frags.toString(), bar);
}

function _cmp(a: string, b: string, bar: number, mul: number = 40, is_percent: boolean = false): string {
  //const mul = 32;
  const bar_width = Math.abs(bar) * mul;
  let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
  if (bar >= 0) {
    bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
  }
  let percent_span = "";
  if (is_percent) {
    percent_span = `<span class="m11-games__game__cell__percent">%</span>`;
  }
  return `
<div class="m11-games__game__cmp-cell__a">${a}${percent_span}</div>
<div class="m11-games__game__cmp-cell__separator"></div>
<div class="m11-games__game__cmp-cell__b">${b}${percent_span}</div>
<div class="m11-games__game__cmp-cell__bar ${bar <= 0 ? "m11-games__game__cmp-cell__bar--better" : "m11-games__game__cmp-cell__bar--worse"}" style="${bar_style}"></div>
`;
}

function _cmp_na(): string {
  return `<div class="m11-games__game__cmp-cell__na">n/a</div>`;
}

function _time_ago(date: string) {
    const parts = date.split(":").map(part => parseInt(part));
    const units = ["d", "h", "m"];

    for (let i=0; i<units.length; i++) {
      if (!isNaN(parts[i]) && parts[i] !== 0.0) {
        // if (units[i] === "d" && parts[i] > 365) {
        //   return Math.floor(parts[i] / 365).toString() + "y+";
        // } else {
          return parts[i] + units[i];
        //}
      }
    }

    return "?";
}

// function _frac_to_percent(a: number): string {
//   return (a * 100.0).toFixed(0).toString();
// }
