import { LitElement, TemplateResult } from 'lit-element';
import { elementUpdated, expect, fixture, waitUntil } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { DialogHideEvent } from '../elements/private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../elements/internal/InternalConfirmDialog';
import { NucleonElement } from '../elements/public/NucleonElement/NucleonElement';
import sinon from 'sinon';

/**
 * @param element
 * @param attribute
 */
export function getRefs<T>(element: HTMLElement, attribute = 'data-testid'): T {
  return Array.from(element.shadowRoot!.querySelectorAll(`[${attribute}]`))
    .map(child => [child.getAttribute(attribute)!, child] as const)
    .reduce((refs, [id, child]) => ({ ...refs, [id]: child }), {} as T);
}

/**
 * @param callback
 */
export function exec<TRefs = unknown, TElement extends LitElement = LitElement>(
  callback: (refs: TRefs & { element: TElement }) => any
): (element: TElement) => Promise<void> {
  return async (element: TElement) => {
    await element.updateComplete;
    await callback({ ...getRefs<TRefs>(element), element });
  };
}

/**
 * @param element
 * @param value
 */
export function setChecked(
  element: Pick<HTMLInputElement, 'checked' | 'dispatchEvent'>,
  value: boolean
): void {
  element.checked = value;
  element?.dispatchEvent(new CustomEvent('change'));
}

/**
 * @param times
 * @param test
 */
export async function retry(times: number, test: () => Promise<void>): Promise<void> {
  let error: Error | null = null;
  let elapsed = 0;

  do {
    try {
      await new Promise(r => setTimeout(r));
      await test();
      error = null;
    } catch (err) {
      error = err;
    } finally {
      elapsed++;
    }
  } while (elapsed < times);

  if (error) throw error;
}

/**
 * @param tpl
 * @param validHref
 */
async function provideFeedbackOnLoading(tpl: TemplateResult, validHref: string): Promise<void> {
  describe('Provide feedback on loading status', async () => {
    let el: NucleonElement<any>;

    beforeEach(async () => {
      el = await fixture(tpl);
    });

    it('Should display the loader.', function () {
      el.href = 'https://demo.foxycart.com/s/admin/sleep';
      expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).not.to.have.class(
        'opacity-0'
      );
    });

    it('Should display a feedback when the result is not found', async function () {
      el.href = 'https://demo.foxycart.com/s/admin/not-found';
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).not.to.have.class(
        'opacity-0'
      );
    });

    it('Should briefly display the loading when the href is valid', async function () {
      el.href = validHref;
      await elementUpdated(el);
      expect(
        el.shadowRoot?.querySelector(`[data-testid="spinner"]`)
      ).to.exist.and.not.to.have.class('opacity-0');
      await waitUntil(() => el.in('idle'), 'Element should become idle');
      expect(el.shadowRoot?.querySelector(`[data-testid="spinner"]`)).to.satisfy(
        (e: HTMLElement | null) => e === null || e!.classList.contains('opacity-0')
      );
    });
  });
}

/**
 * @param tpl
 */
async function confirmBeforeAction(tpl: TemplateResult): Promise<void> {
  describe('Execute action upon confirmation', async () => {
    let el: NucleonElement<any>;
    let mockEl: sinon.SinonMock;

    beforeEach(async () => {
      el = await fixture(tpl);
      await waitUntil(() => el.in('idle'), 'Element become idle');
      mockEl = sinon.mock(el);
    });

    it('should not delete before confirmation', async () => {
      mockEl.expects('delete').never();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      expect(button).to.exist;
      button!.click();
      mockEl.verify();
    });

    it('should not delete after cancelation', async () => {
      mockEl.expects('delete').never();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      expect(button).to.exist;
      button!.click();
      const confirmDialog = el.shadowRoot!.querySelector(
        '[data-testid="confirm"]'
      ) as InternalConfirmDialog;
      await elementUpdated(el);
      confirmDialog.dispatchEvent(new DialogHideEvent(true));
      await elementUpdated(el);
      mockEl.verify();
    });

    it('should delete after confirmation', async () => {
      mockEl.expects('delete').once();
      const button = el.shadowRoot!.querySelector('[data-testid="action"]') as ButtonElement;
      expect(button).to.exist;
      button!.click();
      const confirmDialog = el.shadowRoot!.querySelector(
        '[data-testid="confirm"]'
      ) as InternalConfirmDialog;
      await elementUpdated(el);
      confirmDialog.dispatchEvent(new DialogHideEvent());
      await elementUpdated(el);
      mockEl.verify();
    });
  });
}

export const DefaultTests = {
  confirmBeforeAction,
  provideFeedbackOnLoading,
};
