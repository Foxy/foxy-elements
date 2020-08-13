import { expect } from '@open-wc/testing';

describe('The form should allow new products to be added', async () => {
  it('Should recognize new products added as JS array', async () => {
    expect(true).to.equal(false);
  });

  it('Should recognize new products added as product item tags', async () => {
    expect(true).to.equal(false);
  });

  it('Should recognize changes to JS array', async () => {
    expect(true).to.equal(false);
  });

  it('Should recognize new producs late added as product item tags', async () => {
    expect(true).to.equal(false);
  });

  it('Should recognize child products removed from the DOM', async () => {
    expect(true).to.equal(false);
  });
});

describe('The form should remain valid', async () => {
  it('Should not send a new order with empty products', async () => {
    expect(true).to.equal(false);
  });

  // TODO: check if the form should be used to edit orders (it seems that it is so)
  it('Should not send an unmodified order if already sent', async () => {
    expect(true).to.equal(false);
  });

  it('Should not allow negative quantities', async () => {
    expect(true).to.equal(false);
  });

  it('Should not allow negative prices', async () => {
    expect(true).to.equal(false);
  });
});
