import { Args } from './Args';
import { Summary } from './Summary';

export function getStoryArgs(summary: Summary): Args {
  const { sections = [], buttons = [], inputs = [] } = summary.configurable ?? {};
  const allControls = [...sections, ...buttons, ...inputs];
  const args = {} as Args;

  if (summary.configurable) {
    args.disabledControls = [];
    args.readonlyControls = [];
    args.hiddenControls = [];

    args.disabled = false;
    args.readonly = false;
    args.hidden = false;

    allControls.forEach(control => {
      if (control.endsWith('default')) {
        args[control] = '';
      } else {
        args[`${control}:before`] = '';
        args[`${control}:after`] = '';
      }
    });
  }

  if (summary.translatable) {
    args.lang = 'en';
  }

  if (summary.parent) args.parent = summary.parent;
  if (summary.href) args.href = summary.href;
  if (summary.base) args.base = summary.base;

  return args;
}
