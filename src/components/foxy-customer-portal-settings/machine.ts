import { cloneDeep } from 'lodash-es';
import { Machine, AnyEventObject, actions } from 'xstate';

import {
  FoxyCustomerPortalSettingsContext,
  FoxyCustomerPortalSettingsSchema,
  FoxyCustomerPortalSettingsEvent,
} from './types.js';

import { MachineFactory } from '../../stateful.js';

export const createMachine: MachineFactory<
  FoxyCustomerPortalSettingsContext,
  FoxyCustomerPortalSettingsSchema,
  FoxyCustomerPortalSettingsEvent
> = fetch =>
  Machine<
    FoxyCustomerPortalSettingsContext,
    FoxyCustomerPortalSettingsSchema,
    FoxyCustomerPortalSettingsEvent
  >(
    {
      id: 'foxy-customer-portal-settings',
      initial: 'idle',
      context: {
        resource: undefined,
      },
      states: {
        idle: {
          initial: 'unchanged',

          states: {
            unchanged: {},
            modified: {
              on: {
                save: { target: '#foxy-customer-portal-settings.busy' },
              },
            },
          },

          on: {
            addOrigin: { actions: 'addOrigin', target: '.modified' },
            removeOrigin: { actions: 'removeOrigin', target: '.modified' },
            enableNdMod: { actions: 'enableNdMod', target: '.modified' },
            disableNdMod: { actions: 'disableNdMod', target: '.modified' },
            changeNdMod: { actions: 'changeNdMod', target: '.modified' },
            enableFMod: { actions: 'enableFMod', target: '.modified' },
            disableFMod: { actions: 'disableFMod', target: '.modified' },
            changeFModJsonata: {
              actions: 'changeFModJsonata',
              target: '.modified',
            },
            addFModOption: { actions: 'addFModOption', target: '.modified' },
            removeFModOption: {
              actions: 'removeFModOption',
              target: '.modified',
            },
            changeJwtSecret: {
              actions: 'changeJwtSecret',
              target: '.modified',
            },
            changeSessionLifespan: {
              actions: 'changeSessionLifespan',
              target: '.modified',
            },
          },
        },

        busy: {
          invoke: {
            src: 'save',
            onDone: 'idle.unchanged',
            onError: 'error',
          },
        },

        error: {},
      },
    },
    {
      services: {
        save: ctx =>
          fetch('', {
            method: 'PATCH',
            body: JSON.stringify(ctx.resource),
          }),
      },

      actions: {
        addOrigin: actions.assign({
          resource: ({ resource }, { value }: AnyEventObject) => {
            if (!resource) return;
            const newList = [...resource.allowedOrigins, value];
            return { ...resource, allowedOrigins: newList };
          },
        }),

        removeOrigin: actions.assign({
          resource: ({ resource }, { index }: AnyEventObject) => {
            if (!resource) return;
            const newList = resource.allowedOrigins.filter(
              (_, i) => i !== index
            );
            return { ...resource, allowedOrigins: newList };
          },
        }),

        enableFMod: actions.assign({
          resource: ({ resource }) => {
            if (!resource) return;
            const newResource = cloneDeep(resource);
            newResource.subscriptions.allowFrequencyModification = true;
            return newResource;
          },
        }),

        disableFMod: actions.assign({
          resource: ({ resource }) => {
            if (!resource) return;
            const newResource = cloneDeep(resource);
            newResource.subscriptions.allowFrequencyModification = false;
            return newResource;
          },
        }),

        changeFModJsonata: actions.assign({
          resource: ({ resource }, { value }: AnyEventObject) => {
            if (!resource) return;
            const newResource = cloneDeep(resource);
            const fMod = newResource.subscriptions.allowFrequencyModification;

            newResource.subscriptions.allowFrequencyModification = {
              jsonataQuery: value,
              values: typeof fMod === 'boolean' ? [] : fMod.values,
            };

            return newResource;
          },
        }),

        addFModOption: actions.assign({
          resource: ({ resource }, { value }: AnyEventObject) => {
            if (!resource) return;

            const newResource = cloneDeep(resource);
            const fMod = newResource.subscriptions.allowFrequencyModification;

            if (typeof fMod === 'boolean') return resource;

            newResource.subscriptions.allowFrequencyModification = {
              jsonataQuery: fMod.jsonataQuery,
              values: [...fMod.values, value],
            };

            return newResource;
          },
        }),

        removeFModOption: actions.assign({
          resource: ({ resource }, { index }: AnyEventObject) => {
            if (!resource) return;

            const newResource = cloneDeep(resource);
            const fMod = newResource.subscriptions.allowFrequencyModification;

            if (typeof fMod === 'boolean') return resource;

            newResource.subscriptions.allowFrequencyModification = {
              jsonataQuery: fMod.jsonataQuery,
              values: fMod.values.filter((_, i) => i !== index),
            };

            return newResource;
          },
        }),

        changeJwtSecret: actions.assign({
          resource: ({ resource }, { value }: AnyEventObject) => {
            if (resource) return { ...resource, jwtSharedSecret: value };
          },
        }),

        changeSessionLifespan: actions.assign({
          resource: ({ resource }, { value }: AnyEventObject) => {
            if (resource)
              return { ...resource, sessionLifespanInMinutes: value };
          },
        }),

        enableNdMod: actions.assign({
          resource: ({ resource }) => {
            if (!resource) return;
            const newResource = cloneDeep(resource);
            newResource.subscriptions.allowNextDateModification = true;
            return newResource;
          },
        }),

        disableNdMod: actions.assign({
          resource: ({ resource }) => {
            if (!resource) return;
            const newResource = cloneDeep(resource);
            newResource.subscriptions.allowNextDateModification = false;
            return newResource;
          },
        }),

        changeNdMod: actions.assign({
          resource: ({ resource }, { index, value }: AnyEventObject) => {
            if (!resource) return;

            const newResource = cloneDeep(resource);
            const ndMod = newResource.subscriptions.allowNextDateModification;

            if (ndMod === false) return resource;

            if (ndMod === true) {
              newResource.subscriptions.allowNextDateModification = [value];
            } else {
              if (value === undefined) {
                ndMod.splice(index, 1);
              } else {
                ndMod[index] = value;
              }
            }

            return newResource;
          },
        }),
      },
    }
  );
