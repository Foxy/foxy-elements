import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { ReportForm } from './ReportForm';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.Report>;

export type Templates = {
  'name:before'?: Renderer<ReportForm>;
  'name:after'?: Renderer<ReportForm>;
  'start:before'?: Renderer<ReportForm>;
  'start:after'?: Renderer<ReportForm>;
  'end:before'?: Renderer<ReportForm>;
  'end:after'?: Renderer<ReportForm>;
  'timestamps:before'?: Renderer<ReportForm>;
  'timestamps:after'?: Renderer<ReportForm>;
  'delete:before'?: Renderer<ReportForm>;
  'delete:after'?: Renderer<ReportForm>;
  'create:before'?: Renderer<ReportForm>;
  'create:after'?: Renderer<ReportForm>;
};
