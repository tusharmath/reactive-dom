import {IObserver} from 'observable-air'

export class StyleObserver implements IObserver<any> {
  constructor(private elm: HTMLElement, private sink: IObserver<any>) {}
  complete(): void {}

  error(err: Error): void {
    this.sink.error(err)
  }

  next(style: any): void {
    const nodeStyle: any = this.elm.style
    for (var i in style) {
      const styleElement = style[i]
      if (style.hasOwnProperty(i) && nodeStyle[i] !== styleElement)
        nodeStyle[i] = styleElement
    }
  }
}
