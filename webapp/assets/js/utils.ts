export function htmlToElement(html: string): HTMLElement {
  const template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstElementChild as HTMLElement;
}

export function round( n: number, p: number ): number {
  let e = Math.round( p );
  e = e > 1 ? e : 1;
  const m = Math.pow( 10, e );
  return Math.round( n * m ) / m;
}

export function roundString(n: number, p: number): string {
  return round( n, p ).toFixed( p );
}

export function roundPercentageString( n: number, p: number ): string {
  return round( n * 100, p ).toFixed( p ) + "%";
}

export function setAttributeIfDifferent( e: HTMLElement, name: string, value: string ): void {
  if ( e.getAttribute( name ) !== value ) {
    e.setAttribute( name, value );
  }
}

export function setPropertyIfDifferent( e: HTMLElement, name: string, value: string ): void {
  if ( e[ name ] !== value ) {
    e[ name ] = value;
  }
}

