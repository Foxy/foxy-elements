enum Placement {
  List,
  Path,
  Modifier,
  Set,
  SetItem,
}

type DBC<T extends string = string> = {
  only?: Partial<Record<T, boolean | DBC<T>>>;
  not?: string[];
};
type Output = { placement: Placement; buffer: string; tree: DBC; branch: DBC };
type Processor = (output: Output, character: string, position: number) => void;

const isWhitespace = (character: string) => /^\s$/.test(character);
const isWordCharacter = (character: string) => /^\w$/.test(character);
const isModifierSeparator = (character: string) => character === ':';
const isModifierValueSeparator = (character: string) => character === '=';
const isPathSeparator = (character: string) => character === '.';
const isListSeparator = (character: string) => character === ';';
const isSetSeparator = (character: string) => character === ',';
const isOneOf = (character: string, ...assertions: ((character: string) => boolean)[]): boolean => {
  return assertions.some(assert => assert(character));
};

const processors: Record<Placement, Processor> = {
  [Placement.List](output: Output, character: string, position: number): void {
    if (isOneOf(character, isWhitespace, isListSeparator)) return;

    if (isWordCharacter(character)) {
      output.buffer += character;
      output.placement = Placement.Path;
      return;
    }

    if (isModifierSeparator(character)) {
      output.placement = Placement.Modifier;
      return;
    }

    throw new SyntaxError(
      `Expected either a word string or a whitespace at index ${position}, but got "${character}" instead.`
    );
  },

  [Placement.Path](output: Output, character: string, position: number): void {
    if (isOneOf(character, isWhitespace, isListSeparator, isPathSeparator, isModifierSeparator)) {
      const selector = output.buffer;
      const branch = (output.branch.only?.[selector] ?? {}) as DBC;

      output.buffer = '';
      output.branch.only = { ...output.branch.only, [selector]: branch };

      if (isOneOf(character, isWhitespace, isListSeparator)) {
        output.branch = output.tree;
        output.placement = Placement.List;
      } else {
        output.branch = branch;
        output.placement = isPathSeparator(character) ? Placement.Path : Placement.Modifier;
      }

      return;
    }

    if (isWordCharacter(character)) {
      output.buffer += character;
      return;
    }

    throw new SyntaxError(
      `Expected a word string, whitespace or a separator (dot or colon) at index ${position}, but got "${character}" instead.`
    );
  },

  [Placement.Modifier](output: Output, character: string, position: number): void {
    if (isWordCharacter(character)) {
      output.buffer += character;
      return;
    }

    if (isModifierValueSeparator(character) && output.buffer === 'not') {
      output.placement = Placement.Set;
      output.buffer = '';
      return;
    }

    throw new SyntaxError(
      `Expected a word string at index ${position}, but got "${character}" instead.`
    );
  },

  [Placement.Set](output: Output, character: string, position: number): void {
    if (isOneOf(character, isWhitespace, isSetSeparator)) return;

    if (isWordCharacter(character)) {
      output.buffer += character;
      output.placement = Placement.SetItem;
      return;
    }

    if (isListSeparator(character)) {
      output.branch = output.tree;
      output.placement = Placement.List;
      return;
    }

    throw new SyntaxError(
      `Expected a word string, a whitespace or a separator (comma) at index ${position}, but got "${character}" instead.`
    );
  },

  [Placement.SetItem](output: Output, character: string, position: number): void {
    if (isOneOf(character, isWhitespace, isListSeparator, isSetSeparator)) {
      if (!output.branch.not) output.branch.not = [];
      if (!output.branch.not.includes(output.buffer)) output.branch.not.push(output.buffer);

      output.buffer = '';
      output.branch = isListSeparator(character) ? output.tree : output.branch;
      output.placement = isListSeparator(character) ? Placement.List : Placement.Set;

      return;
    }

    if (isWordCharacter(character)) {
      output.buffer += character;
      return;
    }

    throw new SyntaxError(
      `Expected a word string, a whitespace or a separator (comma) at index ${position}, but got "${character}" instead.`
    );
  },
};

/**
 * Parses serialized deep boolean configurations (DBCs). DBCs are objects
 * of the following type:
 *
 * ```ts
 * type DBC = { only?: Record<string, DBC>; not?: string[] };
 * ```
 *
 * Elements use DBCs to provide a declarative way to toggle attributes in the
 * shadow DOM. For example, to disable everything but the name fields in an address form
 * of an element's shadow DOM, you can write the following JS:
 *
 * ```js
 * element.disabled = { only: { attribute, address: { not: ["first_name", "last_name"] } } };
 * ```
 *
 * A serialized version would look like this:
 *
 * ```html
 * <my-element disabled="attribute; address:not=first_name, last_name"></my-element>
 * ```
 *
 * The syntax above is what this function works with, transforming it back to JS.
 * Here are all the language features you can use:
 *
 * ## Lists
 *
 * Separate conditions with a semicolon (whitespace characters are ignored):
 *
 * ```js
 * element.disabled = { only: { address: {}, attribute: {} } };
 * ```
 *
 * ```html
 * <my-element disabled="address; attribute"></my-element>
 * ```
 *
 * ## Paths
 *
 * Access elements deep in the shadow DOM by separating path members with a dot:
 *
 * ```js
 * element.disabled = { only: { customer: { only: { address: {} } } } };
 * ```
 *
 * ```html
 * <my-element disabled="customer.address"></my-element>
 * ```
 *
 * ## Modifiers (:not)
 *
 * Add `:not` modifier to exclude elements from the rule:
 *
 * ```js
 * element.disabled = { not: ["address", "attribute"] };
 * ```
 *
 * ```html
 * <my-element disabled=":not=address, attribute"></my-element>
 * ```
 *
 * @param input Serialized DBC.
 * @returns Deserialized DBC.
 */
function parseDBC(input: string): DBC {
  const tree = {};
  const output = { placement: Placement.List, buffer: '', branch: tree, tree };
  const normalizedInput = `${input};`;

  for (let position = 0; position < normalizedInput.length; ++position) {
    processors[output.placement](output, normalizedInput[position], position);
  }

  return tree;
}

export { parseDBC, DBC };
