import { Meta } from './Meta';
import { Summary } from './Summary';
import { getMetaArgTypes } from './getMetaArgTypes';
import { getMetaTitle } from './getMetaTitle';

export function getMeta(summary: Summary): Meta {
  return {
    title: getMetaTitle(summary.localName.replace('demo-', 'foxy-')),
    argTypes: getMetaArgTypes(summary),
    component: summary.localName,
  };
}
