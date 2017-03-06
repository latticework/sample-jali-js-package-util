import { Greeting } from './greeting';

export interface Message {
  data?: Iterable<Greeting>;
  errors?: Iterable<string>;
}
