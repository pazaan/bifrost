import * as jsonpatch from 'fast-json-patch';
import { BifrostBase } from '../base';
// eslint-disable-next-line import/no-cycle
import { CBG } from '../tidepool/cbg';

// eslint-disable-next-line import/prefer-default-export
export class SGV extends BifrostBase {
  constructor() {
    super({
      type: 'object',
      properties: {
        _id: {
          type: 'string',
        },
        sgv: {
          type: 'integer',
          minimum: 0,
          maximum: 1000, // TODO: Validate
        },
        date: {
          type: 'integer',
          // TODO: is there a validator for Hammertime?
        },
        dateString: {
          type: 'string',
          format: 'date-time',
        },
        trend: {
          type: 'integer',
          minimum: 0,
          maximum: 9,
        },
        direction: {
          type: 'string',
          enum: ['DoubleDown', 'SingleDown', 'FortyFiveDown', 'Flat', 'FortyFiveUp', 'SingleUp', 'DoubleUp', 'NOT COMPUTABLE', 'RATE OUT OF RANGE'],
        },
        type: {
          type: 'string',
          enum: ['sgv'],
        },
        device: {
          type: 'string',
        },
      },
      required: ['_id', 'sgv', 'date', 'dateString', 'direction', 'type'],
    });
  }

  convert(data) {
    if (!(data instanceof CBG)) {
      throw new Error(`Cannot convert to type ${data.constructor.name}`);
    }
    // TODO: Do we need to convert 'device'?
    const ops = [
      {
        op: 'replace',
        path: '/type',
        value: 'cbg',
      },
      {
        op: 'remove',
        path: '/device',
      },
      {
        op: 'remove',
        path: '/date',
      },
      {
        op: 'add',
        path: '/origin',
        value: {
          name: 'org.nightscout.tidepool-plugin',
          type: 'service',
        },
      },
      {
        op: 'move',
        from: '/_id',
        path: '/origin/id',
      },
      {
        op: 'move',
        from: '/dateString',
        path: '/time',
      },
      {
        op: 'add',
        path: '/units',
        value: 'mg/dL',
      },
      {
        op: 'move',
        from: '/sgv',
        path: '/value',
      },
    ];

    // Convert the trends
    if (this.data.direction) {
      let trend = null;
      switch (this.data.direction) {
        // FIXME: Do we need an equivalent for 'NOT COMPUTABLE' and 'RATE OUT OF RANGE'?
        case 'DoubleUp':
          trend = 'rapidRise';
          break;
        case 'SingleUp':
          trend = 'moderateRise';
          break;
        case 'FortyFiveUp':
          trend = 'slowRise';
          break;
        case 'Flat':
          trend = 'constant';
          break;
        case 'FortyFiveDown':
          trend = 'slowFall';
          break;
        case 'SingleDown':
          trend = 'moderateFall';
          break;
        case 'DoubleDown':
          trend = 'rapidFall';
          break;
        default:
          trend = null;
          break;
      }
      ops.push(
        {
          op: 'remove',
          path: '/direction',
        },
        {
          op: 'add',
          path: '/trend',
          value: trend,
        },
      );
    }
    /* eslint no-param-reassign: ["error", { "props": false }] */
    data.data = jsonpatch.applyPatch(this.data, ops, true, true).newDocument;
  }
}
