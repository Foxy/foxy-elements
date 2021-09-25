import { endpoint } from '..';
import halson from 'halson';

export function composeTemplateCache() {
  return halson({
    message: 'Your template cache request has completed.',
  }).addLink('self', `${endpoint}`);
}
