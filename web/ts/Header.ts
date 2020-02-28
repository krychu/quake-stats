import { state, Cmd } from "./State";
import * as cmd from "./Cmd";
import * as log from "./Log";

const commands: [string, Cmd][] = [
    [ "header_create_html_root",      cmd_header_create_html_root ],
    [ "header_attach_html_root",      cmd_header_attach_html_root ]
];

export function init() {
    cmd.add_cmds(commands);
    log.log("Header module initialized");

    state.header = {
        html_root: null,
        time_period: null
    };
}

export function shutdown() {
}

async function cmd_header_create_html_root(): Promise<void> {
    const html_root = document.createElement("div");
    html_root.id = "header";
    html_root.insertAdjacentHTML("beforeend", _html_render_header());
    state.header.html_root = html_root;
    return Promise.resolve();
}

async function cmd_header_attach_html_root(): Promise<void> {
    if (!state.header.html_root) {
        log.log("Header:cmd_header_attach_html_root - state doesn't contain required data");
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
