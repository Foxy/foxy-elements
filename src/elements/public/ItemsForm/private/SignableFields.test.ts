import { aTimeout, elementUpdated, expect, fixture, html, oneEvent } from '@open-wc/testing';
import { SignableFields } from './SignableFields';

customElements.define('x-signable', SignableFields);

/**
 * @param signed
 * @param open
 */
function createSignable(signed: boolean, open: boolean) {
  const signedField = signed ? 'foo' : 'bar';
  const openField = open ? 'foo' : 'bar';
  return fixture(html`
    <x-signable
      signatures='{"${signedField}": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'
      open='{"${openField}": true}'
    >
    </x-signable>
  `);
}

describe('Creates signed versions of the fields names', async function () {
  it('Should create a signed version of a field', async function () {
    const signable = (await createSignable(true, false)) as SignableFields;
    expect(signable.signedName('foo')).to.match(/.*\|\|a{64}$/);
  });

  it('Should append open to open fields', async function () {
    const signable = (await createSignable(true, true)) as SignableFields;
    expect(signable.signedName('foo')).to.match(/.*\|\|open/);
  });

  it('Should not change field names that are not signed', async function () {
    const signable = (await createSignable(false, true)) as SignableFields;
    expect(signable.signedName('foo')).not.to.match(/.*\|\|open/);
    expect(signable.signedName('foo')).not.to.match(/.*\|\|a{64}$/);
  });

  it('Should not add open to closed fields', async function () {
    const signable = (await createSignable(true, false)) as SignableFields;
    expect(signable.signedName('foo')).not.to.match(/.*\|\|open/);
  });
});
