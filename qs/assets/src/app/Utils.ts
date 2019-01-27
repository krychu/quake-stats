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
