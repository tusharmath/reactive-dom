import {IObserver} from 'observable-air'

export class AttributeObserver implements IObserver<any> {
  constructor(private elm: HTMLElement, private sink: IObserver<any>) {}
  complete(): void {}

  error(err: Error): void {
    this.sink.error(err)
  }

  next(attrs: any): void {
    for (var name in attrs) {
      const value = attrs[name]
      if (attrs.hasOwnProperty(name) && this.elm.getAttribute(name) !== value) {
        this.elm.setAttribute(name, value)
      }
    }
  }
}
