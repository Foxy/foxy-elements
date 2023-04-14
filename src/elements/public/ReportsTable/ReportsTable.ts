import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';

/**
 * Configurable table element for 'fx:reports' collection.
 *
 * @element foxy-reports-table
 * @since 1.16.0
 */
export class ReportsTable extends TranslatableMixin(Table, 'reports-table')<Data> {
  static readonly nameColumn: Column<Data> = {
    header: ({ html, lang, ns }) => {
      return html`<foxy-i18n lang=${lang} key="report_name" ns=${ns}></foxy-i18n>`;
    },

    cell: ({ html, data, lang, ns }) => {
      const key = `report_name_${data.name}`;
      return html`<foxy-i18n class="font-medium" lang=${lang} key=${key} ns=${ns}></foxy-i18n>`;
    },
  };

  static readonly startColumn: Column<Data> = {
    hideBelow: 'md',

    header: ({ html, lang, ns }) => {
      return html`<foxy-i18n lang=${lang} key="range_start" ns=${ns}></foxy-i18n>`;
    },

    cell: ({ html, data, lang, ns }) => html`
      <foxy-i18n
        options=${JSON.stringify({ value: data.datetime_start })}
        lang=${lang}
        key="date"
        ns=${ns}
      >
      </foxy-i18n>
    `,
  };

  static readonly endColumn: Column<Data> = {
    hideBelow: 'md',

    header: ({ html, lang, ns }) => {
      return html`<foxy-i18n lang=${lang} key="range_end" ns=${ns}></foxy-i18n>`;
    },

    cell: ({ html, data, lang, ns }) => html`
      <foxy-i18n
        options=${JSON.stringify({ value: data.datetime_end })}
        lang=${lang}
        key="date"
        ns=${ns}
      >
      </foxy-i18n>
    `,
  };

  static readonly createdOnColumn: Column<Data> = {
    header: ({ html, lang, ns }) => {
      return html`<foxy-i18n lang=${lang} key="created_on" ns=${ns}></foxy-i18n>`;
    },

    cell: ({ html, data, lang, ns }) => html`
      <foxy-i18n
        options=${JSON.stringify({ value: data.date_created })}
        lang=${lang}
        key="date"
        ns=${ns}
      >
      </foxy-i18n>
    `,
  };

  static readonly linkColumn: Column<Data> = {
    header: ({ html, lang, ns }) => {
      return html`<foxy-i18n lang=${lang} key="link" ns=${ns}></foxy-i18n>`;
    },

    cell: ({ html, lang, data, ns }) => {
      if (data.status === 'ready') {
        return html`
          <a
            class="rounded font-medium text-primary transition-opacity hover-opacity-75 focus-outline-none focus-ring-2 focus-ring-primary-50"
            href=${data._links['fx:download_url'].href}
            download
          >
            <foxy-i18n lang=${lang} key="download" ns=${ns}></foxy-i18n>
          </a>
        `;
      }

      return html`
        <foxy-spinner
          state=${data.status === 'error' ? 'error' : 'busy'}
          class="inline-block align-middle"
          lang=${lang}
          ns="${ns} link-spinner"
        >
        </foxy-spinner>
      `;
    },
  };

  columns = [
    ReportsTable.nameColumn,
    ReportsTable.startColumn,
    ReportsTable.endColumn,
    ReportsTable.createdOnColumn,
    ReportsTable.linkColumn,
  ];
}
