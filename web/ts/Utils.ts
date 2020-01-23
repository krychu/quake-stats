/**
 * Note that only one element is returned. If string represents mutiple elements
 * without a parent, only the first one is returned.
 **/
export function htmlToElement(html: string): HTMLElement {
    const template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstElementChild as HTMLElement;
}

export function time_ago(date: string): string {
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
