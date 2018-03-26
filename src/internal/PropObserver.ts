import {IObserver} from 'observable-air'

export class PropObserver<T> implements IObserver<T> {
  constructor(
    private elm: HTMLElement,
    private sink: IObserver<any>,
    private onEvent: (elm: HTMLElement, data: T) => void
  ) {}
  complete(): void {}

  error(err: Error): void {
    this.sink.error(err)
  }

  next(attrs: T): void {
    this.onEvent(this.elm, attrs)
  }
}
