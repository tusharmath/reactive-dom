export const toNode = (el: any) =>
  el instanceof Node ? el : document.createTextNode(el.toString())
