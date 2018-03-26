export const updateStyle = (elm: HTMLElement, style: any) => {
  const nodeStyle: any = elm.style
  for (var i in style) {
    const styleElement = style[i]
    if (style.hasOwnProperty(i) && nodeStyle[i] !== styleElement)
      nodeStyle[i] = styleElement
  }
}
