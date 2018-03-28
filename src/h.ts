import {elm, Optional, ReactiveElement} from './HTMLElementObservable'
import * as O from 'observable-air'
import {IObservable} from 'observable-air'

export type ReactiveChildren = Array<
  IObservable<ReactiveElement> | ReactiveElement
>

export interface NodeData {
  style?:
    | Optional<CSSStyleDeclaration>
    | IObservable<Optional<CSSStyleDeclaration>>
  attrs?: {[key: string]: string} | IObservable<{[key: string]: string}>
  props?: {[key: string]: any} | IObservable<{[key: string]: any}>
  append?: IObservable<HTMLElement>
}
const toStream = (i: any) =>
  typeof i.subscribe === 'function' ? i : O.of(i.toString())

const streamifyObj = (props: any) => {
  const nProps: any = {}
  for (var i in props)
    nProps[i] =
      typeof props[i].subscribe !== 'function' ? O.of(props[i]) : props[i]

  return nProps
}

export function h(selector: string): IObservable<HTMLElement>
export function h(
  selector: string,
  children: ReactiveChildren
): IObservable<HTMLElement>
export function h(
  selector: string,
  children: ReactiveElement
): IObservable<HTMLElement>
export function h(selector: string, props: NodeData): IObservable<HTMLElement>
export function h(
  selector: string,
  props: NodeData,
  children: ReactiveChildren
): IObservable<HTMLElement>
export function h(
  selector: any,
  props?: any,
  children?: any
): IObservable<HTMLElement> {
  return arguments.length === 1
    ? elm(selector, {}, [O.of('')])
    : arguments.length === 2
      ? Array.isArray(props)
        ? elm(selector, {}, props.map(toStream))
        : elm(selector, streamifyObj(props), [O.of('')])
      : elm(selector, streamifyObj(props), children.map(toStream))
}
