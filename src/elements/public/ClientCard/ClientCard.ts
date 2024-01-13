import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'client-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element representing a `fx:client` resource.
 *
 * @element foxy-client-card
 * @since 1.24.0
 */
export class ClientCard extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_2168_15479)'%3E%3Crect width='40' height='40' fill='%23E8E8E8'/%3E%3Cpath d='M6.93609 0H0V6.93609L6.93609 0Z' fill='white'/%3E%3Cpath d='M0 8.35031V16.2326L16.2326 0H8.35031L0 8.35031Z' fill='white'/%3E%3Cpath d='M23.4667 20C23.4667 21.9146 21.9146 23.4667 20 23.4667C18.0854 23.4667 16.5333 21.9146 16.5333 20C16.5333 18.0854 18.0854 16.5333 20 16.5333C21.9146 16.5333 23.4667 18.0854 23.4667 20Z' fill='white'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M17.6468 0L0 17.6468V25.529L5.75703 19.772C5.9523 19.5767 6.26888 19.5767 6.46414 19.772C6.6594 19.9673 6.6594 20.2839 6.46414 20.4791L0 26.9433V34.8255L7.67907 27.1464C7.87433 26.9512 8.19091 26.9512 8.38617 27.1464C8.58144 27.3417 8.58144 27.6583 8.38617 27.8536L0 36.2397V40H4.12198L12.4755 31.6464C12.6708 31.4512 12.9874 31.4512 13.1826 31.6464C13.3779 31.8417 13.3779 32.1583 13.1826 32.3536L5.5362 40H13.4185L19.8826 33.5359C20.0779 33.3406 20.3944 33.3406 20.5897 33.5359C20.785 33.7311 20.785 34.0477 20.5897 34.243L14.8327 40H22.7149L40 22.7149V14.8327L34.3536 20.4791C34.1583 20.6744 33.8417 20.6744 33.6464 20.4791C33.4512 20.2839 33.4512 19.9673 33.6464 19.772L40 13.4185V5.5362L32.3536 13.1826C32.1583 13.3779 31.8417 13.3779 31.6464 13.1826C31.4512 12.9874 31.4512 12.6708 31.6464 12.4755L40 4.12198V0H36.2397L27.8536 8.38617C27.6583 8.58144 27.3417 8.58144 27.1464 8.38617C26.9512 8.19091 26.9512 7.87433 27.1464 7.67907L34.8255 0H26.9433L20.5897 6.35355C20.3944 6.54882 20.0779 6.54882 19.8826 6.35355C19.6873 6.15829 19.6873 5.84171 19.8826 5.64645L25.529 0H17.6468ZM12.6461 28.5796L11.4204 27.3539C10.7435 26.677 10.7435 25.5795 11.4204 24.9026L11.7742 24.5489C12.0955 24.2275 12.1662 23.7396 11.992 23.3199C11.8178 22.9003 11.421 22.6 10.9668 22.6H10.4667C9.50938 22.6 8.73334 21.824 8.73334 20.8667V19.1333C8.73334 18.176 9.50938 17.4 10.4667 17.4H10.9668C11.421 17.4 11.8178 17.0997 11.992 16.6801C12.1662 16.2604 12.0955 15.7725 11.7742 15.4511L11.4204 15.0974C10.7435 14.4205 10.7435 13.323 11.4204 12.6461L12.6461 11.4204C13.323 10.7435 14.4205 10.7435 15.0974 11.4204L15.4511 11.7742C15.7725 12.0955 16.2604 12.1662 16.6801 11.992C17.0997 11.8178 17.4 11.421 17.4 10.9668V10.4667C17.4 9.50938 18.176 8.73334 19.1333 8.73334H20.8667C21.824 8.73334 22.6 9.50938 22.6 10.4667V10.9668C22.6 11.421 22.9003 11.8178 23.3199 11.992C23.7396 12.1662 24.2275 12.0955 24.5489 11.7742L24.9026 11.4204C25.5795 10.7435 26.677 10.7435 27.3539 11.4204L28.5796 12.6461C29.2565 13.323 29.2565 14.4205 28.5796 15.0974L28.2259 15.4511C27.9045 15.7725 27.8338 16.2604 28.0081 16.6801C28.1822 17.0997 28.579 17.4 29.0333 17.4H29.5333C30.4906 17.4 31.2667 18.176 31.2667 19.1333V20.8667C31.2667 21.824 30.4906 22.6 29.5333 22.6H29.0332C28.579 22.6 28.1822 22.9003 28.0081 23.3199C27.8338 23.7396 27.9045 24.2275 28.2259 24.5489L28.5796 24.9026C29.2565 25.5795 29.2565 26.677 28.5796 27.3539L27.3539 28.5796C26.677 29.2565 25.5795 29.2565 24.9026 28.5796L24.5489 28.2259C24.2275 27.9045 23.7396 27.8338 23.3199 28.0081C22.9003 28.1822 22.6 28.579 22.6 29.0333V29.5333C22.6 30.4906 21.824 31.2667 20.8667 31.2667H19.1333C18.176 31.2667 17.4 30.4906 17.4 29.5333V29.0333C17.4 28.579 17.0997 28.1822 16.6801 28.0081C16.2604 27.8338 15.7725 27.9045 15.4511 28.2259L15.0974 28.5796C14.4205 29.2565 13.323 29.2565 12.6461 28.5796Z' fill='white'/%3E%3Cpath d='M40 24.1291L24.1291 40H32.0114L40 32.0114V24.1291Z' fill='white'/%3E%3Cpath d='M40 33.4256L33.4256 40H40V33.4256Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_2168_15479'%3E%3Crect width='40' height='40' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A";
  }

  renderBody(): TemplateResult {
    const defaultSrc = ClientCard.defaultImageSrc;
    const data = this.data;

    return html`
      <figure class="flex" style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)">
        <img
          class="relative h-s w-s object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${data?.company_logo || defaultSrc}
          alt=${this.t('image_alt')}
          @error=${(evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc)}
        />

        <figcaption class="min-w-0 flex-1 leading-s -my-xs">
          <p class="text-m truncate text-body font-medium">
            ${data?.project_name.trim() ||
            html`<foxy-i18n infer="" key="no_project_name"></foxy-i18n>`}
          </p>
          <p class="text-s truncate text-secondary">
            ${data?.project_description.trim() ||
            html`<foxy-i18n infer="" key="no_project_description"></foxy-i18n>`}
          </p>
          <p class="text-s truncate text-tertiary">
            ${data ? new URL(data.redirect_uri).host : ''} &bull;
            ${data?.company_name || html`<foxy-i18n infer="" key="no_company_name"></foxy-i18n>`}
          </p>
        </figcaption>
      </figure>
    `;
  }
}
