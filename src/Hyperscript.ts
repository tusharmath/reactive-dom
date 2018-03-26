import {
  HTMLElementObservable,
  NodeProps,
  ReactiveElement
} from './HTMLElementObservable'
import * as O from 'observable-air'
import {IObservable} from 'observable-air'

type ReactiveChildren = Array<IObservable<ReactiveElement> | ReactiveElement>

const toStream = (i: any) =>
  typeof i.subscribe === 'function' ? i : O.of(i.toString())

// prettier-ignore
export function h(selector: string): IObservable<HTMLElement>
// prettier-ignore
export function h(selector: string, children: ReactiveChildren): IObservable<HTMLElement>
// prettier-ignore
export function h(selector: string, children: ReactiveElement): IObservable<HTMLElement>
// prettier-ignore
export function h(selector: string, props: NodeProps): IObservable<HTMLElement>
// prettier-ignore
export function h(selector: string, props: NodeProps, children: ReactiveChildren): IObservable<HTMLElement>
// prettier-ignore
export function h(selector: any, props?: any, children?: any): IObservable<HTMLElement> {
  return arguments.length === 1
    ? new HTMLElementObservable(selector, {}, [O.of('')])
    : arguments.length === 2
      ? Array.isArray(props)
        ? new HTMLElementObservable(selector, {}, props.map(toStream))
        : new HTMLElementObservable(selector, props, [O.of('')])
      : new HTMLElementObservable(selector, props, children.map(toStream))
}
