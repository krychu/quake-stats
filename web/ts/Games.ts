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
    //[ "games_fetch_data",            cmd_games_fetch_data ],
    // [ "games_create_html_root",      cmd_games_create_html_root ],
    // [ "games_attach_html_root",      cmd_games_attach_html_root ],
    // WE CAN NIX THIS ONE AND HAVE RENDER ONLY WHICH PUTS STUFF INSIDE AN ELEMENT WITH THE GIVEN ID
    //[ "games_find_html_root",        cmd_games_find_html_root ],
    [ "games_create_html_root",      cmd_games_create_html_root ],
    [ "games_attach_html_root",      cmd_games_attach_html_root ],
    [ "games_render_data",           cmd_games_render_data ],

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
    html_root.className = "m1vs1-games";
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

function _html_render_games(data: Duel[], element: HTMLElement) {
  const title = _html_render_title();
  let rows = _html_render_games_header();
  rows += data.map(([a, b]) => _html_render_games_row(a, b)).join("");
  const html = `
${title}
${rows}
`;

    element.insertAdjacentHTML("beforeend", html);
}

function _html_render_title(): string {
  return `
<div class="title">
Recent games
</div>
`;
}

function _html_render_games_header(): string {
    return `
<div class="m1vs1-games__header">
    <div class="m1vs1-games__header__cell"></div>
    <div class="m1vs1-games__header__cmp-cell">frags</div>
    <div class="m1vs1-games__header__cell">opponent</div>
    <div class="m1vs1-games__header__cell">map</div>
    <!--<div class="duel-games__header__cmp-cell">dmg%</div>-->
    <!--<div class="m1vs1-games__header__cmp-cell">frags %</div>-->
    <div class="m1vs1-games__header__cmp-cell m1vs1-games__cell--narrow">dmg %</div>
    <!--<div class="m1vs1-games__header__cmp-cell">dmg/min</div>-->
    <div class="m1vs1-games__header__cmp-cell">rl/min</div>
    <div class="m1vs1-games__header__cmp-cell">lg/min</div>
    <div class="m1vs1-games__header__cmp-cell m1vs1-games__cell--narrow">lg acc</div>
    <div class="m1vs1-games__separator-cell"></div>
    <div class="m1vs1-games__header__cmp-cell m1vs1-games__cell--narrow">ra</div>
    <div class="m1vs1-games__header__cmp-cell m1vs1-games__cell--narrow">ya</div>
    <div class="m1vs1-games__header__cmp-cell m1vs1-games__cell--narrow">mh</div>
    <!--<div class="m1vs1-games__header__cmp-cell">speed</div>-->
    <div class="m1vs1-games__header__single-cmp-cell">speed</div>
    <div class="m1vs1-games__header__cell">when</div>
</div>
`;
}

function _html_render_games_row(a: GameData, b: GameData): string {
    return `
<div class="m1vs1-games__game ${a.frags > b.frags && "m1vs1-games__game--win"}">
    <div class="m1vs1-games__game__player-a-cell">${a.name}</div>
    <div class="m1vs1-games__game__cmp-cell">${_cmp_frags(a, b)}</div>
    <div class="m1vs1-games__game__cell">${b.name}</div>
    <div class="m1vs1-games__game__cell">${a.map}</div>
    <!--<div class="duel-games__game__cmp-cell">${_cmp_damage_percent(a, b)}</div>-->
    <!--<div class="m1vs1-games__game__cmp-cell">${_cmp_frags_percent(a, b)}</div>-->
    <div class="m1vs1-games__game__cmp-cell m1vs1-games__cell--narrow">${_cmp_damage_percent(a, b)}</div>
    <!--<div class="m1vs1-games__game__cmp-cell">${_cmp_damage_minute(a, b)}</div>-->
    <!--<div class="m1vs1-games__game__cmp-cell">${_cmp_rl_damage_minute_diff(a, b)}</div>-->
    <!--<div class="m1vs1-games__game__cmp-cell">${_cmp_lg_damage_minute_diff(a, b)}</div>-->
    <div class="m1vs1-games__game__cmp-cell">${_cmp_rl_damage_minute(a, b)}</div>
    <div class="m1vs1-games__game__cmp-cell">${_cmp_lg_damage_minute(a, b)}</div>
    <div class="m1vs1-games__game__cmp-cell m1vs1-games__cell--narrow">${_cmp_lg_accuracy_percent(a, b)}</div>

    <div class="m1vs1-games__separator-cell"></div>

    <div class="m1vs1-games__game__cmp-cell m1vs1-games__cell--narrow">${_cmp_ra(a, b)}</div>
    <div class="m1vs1-games__game__cmp-cell m1vs1-games__cell--narrow">${_cmp_ya(a, b)}</div>
    <div class="m1vs1-games__game__cmp-cell m1vs1-games__cell--narrow">${_cmp_mh(a, b)}</div>
    <!--<div class="m1vs1-games__game__cmp-cell">${_cmp_speed_diff(a, b)}</div>-->
    <div class="m1vs1-games__game__single-cmp-cell">${_cmp_speed_diff(a, b)}</div>
    <div class="m1vs1-games__game__cell">${_time_ago(a.date)}</div>
</div>
`;
}

function _cmp_frags(a: GameData, b: GameData): string {
  if (a.frags == null || b.frags == null) {
    return _cmp_na();
  }

  const [a_frags, b_frags] = [Math.max(a.frags, 0), Math.max(b.frags, 0)];

  // bar is in the range [-1; 1]
  let bar = 0;
  if (a_frags + b_frags !== 0) {
    bar = 2.0 * (b_frags / (a_frags + b_frags) - 0.5);
  }

  return _cmp(a.frags.toString(), b.frags.toString(), bar);
}

// function _cmp_damage_gt(a: GameData, b: GameData): string {
//   let [a_gt, b_gt, bar] = [0, 0, 0];
//   a_gt = a.damage_given / Math.max(a.damage_taken, 1);
//   b_gt = b.damage_given / Math.max(b.damage_taken, 1);

//   return _cmp(a_gt, b_gt, bar);
// }

function _cmp_frags_percent(a: GameData, b: GameData): string {
  if (a.frags == null || b.frags == null) {
    return _cmp_na();
  }

  let [a_frags, b_frags] = [Math.max(a.frags, 0), Math.max(b.frags, 0)];
  if (a_frags + b_frags === 0) {
    return _cmp_na();
  }

  a_frags = a_frags / (a_frags + b_frags);
  b_frags = 1.0 - a_frags;

  const bar = 2.0 * b_frags - 1.0;

  return _cmp(_frac_to_percent(a_frags), _frac_to_percent(b_frags), bar);
}

// damage proportionn
function _cmp_damage_percent(a: GameData, b: GameData): string {
  if (a.damage_given == null || b.damage_given == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  if (a.damage_given + b.damage_given !== 0) {
    a_dmg = a.damage_given / (a.damage_given + b.damage_given);
    b_dmg = 1.0 - a_dmg;
    bar = 2.0 * b_dmg - 1.0;
  }
  return _cmp(_frac_to_percent(a_dmg), _frac_to_percent(b_dmg), bar);
}

function _cmp_lg_damage_percent(a: GameData, b: GameData): string {
  if (a.lg_damage == null || b.lg_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //const total = a.lg_damage + a.rl_damage + b.lg_damage + b.rl_damage;
  const total = a.lg_damage + b.lg_damage;
  if (total !== 0) {
    a_dmg = a.lg_damage / total;
    b_dmg = b.lg_damage / total;
    //bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
    bar = 2.0 * b_dmg - 1.0;
  }
  return _cmp(_frac_to_percent(a_dmg), _frac_to_percent(b_dmg), bar);
}

function _cmp_rl_damage_percent(a: GameData, b: GameData): string {
  if (a.rl_damage == null || b.rl_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //const total = a.lg_damage + a.rl_damage + b.lg_damage + b.rl_damage;
  const total = a.rl_damage + b.rl_damage;
  if (total !== 0) {
    a_dmg = a.rl_damage / total;
    b_dmg = b.rl_damage / total;
    //bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
    bar = 2.0 * b_dmg - 1.0;
  }
  return _cmp(_frac_to_percent(a_dmg), _frac_to_percent(b_dmg), bar); // 32, true
  //return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
}

// damage g/t - alternative to dmg percent
// currently *_gt functions have wrong bar formulas
function _cmp_damage_gt(a: GameData, b: GameData): string {
  if (a.damage_given == null || b.damage_given == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given + b.damage_given !== 0) {
  a_dmg = a.damage_given / Math.max(a.damage_taken, 1);
  b_dmg = b.damage_given / Math.max(b.damage_taken, 1);
  bar = 2.0 * ((b_dmg - 0.5) / 1.5) - 1.0;
  bar = Math.max(Math.min(bar, 1.0), -1.0);
    //bar = 2.0 * b_dmg - 1.0;
  //}
  return _cmp(a_dmg.toFixed(1).toString(), b_dmg.toFixed(1).toString(), bar);
}

function _cmp_lg_damage_gt(a: GameData, b: GameData): string {
  if (a.lg_damage == null || b.lg_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  a_dmg = a.lg_damage / Math.max(b.lg_damage, 1);
  b_dmg = b.lg_damage / Math.max(a.lg_damage, 1);
  //a_dmg = a.lg_damage / a.tl;
  //b_dmg = b.lg_damage / a.tl;
  bar = 2.0 * ((b_dmg - 0.5) / 1.5) - 1.0;
  bar = Math.max(Math.min(bar, 1.0), -1.0);

  return _cmp(a_dmg.toFixed(1).toString(), b_dmg.toFixed(1).toString(), bar);
}

function _cmp_rl_damage_gt(a: GameData, b: GameData): string {
  if (a.rl_damage == null || b.rl_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  a_dmg = a.rl_damage / Math.max(b.rl_damage);
  b_dmg = b.rl_damage / Math.max(a.rl_damage);
  bar = 2.0 * ((b_dmg - 0.5) / 1.5) - 1.0;
  bar = Math.max(Math.min(bar, 1.0), -1.0);

  return _cmp(a_dmg.toFixed(1).toString(), b_dmg.toFixed(1).toString(), bar);
}

function _cmp_lg_accuracy_percent(a: GameData, b: GameData): string {
  if (a.lg_accuracy == null || b.lg_accuracy == null) {
    return _cmp_na();
  }

  let [a_acc, b_acc, bar] = [0, 0, 0];
  if (a.lg_accuracy != null && b.lg_accuracy != null) {
    a_acc = a.lg_accuracy;
    b_acc = b.lg_accuracy;
    bar = 2.0 * b_acc / (a_acc + b_acc) - 1.0;
  }
  return _cmp(_frac_to_percent(a_acc), _frac_to_percent(b_acc), bar);
}

function _cmp_damage_minute(a: GameData, b: GameData): string {
  if (a.damage_given == null || b.damage_given == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given != null && b.damage_given != null) {
    a_dmg = a.damage_given / a.tl;
    b_dmg = b.damage_given / a.tl;
  //bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
  bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
  //}
  return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
}

function _cmp_rl_damage_minute(a: GameData, b: GameData): string {
  if (a.rl_damage == null || b.rl_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given != null && b.damage_given != null) {
    a_dmg = a.rl_damage / a.tl;
    b_dmg = b.rl_damage / a.tl;
  bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
//    bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
  //}
  return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
}

function _cmp_rl_damage_minute_diff(a: GameData, b: GameData): string {
  if (a.rl_damage == null || b.rl_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given != null && b.damage_given != null) {
  a_dmg = a.rl_damage / a.tl;
  b_dmg = b.rl_damage / a.tl;
  bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
  //    bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
  //}
  //return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
  const dmg_diff = (a_dmg - b_dmg).toFixed(0);
    //return _cmp((dmg_diff > 0 ? "+" : "") + dmg_diff.toString(), "", bar);
    return _cmp((a_dmg > b_dmg ? "+" : "") + dmg_diff, "", bar);
}

function _cmp_lg_damage_minute(a: GameData, b: GameData): string {
  if (a.lg_damage == null || b.lg_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given != null && b.damage_given != null) {
    a_dmg = a.lg_damage / a.tl;
    b_dmg = b.lg_damage / a.tl;
  bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
//    bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
  //}
  return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
}

function _cmp_lg_damage_minute_diff(a: GameData, b: GameData): string {
  if (a.lg_damage == null || b.lg_damage == null) {
    return _cmp_na();
  }

  let [a_dmg, b_dmg, bar] = [0, 0, 0];
  //if (a.damage_given != null && b.damage_given != null) {
  a_dmg = a.lg_damage / a.tl;
  b_dmg = b.lg_damage / a.tl;
  bar = 0;
  if (a_dmg > b_dmg) {
    bar = Math.max(1.0 - a_dmg / b_dmg, -1.0);
  } else if (b_dmg > a_dmg) {
    bar = Math.min(b_dmg / a_dmg - 1.0, 1.0);
  }
  //    bar = 2.0 * b_dmg / (a_dmg + b_dmg) - 1.0;
  //}
  //return _cmp(a_dmg.toFixed(0).toString(), b_dmg.toFixed(0).toString(), bar);
  const dmg_diff = (a_dmg - b_dmg).toFixed(0);
    //return _cmp((dmg_diff > 0 ? "+" : "") + dmg_diff.toString(), "", bar);
    return _cmp((a_dmg > b_dmg ? "+" : "") + dmg_diff, "", bar);
}

function _cmp_ra(a: GameData, b: GameData): string {
  if (a.ra == null && b.ra == null) {
    return _cmp_na();
  }
  const a_ra = a.ra || 0;
  const b_ra = b.ra || 0;
  const bar = 2.0 * b_ra / (a_ra + b_ra) - 1.0;
  return _cmp(a_ra.toString(), b_ra.toString(), bar);
}

function _cmp_ya(a: GameData, b: GameData): string {
    if (a.ya == null && b.ya == null) {
        return _cmp_na();
    }
    const a_ya = a.ya || 0;
    const b_ya = b.ya || 0;
    const bar = 2.0 * b_ya / (a_ya + b_ya) - 1.0;
    return _cmp(a_ya.toString(), b_ya.toString(), bar);
}

function _cmp_mh(a: GameData, b: GameData): string {
  if (a.health_100 == null && b.health_100 == null) {
    return _cmp_na();
  }
  const a_mh = a.health_100 || 0;
  const b_mh = b.health_100 || 0;
  const bar = 2.0 * b_mh / (a_mh + b_mh) - 1.0;
  return _cmp(a_mh.toString(), b_mh.toString(), bar);
}

function _cmp_speed(a: GameData, b: GameData): string {
  if (a.speed_avg == null && b.speed_avg == null) {
    return _cmp_na();
  }
  const a_speed = a.speed_avg || 0;
  const b_speed = b.speed_avg || 0;
  const bar = 2.0 * b_speed / (a_speed + b_speed) - 1.0;
  return _cmp(a_speed.toFixed(0).toString(), b_speed.toFixed(0).toString(), bar);
}

function _cmp_speed_diff(a: GameData, b: GameData): string {
  if (a.speed_avg == null || b.speed_avg == null) {
    return _cmp_na();
  }
  const bar = Math.max(Math.min((b.speed_avg - a.speed_avg) / 100.0, 1.0), -1.0);
  //return _cmp_diff((a.speed_avg - b.speed_avg).toFixed(0).toString(), bar);
  const speed_diff = (a.speed_avg - b.speed_avg).toFixed(0);
    //return _cmp((speed_diff > 0 ? "+" : "") + speed_diff.toString(), "", bar);
    //return _cmp((a.speed_avg > b.speed_avg ? "+" : "") + speed_diff, "", bar);
    return _single_cmp((a.speed_avg > b.speed_avg ? "+" : "") + speed_diff, bar);
}

// function _cmp_pickups(a: GameData, b: GameData): string {
//   let [a_pick, b_pick, bar] = [0, 0, 0];
//   const [ra, ya, mh] = [1.0, 0.7, 0.5];
//   a_pick = a.ra * ra + a.health_100 * mh + a.ya * ya;
//   b_pick = b.ra * ra + b.health_100 * mh + b.ya * ya;
//   bar = 2.0 * b_pick / (a_pick + b_pick) - 1.0;
//   return _cmp(a_pick.toFixed(0).toString(), b_pick.toFixed(0).toString(), bar);
// }

function _cmp(a: string, b: string, bar: number, mul: number = 40, is_percent: boolean = false): string {
  //const mul = 32;
  const bar_width = Math.abs(bar) * mul;
  let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
  if (bar >= 0) {
    bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
  }
  let percent_span = "";
  if (is_percent) {
    percent_span = `<span class="m1vs1-games__game__cell__percent">%</span>`;
  }
  return `
<div class="m1vs1-games__game__cmp-cell__a">${a}${percent_span}</div>
<div class="m1vs1-games__game__cmp-cell__separator"></div>
<div class="m1vs1-games__game__cmp-cell__b">${b}${percent_span}</div>
<div class="m1vs1-games__game__cmp-cell__bar ${bar <= 0 ? "m1vs1-games__game__cmp-cell__bar--better" : "m1vs1-games__game__cmp-cell__bar--worse"}" style="${bar_style}"></div>
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
        percent_span = `<span class="m1va1-games__game__cell__percent">%</span>`;
    }
    return `
<div class="m1vs1-games__game__single-cmp-cell__a">${a}${percent_span}</div>
<div class="m1vs1-games__game__single-cmp-cell__bar ${bar <= 0 ? "m1vs1-games__game__cmp-cell__bar--better" : "m1vs1-games__game__single-cmp-cell__bar--worse"}" style="${bar_style}"></div>
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
  return `<div class="m1vs1-games__game__cmp-cell__na">n/a</div>`;
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

// [-1; 1]
// function _frags(a: GameData, b: GameData): number {
//   if (a.frags + b.frags === 0) {
//     return 0;
//   }

//   return 2.0 * (b.frags / (a.frags + b.frags) - 0.5);
// }


// function _fragsCss(n: number): string {
// //  if HERE
// }
