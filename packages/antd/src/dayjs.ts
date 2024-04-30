/**
 * This file is adapted from the following sources:
 * - https://github.com/react-component/picker/blob/d526bd551778070be3295060f1b5841786cb9500/src/generate/dayjs.ts
 * - https://github.com/react-component/picker/blob/d526bd551778070be3295060f1b5841786cb9500/src/generate/index.ts
 */

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import localeData from 'dayjs/plugin/localeData.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekYear from 'dayjs/plugin/weekYear.js';
import weekday from 'dayjs/plugin/weekday.js';
import { noteOnce } from 'rc-util/lib/warning';

type GenerateConfig<DateType> = {
  // Get
  getWeekDay: (value: DateType) => number;
  getMillisecond: (value: DateType) => number;
  getSecond: (value: DateType) => number;
  getMinute: (value: DateType) => number;
  getHour: (value: DateType) => number;
  getDate: (value: DateType) => number;
  getMonth: (value: DateType) => number;
  getYear: (value: DateType) => number;
  getNow: () => DateType;
  getFixedDate: (fixed: string) => DateType;
  getEndDate: (value: DateType) => DateType;

  // Set
  addYear: (value: DateType, diff: number) => DateType;
  addMonth: (value: DateType, diff: number) => DateType;
  addDate: (value: DateType, diff: number) => DateType;
  setYear: (value: DateType, year: number) => DateType;
  setMonth: (value: DateType, month: number) => DateType;
  setDate: (value: DateType, date: number) => DateType;
  setHour: (value: DateType, hour: number) => DateType;
  setMinute: (value: DateType, minute: number) => DateType;
  setSecond: (value: DateType, second: number) => DateType;
  setMillisecond: (value: DateType, millisecond: number) => DateType;

  // Compare
  isAfter: (date1: DateType, date2: DateType) => boolean;
  isValidate: (date: DateType) => boolean;

  locale: {
    getWeekFirstDay: (locale: string) => number;
    getWeekFirstDate: (locale: string, value: DateType) => DateType;
    getWeek: (locale: string, value: DateType) => number;

    format: (locale: string, date: DateType, format: string) => string;

    /** Should only return validate date instance */
    parse: (locale: string, text: string, formats: string[]) => DateType | null;

    /** A proxy for getting locale with moment or other locale library */
    getShortWeekDays?: (locale: string) => string[];
    /** A proxy for getting locale with moment or other locale library */
    getShortMonths?: (locale: string) => string[];
  };
};

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

dayjs.extend((o, c) => {
  // todo support Wo (ISO week)
  const proto = c.prototype;
  const oldFormat = proto.format;
  proto.format = function f(formatStr: string) {
    const str = (formatStr || '').replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

type IlocaleMapObject = Record<string, string>;
const localeMap: IlocaleMapObject = {
  // ar_EG:
  // az_AZ:
  // bg_BG:
  bn_BD: 'bn-bd',
  by_BY: 'be',
  // ca_ES:
  // cs_CZ:
  // da_DK:
  // de_DE:
  // el_GR:
  en_GB: 'en-gb',
  en_US: 'en',
  // es_ES:
  // et_EE:
  // fa_IR:
  // fi_FI:
  fr_BE: 'fr', // todo: dayjs has no fr_BE locale, use fr at present
  fr_CA: 'fr-ca',
  // fr_FR:
  // ga_IE:
  // gl_ES:
  // he_IL:
  // hi_IN:
  // hr_HR:
  // hu_HU:
  hy_AM: 'hy-am',
  // id_ID:
  // is_IS:
  // it_IT:
  // ja_JP:
  // ka_GE:
  // kk_KZ:
  // km_KH:
  kmr_IQ: 'ku',
  // kn_IN:
  // ko_KR:
  // ku_IQ: // previous ku in antd
  // lt_LT:
  // lv_LV:
  // mk_MK:
  // ml_IN:
  // mn_MN:
  // ms_MY:
  // nb_NO:
  // ne_NP:
  nl_BE: 'nl-be',
  // nl_NL:
  // pl_PL:
  pt_BR: 'pt-br',
  // pt_PT:
  // ro_RO:
  // ru_RU:
  // sk_SK:
  // sl_SI:
  // sr_RS:
  // sv_SE:
  // ta_IN:
  // th_TH:
  // tr_TR:
  // uk_UA:
  // ur_PK:
  // vi_VN:
  zh_CN: 'zh-cn',
  zh_HK: 'zh-hk',
  zh_TW: 'zh-tw',
};

const parseLocale = (locale: string) => {
  const mapLocale = localeMap[locale];
  return mapLocale || locale.split('_')[0];
};

const parseNoMatchNotice = () => {
  /* istanbul ignore next */
  noteOnce(false, 'Not match any format. Please help to fire a issue about this.');
};

const generateConfig: GenerateConfig<Dayjs> = {
  // get
  getNow: () => dayjs(),
  getFixedDate: string => dayjs(string, ['YYYY-M-DD', 'YYYY-MM-DD']),
  getEndDate: date => date.endOf('month'),
  getWeekDay: date => {
    const clone = date.locale('en');
    return clone.weekday() + clone.localeData().firstDayOfWeek();
  },
  getYear: date => date.year(),
  getMonth: date => date.month(),
  getDate: date => date.date(),
  getHour: date => date.hour(),
  getMinute: date => date.minute(),
  getSecond: date => date.second(),
  getMillisecond: date => date.millisecond(),

  // set
  addYear: (date, diff) => date.add(diff, 'year'),
  addMonth: (date, diff) => date.add(diff, 'month'),
  addDate: (date, diff) => date.add(diff, 'day'),
  setYear: (date, year) => date.year(year),
  setMonth: (date, month) => date.month(month),
  setDate: (date, num) => date.date(num),
  setHour: (date, hour) => date.hour(hour),
  setMinute: (date, minute) => date.minute(minute),
  setSecond: (date, second) => date.second(second),
  setMillisecond: (date, milliseconds) => date.millisecond(milliseconds),

  // Compare
  isAfter: (date1, date2) => date1.isAfter(date2),
  isValidate: date => date.isValid(),

  locale: {
    getWeekFirstDay: locale => dayjs().locale(parseLocale(locale)).localeData().firstDayOfWeek(),
    getWeekFirstDate: (locale, date) => date.locale(parseLocale(locale)).weekday(0),
    getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
    getShortWeekDays: locale => dayjs().locale(parseLocale(locale)).localeData().weekdaysMin(),
    getShortMonths: locale => dayjs().locale(parseLocale(locale)).localeData().monthsShort(),
    format: (locale, date, format) => date.locale(parseLocale(locale)).format(format),
    parse: (locale, text, formats) => {
      const localeStr = parseLocale(locale);
      for (let i = 0; i < formats.length; i += 1) {
        const format = formats[i];
        const formatText = text;
        if (format.includes('wo') || format.includes('Wo')) {
          // parse Wo
          const year = formatText.split('-')[0];
          const weekStr = formatText.split('-')[1];
          const firstWeek = dayjs(year, 'YYYY').startOf('year').locale(localeStr);
          for (let j = 0; j <= 52; j += 1) {
            const nextWeek = firstWeek.add(j, 'week');
            if (nextWeek.format('Wo') === weekStr) {
              return nextWeek;
            }
          }
          parseNoMatchNotice();
          return null;
        }
        const date = dayjs(formatText, format, true).locale(localeStr);
        if (date.isValid()) {
          return date;
        }
      }

      if (text) {
        parseNoMatchNotice();
      }
      return null;
    },
  },
};

export default generateConfig;
