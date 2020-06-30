import { fixture, expect } from '@open-wc/testing';
import { StateValue, EventObject } from 'xstate/dist/xstate.web.js';
import { Stateful, RelContext } from '../mixins/stateful';

interface TestConfig<TEvent extends EventObject, TResource extends object> {
  tag: string;
  sampleResource: TResource;
  initialState: StateValue;
  sampleState: StateValue;
  sampleEvent: TEvent;
}

export function testStatefulMixin<
  TEvent extends EventObject,
  TElement extends Stateful<RelContext, never, TEvent>,
  TResource extends object
>({
  tag,
  sampleResource,
  initialState,
  sampleState,
  sampleEvent,
}: TestConfig<TEvent, TResource>) {
  describe('stateful behavior', () => {
    let node: TElement;

    beforeEach(async () => {
      node = await fixture(`<${tag}></${tag}>`);
    });

    describe('.resource property', () => {
      it('defined', () => {
        expect(node).to.have.property('resource');
      });

      it('initialized with undefined', () => {
        expect(node.resource).to.be.undefined;
      });

      it('has working getter and setter', () => {
        expect(() => (node.resource = sampleResource)).to.not.throw();
        expect(node.resource).to.deep.equal(sampleResource);
      });
    });

    describe('.state property', () => {
      it('defined', () => {
        expect(node).to.have.property('state');
      });

      it('initialized with initialState', () => {
        expect(node.state).to.deep.equal(initialState);
      });

      it('has working getter and setter', () => {
        expect(() => (node.state = sampleState)).to.not.throw();
        expect(node.state).to.deep.equal(sampleState);
      });
    });

    describe('.send() method', () => {
      beforeEach(async () => {
        node = await fixture(`<${tag}></${tag}>`);
      });

      it('defined', () => {
        expect(node).to.have.property('send');
      });

      it('returns new state value when called', () => {
        expect(node.send(sampleEvent)).to.deep.equal(node.state);
      });
    });
  });
}
