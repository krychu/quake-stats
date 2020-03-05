import { state } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";
import {
    rec_refresh_duel_players_page,
    rec_refresh_duel_player_page
} from "./Recipes";

export interface Header {
    html_root: HTMLElement | null;
    time_period: string | null;
};

const commands: [string, cmd.Cmd][] = [
    [ "header_create_html_root",      cmd_header_create_html_root ],
    [ "header_attach_html_root",      cmd_header_attach_html_root ]
];

export function init() {
    cmd.add_cmds(commands);
    const time_period = sessionStorage.getItem("time_period");
    const substate: Header = {
        html_root: null,
        time_period: time_period ? time_period : "3 months"
    }
    state.header = substate;
    log.log("Header module initialized");
}

export function shutdown() {
}

async function cmd_header_create_html_root(): Promise<void> {
    if (!state.header || !state.header.time_period) {
        log.log("Header.ts - cmd_header_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.id = "header";
    html_root.insertAdjacentHTML("beforeend", _html_render_header(state.header.time_period));
    (html_root.querySelector("select") as HTMLElement).addEventListener("change", on_time_range_change);
    state.header.html_root = html_root;
    return Promise.resolve();
}

async function cmd_header_attach_html_root(): Promise<void> {
    if (!state.header || !state.header.html_root) {
        log.log("Header.ts - cmd_header_attach_html_root - wrong state");
        return Promise.reject();
    }

    document.body.prepend(state.header.html_root);
    return Promise.resolve();
}

export function on_time_range_change() {
    if (!state.header || !state.header.html_root) {
        return;
    }
    state.header.time_period = (state.header.html_root.querySelector("select") as HTMLSelectElement).value;
    sessionStorage.setItem("time_period", state.header.time_period);

    if (state.page === "duel_players") {
        rec_refresh_duel_players_page();
    } else {
        rec_refresh_duel_player_page();
    }
}

function _html_render_header(cur_time_period: string) {
    let html_options = "";

    ["1 month", "3 months", "6 months", "1 year", "100 years"].forEach((time_period) => {
        const label = time_period === "100 years" ? "all time" : time_period;
        const selected = cur_time_period === time_period ? "selected" : "";
        html_options += `<option value="${time_period}" ${selected}>${label}</div>`;
    });

    return `
<div class="header__logo">QWSTATS</div>
<select>
${html_options}
</select>
`;
}
