import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(dayOfYear);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default locale to Vietnamese
dayjs.locale('vi');

export { dayjs };
export default dayjs;

