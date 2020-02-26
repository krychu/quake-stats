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

    if (parts[0] === 0.0) {
        return "TODAY";
    } else if (parts[0] > 365) {
        return "+365 d";
    } else {
        return parts[0] + " d";
    }
}

export function time_ago_old(date: string): string {
    const parts = date.split(":").map(part => parseInt(part));
    const units = ["d", "h", "m"];

    for (let i=0; i<units.length; i++) {
        if (!isNaN(parts[i]) && parts[i] !== 0.0) {
            // if (units[i] === "d" && parts[i] > 365) {
            //   return Math.floor(parts[i] / 365).toString() + "y+";
            // } else {
            if (units[i] === "d" && parts[i] > 365) {
                return "+365 d";
            }
            return parts[i] + " " + units[i];
            //}
        }
    }

    return "?";
}

/* common html functions */

export function html_cell(value: string | number, extra_classes: string = "", percent = false): string {
    if (value == null) {
        return html_na_cell(extra_classes);
    }

    return `
<div class="table__cell ${extra_classes}">${value}${percent ? "%" : ""}</div>
`;
}

export function html_na_cell(extra_classes: string = ""): string {
    return `<div class="table__cell table__cell--na ${extra_classes}">n/a</div>`
}

export function html_bar_cell(value: number, max_value: number, min_divider = 30, max_width = 70): string {
    const divider = Math.max(max_value, min_divider);
    const bar_width = Math.abs(value / divider) * max_width;

    const bar_style = `width: ${bar_width}px;`;
    return `
<div class="table__bar-cell table__cell--small">
  <div class="table__bar-cell__value">${value.toString()}</div>
  <div class="table__bar-cell__bar" style="${bar_style}"></div>
</div>
`;
}
export function html_header_bar_cell(name: string): string {
    return `<div class="table__cell table__cell--header table__cell--small">${name}</div>`;
}

export function html_time_cell(date: string): string {
    return `<div class="table__cell table__cell--tiny table__cell--right-align">${time_ago(date)}</div>`;
}
export function html_header_time_cell(name: string): string {
    return `<div class="table__cell table__cell--header table__cell--tiny table__cell--right-align">${name}</div>`;
}


export function html_name_cell(name: string, extra_classes: string = ""): string {
    return `<div class="table__name-cell ${extra_classes}"><div>${name}</div></div>`;
}
export function html_header_name_cell(name: string): string {
    return `<div class="table__name-cell table__cell--header">${name}</div>`;
}

export function html_center_right_align_cell(value: string | number, extra_classes: string = "", percent = false): string {
    if (value == null) {
        return html_na_cell("table__cell--center-right-align " + extra_classes);
    }

    const html_percent = percent ? `<span class="table__cell__percent">%</span>` : "";;

    return `<div class="table__cell table__cell--center-right-align">${value}${html_percent}</div>`;
}
export function html_header_center_right_align_cell(name: string, right_padding: number): string {
    return `<div class="table__cell table__cell--center-align table__cell--header" style="padding-right: ${right_padding}px">${name}</div>`;
}
