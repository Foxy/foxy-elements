export enum UpdateResult {
  ResourceCreated,
  ResourceDeleted,
}

export type UpdateEventDetail = {
  result?: UpdateResult;
};

export class UpdateEvent extends CustomEvent<UpdateEventDetail> {
  static readonly UpdateResult = UpdateResult;

  constructor(type = 'update', eventInitDict?: CustomEventInit<UpdateEventDetail>) {
    super(type, eventInitDict);
  }
}
