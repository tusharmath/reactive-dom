/**
 * Created by tushar on 04/05/18
 */

import {Observable} from 'observable-air'
import {Insertable} from '../Insertable'

export const hStatic = (text: Insertable) => new Observable<Insertable>(observer => observer.next(text))
