import { state } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

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
    const substate: Header = {
        html_root: null,
        time_period: null
    }
    state.header = substate;
    log.log("Header module initialized");
}

export function shutdown() {
}

async function cmd_header_create_html_root(): Promise<void> {
    if (!state.header) {
        log.log("Header.ts - cmd_header_create_html_root - wrong state");
        return Promise.reject();
    }
    const html_root = document.createElement("div");
    html_root.id = "header";
    html_root.insertAdjacentHTML("beforeend", _html_render_header());
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

function _html_render_header() {
    return `
<div class="header__logo">QWSTATS</div>
<div class="header__time">period</div>
`;
}
