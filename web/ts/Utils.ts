export type SortDirection = "asc" | "desc";

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

export function create_form_data(obj: {[key: string]: string}): FormData {
    const form_data = new FormData();
    for (let p in obj) {
        form_data.append(p, obj[p]);
    }
    return form_data;
}

// From Tom Gruner @ http://stackoverflow.com/a/12034334/1660815
const entityMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

export function escape_html(str: string) {
    return String(str).replace(/[&<>"'`=\/]/g, function (s: string) {
        return entityMap[s];
    });
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
    return `<div class="table__cell table__cell--na ${extra_classes}">&#8212;</div>`
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
export function html_header_bar_cell(name: string, extra_classes = ""): string {
    return `<div class="table__cell table__cell--header table__cell--small ${extra_classes}">${name}</div>`;
}

export function html_time_cell(date: string, extra_classes = ""): string {
    return `<div class="table__cell table__cell--tiny table__cell--right-align ${extra_classes}">${time_ago(date)}</div>`;
}
export function html_header_time_cell(name: string, extra_classes = ""): string {
    return `<div class="table__cell table__cell--header table__cell--tiny table__cell--right-align ${extra_classes}">${name}</div>`;
}

export function html_name_cell(name: string, extra_classes = ""): string {
    return `<div class="table__name-cell ${extra_classes}"><div>${escape_html(name)}</div></div>`;
}
export function html_header_name_cell(name: string, extra_classes = ""): string {
    return `<div class="table__name-cell table__cell--header ${extra_classes}">${name}</div>`;
}

export function html_center_right_align_cell(value: string | number, extra_classes = "", percent = false): string {
    if (value == null) {
        return html_na_cell("table__cell--center-right-align " + extra_classes);
    }

    const html_percent = percent ? `<span class="table__cell__percent">%</span>` : "";;

    return `<div class="table__cell table__cell--center-right-align">${value}${html_percent}</div>`;
}
export function html_header_center_right_align_cell(name: string, right_padding: number, extra_classes = ""): string {
    return `<div class="table__cell table__cell--center-align table__cell--header ${extra_classes}" style="padding-right: ${right_padding}px">${name}</div>`;
}

// Proportion with a and b clamped to 0, useful for frags for example
export function html_cmp_cell_clamped_frac(a: number, b: number, is_percent = false, extra_classes = ""): string {
    if (a == null || b == null) {
        return html_na_cell("table__cell--center-align");
    }

    //const [a_frags, b_frags] = [Math.max(g.a_frags, 0), Math.max(g.b_frags, 0)];
    [a, b] = [Math.max(a, 0), Math.max(b, 0)];

    // bar is in the range [-1; 1]
    let bar = 0;
    if (a + b !== 0) {
        bar = 2.0 * (b / (a + b) - 0.5);
    }

    return _html_cmp_cell(a.toString(), b.toString(), bar, 40, is_percent, extra_classes);
}

export function html_header_cmp_cell(name: string, extra_classes = ""): string {
    return `<div class="table__cmp-cell table__cell--header ${extra_classes}">${name}</div>`;
}

// a and b are percentages that add up to 100
export function html_cmp_cell_100percent(a: number, b: number, extra_classes = ""): string {
    if (a == null || b == null) {
        return html_na_cell("table__cell--center-align");
    }

    const bar = 2.0 * (b / 100) - 1.0;
    return _html_cmp_cell(a.toString(), b.toString(), bar, 40, true, extra_classes);
}

export function html_cmp_cell_clamped_ratio(a: number, b: number): string {
    if (a == null || b == null) {
        return html_na_cell("table__cell--center-align");
    }

    [a, b] = [Math.max(a, 0), Math.max(b, 0)];

    let bar = 0;
    if (a > b) {
        bar = Math.max(1.0 - a / b, -1.0);
    } else if (b > a) {
        bar = Math.min(b / a - 1.0, 1.0);
    }
    return _html_cmp_cell(a.toString(), b.toString(), bar);
}

// Bar should be [-1; 1]
function _html_cmp_cell(a: string, b: string, bar: number, mul: number = 40, is_percent: boolean = false, extra_classes: string = ""): string {
    //const mul = 32;
    const bar_width = Math.abs(bar) * mul;
    let bar_style = `width: ${bar_width}px; left: 50%; margin-left: -${bar_width + 1}px`;
    if (bar >= 0) {
        bar_style = `width: ${bar_width}px; left: 50%; margin-left: -1px;`;
    }
    let percent_span = "";
    if (is_percent) {
        percent_span = `<span class="table__cell__percent">%</span>`;
    }
    return `
<div class="table__cmp-cell ${extra_classes}">
  <div class="table__cmp-cell__a">${a}${percent_span}</div>
  <div class="table__cmp-cell__separator"></div>
  <div class="table__cmp-cell__b">${b}${percent_span}</div>
  <div class="table__cmp-cell__bar ${bar <= 0 ? "table__cmp-cell__bar--better" : "table__cmp-cell__bar--worse"}" style="${bar_style}"></div>
</div>
`;
}

export function html_separator_cell(): string {
    return `<div class="table__cell table__cell--separator"></div>`;
}

export function html_insufficient_data(): string {
    return `<div class="insufficient-data">No data for the selected period</div>`;
}
