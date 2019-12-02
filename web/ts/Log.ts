export function init() {
    
}

export function shutdown() {
    
}

export function log(...args: any[]) {
    const message = args.join(", ");
    console.log(message);
}
