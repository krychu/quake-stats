import { state, GameData, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "games_create_html_root",      cmd_games_create_html_root ],
    [ "games_attach_html_root",      cmd_games_attach_html_root ],
    [ "games_render_data",           cmd_games_render_data ],
];

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

// function cmd_games_find_html_root(): Promise<any> {
//   const html_root = document.getElementById(state.games.html_root_id);
//   if (html_root == null) {
//     log.log(`Games:cmd_games_find_html_root - can't find element with id '${state.games.html_root_id}'`);
//     return Promise.reject();
//   }

//   return Promise.resolve(html_root);
// }

function cmd_games_create_html_root(): Promise<any> {
    const html_root = document.createElement("div");
    //html_root.setAttribute("id", "duel-games");
    html_root.className = "m11-games";
    return Promise.resolve(html_root);
}

function cmd_games_attach_html_root(): Promise<any> {
    if (state.duel_player.games.html_root == null || state.html_main == null) {
        log.log("Games::cmd_games_attach_html_root - state doesn't contain required data");
        return Promise.reject();
    }

    state.html_main.appendChild(state.duel_player.games.html_root);
    return Promise.resolve();
}

function cmd_games_render_data(): Promise<any> {
    //const { data, games } = state;

    if (state.duel_player.games.html_root == null || state.duel_player.data.games == null) {
        log.log("Games::cmd_games_render_data - state doesn't contain required data");
        return Promise.reject();
    }

    _html_remove_games(state.duel_player.games.html_root);
    _html_render_games(state.duel_player.data.games.slice(0, state.duel_player.games.show_game_cnt), state.duel_player.games.html_root);

    return Promise.resolve();
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
function _html_remove_games(element: HTMLElement) {
    console.log(element);
    log.log("IMPLEMENT ME: _html_remove_games");
}

function _html_render_games(data: GameData[], element: HTMLElement) {
  let rows = _html_render_games_header(data[0]);
  //rows += data.map(([a, b]) => _html_render_games_row(data)).join("");
  rows += data.map((g) => _html_render_games_row(g)).join("");
  const html = `
${rows}
`;

    element.insertAdjacentHTML("beforeend", html);
}

function _html_render_games_header(g: GameData): string {
    return `
<div class="m11-games__header">
    <!--<div class="m11-games__header__player-a-cell"><div>${g.a_name}</div></div>-->
    <div class="m11-games__header__when-cell">when</div>
    <div class="m11-games__header__cmp-cell">frags</div>
    <div class="m11-games__header__cell">opponent</div>
    <div class="m11-games__header__map-cell">map</div>

    <div class="m11-games__separator-cell"></div>

    <!--<div class="duel-games__header__cmp-cell">dmg%</div>-->
    <!--<div class="m11-games__header__cmp-cell">frags %</div>-->
    <!--<div class="m11-games__header__cmp-cell m11-games__cell">FPM</div>-->
    <!--<div class="m11-games__header__cmp-cell m11-games__cell">K/D</div>-->
    <div class="m11-games__header__cmp-cell m11-games__cell--narrow">dmg %</div>
    <!--<div class="m11-games__header__cmp-cell">dmg/min</div>-->
    <div class="m11-games__header__cmp-cell">rl/min</div>
    <div class="m11-games__header__cmp-cell">lg/min</div>
    <div class="m11-games__header__cmp-cell m11-games__cell--narrow">lg acc</div>

    <div class="m11-games__separator-cell"></div>

    <div class="m11-games__header__cmp-cell m11-games__cell--narrow">ra</div>
    <div class="m11-games__header__cmp-cell m11-games__cell--narrow">ya</div>
    <div class="m11-games__header__cmp-cell m11-games__cell--narrow">mh</div>
    <!--<div class="m11-games__header__cmp-cell">speed</div>-->
    <!--<div class="m11-games__header__single-cmp-cell">speed</div>-->
</div>
`;
}

function _html_render_games_row(g: GameData): string {
    return `
<div class="m11-games__game ${g.a_frags > g.b_frags && "m11-games__game--win"}">
    <!--<div class="m11-games__game__player-a-cell"><div>${g.a_name}</div></div>-->
    <div class="m11-games__game__when-cell">${_time_ago(g.date)}</div>
    <div class="m11-games__game__cmp-cell">${_cmp_frags(g)}</div>
    <div class="m11-games__game__player-b-cell"><div>${g.b_name}</div></div>
    <div class="m11-games__game__map-cell"><div>${g.map}</div></div>

    <div class="m11-games__separator-cell"></div>

    <!--<div class="duel-games__game__cmp-cell">${_cmp_damage_percent(g)}</div>-->
    <!--<div class="m11-games__game__cmp-cell">${_cmp_frags_percent(g)}</div>-->
    <div class="m11-games__game__cmp-cell m11-games__cell--narrow">${_cmp_damage_percent(g)}</div>
    <div class="m11-games__game__cmp-cell">${_cmp_rl_damage_minute(g)}</div>
    <div class="m11-games__game__cmp-cell">${_cmp_lg_damage_minute(g)}</div>
    <div class="m11-games__game__cmp-cell m11-games__cell--narrow">${_cmp_lg_accuracy_percent(g)}</div>

    <div class="m11-games__separator-cell"></div>

    <div class="m11-games__game__cmp-cell m11-games__cell--narrow">${_cmp_ra(g)}</div>
    <div class="m11-games__game__cmp-cell m11-games__cell--narrow">${_cmp_ya(g)}</div>
    <div class="m11-games__game__cmp-cell m11-games__cell--narrow">${_cmp_mh(g)}</div>
</div>
`;
}

function _cmp_frags(g: GameData): string {
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

function _cmp_frags_percent(g: GameData): string {
  if (g.a_frags == null || g.b_frags == null) {
    return _cmp_na();
  }

  let [a_frags, b_frags] = [Math.max(g.a_frags, 0), Math.max(g.b_frags, 0)];
  if (a_frags + b_frags === 0) {
    return _cmp_na();
  }

  a_frags = a_frags / (a_frags + b_frags);
  b_frags = 1.0 - a_frags;

  const bar = 2.0 * b_frags - 1.0;

  return _cmp(_frac_to_percent(a_frags), _frac_to_percent(b_frags), bar);
}

// damage proportionn
function _cmp_damage_percent(g: GameData): string {
  if (g.a_dmg_percent == null || g.b_dmg_percent == null) {
    return _cmp_na();
  }

  const bar = 2.0 * (g.b_dmg_percent / 100.0) - 1.0;
  return _cmp(g.a_dmg_percent.toString(), g.b_dmg_percent.toString(), bar);
}

function _cmp_lg_accuracy_percent(g: GameData): string {
  if (g.a_lg_acc_percent == null || g.b_lg_acc_percent == null) {
    return _cmp_na();
  }

  const bar = 2.0 * (g.b_lg_acc_percent / (g.a_lg_acc_percent + g.b_lg_acc_percent)) - 1.0;
  return _cmp(g.a_lg_acc_percent.toString(), g.b_lg_acc_percent.toString(), bar);
}

function _cmp_rl_damage_minute(g: GameData): string {
  if (g.a_rl_dmg_minute == null || g.b_rl_dmg_minute == null) {
    return _cmp_na();
  }

  const [a_dmg, b_dmg] = [g.a_rl_dmg_minute, g.b_rl_dmg_minute];
  let bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
  return _cmp(a_dmg.toString(), b_dmg.toString(), bar);
}

function _cmp_lg_damage_minute(g: GameData): string {
  if (g.a_lg_dmg_minute == null || g.b_lg_dmg_minute == null) {
    return _cmp_na();
  }

  const [a_dmg, b_dmg] = [g.a_lg_dmg_minute, g.b_lg_dmg_minute];
  let bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
  return _cmp(a_dmg.toString(), b_dmg.toString(), bar);
}

function _cmp_ra(g: GameData): string {
  if (g.a_ra == null && g.b_ra == null) {
    return _cmp_na();
  }
  const bar = 2.0 * g.b_ra / (g.a_ra + g.b_ra) - 1.0;
  return _cmp(g.a_ra.toString(), g.b_ra.toString(), bar);
}

function _cmp_ya(g: GameData): string {
    if (g.a_ya == null && g.b_ya == null) {
        return _cmp_na();
    }
    const bar = 2.0 * g.b_ya / (g.a_ya + g.b_ya) - 1.0;
    return _cmp(g.a_ya.toString(), g.b_ya.toString(), bar);
}

function _cmp_mh(g: GameData): string {
  if (g.a_mh == null && g.b_mh == null) {
    return _cmp_na();
  }
  const bar = 2.0 * g.b_mh / (g.a_mh + g.b_mh) - 1.0;
  return _cmp(g.a_mh.toString(), g.b_mh.toString(), bar);
}

function _cmp_speed(g: GameData): string {
  if (g.a_speed_avg == null && g.b_speed_avg == null) {
    return _cmp_na();
  }
  const bar = 2.0 * g.b_speed_avg / (g.a_speed_avg + g.b_speed_avg) - 1.0;
  return _cmp(g.a_speed_avg.toString(), g.b_speed_avg.toString(), bar);
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

function _single_cmp(a: string, bar: number, mul: number = 32, is_percent: boolean = false): string {
    //const mul = 32;
    const bar_width = Math.abs(bar) * mul;
    let bar_style = `width: ${bar_width}px;`;
    // if (bar >= 0) {
    //     bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
    // }
    let percent_span = "";
    if (is_percent) {
        percent_span = `<span class="m11-games__game__cell__percent">%</span>`;
    }
    return `
<div class="m11-games__game__single-cmp-cell__a">${a}${percent_span}</div>
<div class="m11-games__game__single-cmp-cell__bar ${bar <= 0 ? "m11-games__game__cmp-cell__bar--better" : "m11-games__game__single-cmp-cell__bar--worse"}" style="${bar_style}"></div>
`;
}

// function _cmp_diff(a: string, bar: number, mul: number = 32): string {
//   const bar_width = Math.abs(bar) * mul;
//   const bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;

//   return `
// <div class="duel-games__game__diff-cell__a">${a}</div>
// <div class="duel-games__game__diff-cell__bar ${bar <= 0 ? "duel-games__game__diff-cell__bar--better" : "duel-games__game__diff-cell__bar--worse"}" style="${bar_style}"></div>
// `;
// }

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

function _frac_to_percent(a: number): string {
  return (a * 100.0).toFixed(0).toString();
}
