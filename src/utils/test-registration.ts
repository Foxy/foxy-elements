import { expect } from '@open-wc/testing';

interface TestConfig<TClass> {
  tag: string;
  constructor: TClass;
}

export function testRegistration<TClass>({ tag, constructor }: TestConfig<TClass>) {
  describe('registration', () => {
    it('self-registers on import', () => {
      expect(customElements.get(tag)).to.equal(constructor);
    });
  });
}
