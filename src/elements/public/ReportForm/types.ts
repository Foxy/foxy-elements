import * as FoxySDK from '@foxy.io/sdk';

export type Rel = FoxySDK.Backend.Rels.Report;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;
export type TextFieldParams = { field: keyof Data };
export type DateTimePickerParams = { 
    fieldDate: string,
    fieldTime: string,
    handleFunction: Function,
    param: string,
    min?: string
};
