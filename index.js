import * as Tidepool from './tidepool';
import * as Nightscout from './nightscout';

const nightscoutData = {
  _id: '5da0fac36485149359a86d15',
  sgv: 114,
  date: 1570830985000,
  dateString: '2019-10-11T21:56:25.000Z',
  trend: 4,
  direction: 'Flat',
  device: 'share2',
  type: 'sgv',
};

const sgv = Nightscout.SGV.from(nightscoutData);

try {
  sgv.validate();
  const cbg = new Tidepool.CBG();
  sgv.convert(cbg);
  console.log(JSON.stringify(cbg, null, 2));
  cbg.validate();
  const sgv2 = new Nightscout.SGV();
  cbg.convert(sgv2);
  console.log(JSON.stringify(sgv2, null, 2));
  sgv2.validate();
} catch (e) {
  console.log(e);
}
