const Ajv = require('ajv');

// eslint-disable-next-line import/prefer-default-export
export class BifrostBase {
  constructor(schema) {
    const ajv = new Ajv();
    this.validator = ajv.compile(schema);
  }

  static from(data) {
    const me = new this();
    me.data = data;
    return me;
  }

  // eslint-disable-next-line class-methods-use-this
  convert() {
    throw new Error('Not implemented');
  }

  validate() {
    const valid = this.validator(this.data);
    if (!valid) {
      throw new Error(JSON.stringify(this.validator.errors, 2, null));
    }
  }

  toJSON() {
    return this.data;
  }
}
