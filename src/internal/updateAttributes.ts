export const updateAttrs = (elm: HTMLElement, attrs: any) => {
  for (var name in attrs) {
    const value = attrs[name]
    if (attrs.hasOwnProperty(name) && elm.getAttribute(name) !== value) {
      elm.setAttribute(name, value)
    }
  }
}
