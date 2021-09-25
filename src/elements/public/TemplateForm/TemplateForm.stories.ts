import './index';

import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStory } from '../../../storygen/getStory';

/**
 * Creates the summary dinamicatly based on the teplate type.
 *
 * @param templateType the string corresponding to the template resource.
 * @returns the summary to use to create the story.
 */
function createConfig(templateType: string): Summary {
  const summary: Summary = {
    configurable: {},
    href: 'https://demo.foxycart.com/s/admin/template/_____/0',
    localName: 'foxy-template-form',
    nucleon: true,
    translatable: true,
  };
  const newHref = summary.href!.replace('_____', templateType);
  return { ...summary, href: newHref };
}

export default getMeta(createConfig('cart_templates'));

export const Playground = getStory({ ...createConfig('cart_templates'), code: true });
export const CheckoutTemplate = getStory(createConfig('checkout_templates'));
export const EmailTemplate = getStory(createConfig('email_templates'));
export const Empty = getStory(createConfig('cart_templates'));
export const Error = getStory(createConfig('cart_templates'));
export const Busy = getStory(createConfig('cart_templates'));

Empty.args.href = '';
Error.args.href = 'https://demo.foxycart.com/s/admin/not-found';
Busy.args.href = 'https://demo.foxycart.com/s/admin/sleep';
