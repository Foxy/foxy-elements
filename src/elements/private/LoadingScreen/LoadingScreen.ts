import { CSSResultArray, LitElement, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';

/** @deprecated – use internal controls instead */
export class LoadingScreen extends LitElement {
  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        :host {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        .top-center {
          top: calc(50% - (var(--lumo-size-xl) / 2));
        }

        @keyframes dash0 {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(5.681301px, 3.368302px);
          }
        }

        @keyframes dash1 {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(5.677051px, 3.457428px);
          }
        }

        @keyframes dash2 {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(5.686002px, 3.127455px);
          }
        }

        @keyframes dash3 {
          from {
            transform: translate(-5.6842px, -3.404556px);
          }
          to {
            transform: translate(0, 0);
          }
        }
      `,
    ];
  }

  public render(): TemplateResult {
    return html`
      <div class="h-full bg-base text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="fill-current w-xl h-xl mx-auto sticky top-center"
          shape-rendering="geometricPrecision"
          text-rendering="geometricPrecision"
          viewBox="0 0 64 64"
        >
          <path
            id="ew5fy7afo2w2"
            fill-rule="evenodd"
            stroke="none"
            stroke-width="1"
            d="M41.93 49.46c0 .18-.2.3-.36.2l-1.78-1.07-22.73-13.76a1.5 1.5 0 01-.7-1.3V11.08c0-.18.2-.3.36-.2l1.75 1.04c.44.25.74.75.74 1.32v19.27c0 .08.05.16.12.2L41.22 46c.47.28.73.8.72 1.32v2.15z"
            clip-rule="evenodd"
          />

          <path
            id="ew5fy7afo2w3"
            fill-rule="evenodd"
            stroke="none"
            stroke-width="1"
            d="M47.64 52.9c0 .2-.2.3-.36.21l-1.8-1.08c-.42-.26-.7-.74-.7-1.3v-19.3a.24.24 0 00-.12-.2L25.27 19.47a.24.24 0 00-.37.21v12.55c0 .19-.21.3-.37.2l-1.76-1.06a1.46 1.46 0 01-.71-1.28V16.7c0-.54.27-1.03.71-1.3.45-.27 1-.26 1.44 0l22.72 13.77c.44.26.7.76.7 1.3v20.27l.01 2.17z"
            clip-rule="evenodd"
          />

          <g style="animation:dash0 300ms linear infinite normal forwards">
            <path
              id="ew5fy7afo2w4"
              fill-rule="evenodd"
              stroke="none"
              stroke-width="1"
              d="M30.59 35.68c0 .2-.21.3-.37.21l-1.8-1.1c-.41-.27-.68-.74-.68-1.28V27v-2.15c0-.2.2-.3.37-.21l1.78 1.06c.42.26.7.74.7 1.3v8.68z"
              clip-rule="evenodd"
            />
          </g>

          <g style="animation:dash1 300ms linear infinite normal forwards">
            <path
              id="ew5fy7afo2w5"
              fill-rule="evenodd"
              stroke="none"
              stroke-width="1"
              d="M36.28 39.13c0 .2-.2.3-.37.21l-1.79-1.1c-.41-.25-.69-.73-.69-1.28v-6.51-2.16c0-.2.2-.31.37-.21l1.76 1.06c.44.26.73.75.73 1.3v8.69z"
              clip-rule="evenodd"
            />
          </g>

          <g style="animation:dash2 300ms linear infinite normal forwards">
            <path
              id="ew5fy7afo2w6"
              fill-rule="evenodd"
              stroke="none"
              stroke-width="1"
              d="M41.96 42.57c0 .2-.2.3-.37.21L39.8 41.7a1.52 1.52 0 01-.71-1.3v-6.51-2.17c0-.2.2-.31.37-.21l1.74 1.06c.45.25.75.75.75 1.32v8.68z"
              clip-rule="evenodd"
            />
          </g>

          <g
            transform="translate(-5.68 -3.4)"
            style="animation:dash3 300ms linear infinite normal forwards"
          >
            <path
              id="ew5fy7afo2w7"
              fill-rule="evenodd"
              stroke="none"
              stroke-width="1"
              d="M30.59 35.68c0 .2-.21.3-.37.21l-1.8-1.1c-.41-.27-.68-.74-.68-1.28V27v-2.15c0-.2.2-.3.37-.21l1.78 1.06c.42.26.7.74.7 1.3v8.68z"
              clip-rule="evenodd"
            />
          </g>
        </svg>
      </div>
    `;
  }
}
