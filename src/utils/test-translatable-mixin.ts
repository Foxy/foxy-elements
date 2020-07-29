import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Translatable } from '../mixins/translatable';
import { TranslationEvent } from '../events/translation';

interface TestConfig {
  tag: string;
}

export function testTranslatableMixin<TElement extends Translatable>({ tag }: TestConfig) {
  describe('translatable behavior', () => {
    let node: TElement;

    beforeEach(async () => {
      node = await fixture(`<${tag}></${tag}>`);
    });

    describe('.lang property', () => {
      it('defined', () => {
        expect(node).to.have.property('resource');
      });

      it('initialized with an auto-detected language', () => {
        expect(node.lang).to.equal('en-US');
      });

      it('eventually fires TranslationEvent when set', async () => {
        expect(() => (node.lang = 'en')).to.not.throw();
        const event: TranslationEvent = await oneEvent(node, 'translation');
        expect(node.lang).to.equal(event.detail.lang);
      });
    });
  });
}
