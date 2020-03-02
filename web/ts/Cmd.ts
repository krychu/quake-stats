import { state } from "./State";
import * as log from "./Log";

export type Cmd = (data?: any) => Promise<any>;
export interface Cmds {
    funcs: {[name: string]: (data?: any) => Promise<any>};
    scripts: string[];
    run_promises: Promise<void>[]; // one promise per script
};

export function init() {
    window.requestAnimationFrame(step);

    const substate: Cmds = {
        funcs: {},
        scripts: [],
        run_promises: []
    };
    state.cmds = substate;
  log.log("Cmd module initialized");
}

export function shutdown() {
  // nothing here
}

async function step() {
    if (!state.cmds) {
        log.log("Cmd.ts - step - wrong state");
        return;
    }

    while (state.cmds.scripts.length) {
        const script = state.cmds.scripts.shift() as string;

        if (script === "__BARRIER__") {
            continue;
        }

        run(script);
        if (state.cmds.scripts.length && state.cmds.scripts[0] === "__BARRIER__") {
            await Promise.all(state.cmds.run_promises);
        }
    }

  window.requestAnimationFrame(step);
}

export function add_cmds(commands: [string, (data?: any) => Promise<any>][]) {
  commands.forEach(([name, func]) => add_cmd(name, func));
}

export function add_cmd(name: string, func: (data?: any) => Promise<void>) {
    if (!state.cmds) {
        log.log("Cmd.ts - add_cmd - wrong state");
        return;
    }
  state.cmds.funcs[name] = func;
}

export function schedule_barrier() {
    if (!state.cmds) {
        log.log("Cmd.ts - add_cmd - wrong state");
        return;
    }
    state.cmds.scripts.push("__BARRIER__");
}

export function schedule(text: string) {
    if (!state.cmds) {
        log.log("Cmd.ts - add_cmd - wrong state");
        return;
    }
    state.cmds.scripts.push(text);
}

async function run(text: string) {
    const { cmds } = state;
    if (!cmds) {
        log.log("Cmd.ts - run - wrong state");
        return;
    }

    let all_promises: Promise<void>[] = [];

    const promise = new Promise<void>(async (resolve) => {
        const lines = text.split("\n");
        for (let i=0; i<lines.length; i++) {
            const line = lines[i].trim();
            if (line.length && !line.startsWith("//")) {
                if (line === "--") {
                    await Promise.all(all_promises);
                    all_promises = [];
                    continue;
                }

                const parts = line.split(" ");
                let cmd_name = line;
                if (parts[0] === "||") {
                    cmd_name = line.substring(2);
                } else if (parts[0] === "|") {
                    cmd_name = line.substring(1);
                }
                cmd_name = cmd_name.trim();

                if (cmd_name.startsWith("print ")) {
                    console.log(line.substring(6));
                    continue;
                }

                if (!cmds.funcs[cmd_name]) {
                    log.log("Cmd::run - command not found (" + cmd_name + ")");
                    continue;
                }

                if (parts[0] === "||") {
                    all_promises.push(cmds.funcs[cmd_name]());
                } else {
                    await cmds.funcs[cmd_name]();
                }
            }
        }

        await Promise.all(all_promises);
        cmds.run_promises.splice(cmds.run_promises.indexOf(promise, 0), 1);
        resolve();
    });
    cmds.run_promises.push(promise);
}

