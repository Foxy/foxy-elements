import type { ExperimentalAddToCartSnippet } from '../../types';
import type { Graph, Resource } from '@foxy.io/sdk/core';

interface ExperimentalAddToCartSnippetCustomOption extends Graph {
  curie: 'fx:experimental_add_to_cart_snippet_custom_option';
  links: { self: ExperimentalAddToCartSnippetCustomOption };
  props: ExperimentalAddToCartSnippet['props']['items'][number]['custom_options'][number];
}

export type Data = Resource<ExperimentalAddToCartSnippetCustomOption>;
