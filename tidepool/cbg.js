import * as jsonpatch from 'fast-json-patch';
import { BifrostBase } from '../base';
// eslint-disable-next-line import/no-cycle
import { SGV } from '../nightscout/sgv';

// eslint-disable-next-line import/prefer-default-export
export class CBG extends BifrostBase {
  // TODO: ADD REQUIRED
  constructor() {
    super({
      type: 'object',
      allOf: [
        {
          properties: {
            type: {
              type: 'string',
              enum: ['cbg'],
            },
            time: {
              type: 'string',
              format: 'date-time',
            },
            trend: {
              type: 'string',
              enum: ['constant', 'moderateFall', 'moderateRise', 'rapidFall', 'rapidRise', 'slowFall', 'slowRise'],
            },
          },
        },
        {
          oneOf: [
            {
              properties: {
                units: {
                  type: 'string',
                  enum: ['mmol/L'],
                },
                value: {
                  type: 'number',
                  minimum: 0,
                  maximum: 55,
                },
              },
            },
            {
              properties: {
                units: {
                  type: 'string',
                  enum: ['mg/dL'],
                },
                value: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 1000,
                },
              },
            },
          ],
        },
      ],
      required: ['type', 'time', 'units', 'value'],
    });
  }

  convert(data) {
    if (!(data instanceof SGV)) {
      throw new Error(`Cannot convert to type ${data.constructor.name}`);
    }
    // TODO: Do we need to convert 'device'?
    const ops = [
      {
        op: 'replace',
        path: '/type',
        value: 'sgv',
      },
      {
        op: 'move',
        from: '/origin/id',
        path: '/_id',
      },
      {
        op: 'remove',
        path: '/origin',
      },
      {
        op: 'move',
        from: '/time',
        path: '/dateString',
      },
      {
        op: 'add',
        path: '/date',
        value: new Date(this.data.time).getTime(),
      },
      {
        op: 'remove',
        path: '/units',
      },
      {
        op: 'move',
        from: '/value',
        path: '/sgv',
      },
    ];

    // Convert the trends
    if (this.data.trend) {
      let trend = null;
      switch (this.data.trend) {
        // FIXME: Do we need an equivalent for 'NOT COMPUTABLE' and 'RATE OUT OF RANGE'?
        case 'rapidRise':
          trend = 'DoubleUp';
          break;
        case 'moderateRise':
          trend = 'SingleUp';
          break;
        case 'slowRise':
          trend = 'FortyFiveUp';
          break;
        case 'constant':
          trend = 'Flat';
          break;
        case 'slowFall':
          trend = 'FortyFiveDown';
          break;
        case 'moderateFall':
          trend = 'SingleDown';
          break;
        case 'rapidFall':
          trend = 'DoubleDown';
          break;
        default:
          trend = null;
          break;
      }
      ops.push(
        {
          op: 'remove',
          path: '/trend',
        },
        {
          op: 'add',
          path: '/direction',
          value: trend,
        },
      );
    }
    /* eslint no-param-reassign: ["error", { "props": false }] */
    data.data = jsonpatch.applyPatch(this.data, ops, true, true).newDocument;
  }
}
