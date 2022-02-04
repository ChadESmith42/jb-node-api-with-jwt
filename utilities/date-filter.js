/**
 * Create a POSTGRESQL query argument to search between two dates.
 * @param {date} startDate
 * @param {date} endDate
 * @returns {string}
 */
const startDateToEndDate = (startDate, endDate) => {
  return `date BETWEEN  ${startDate} AND ${endDate}`;
}

/**
 * Creates a POSTGRESQL query argument to search between past date and current date.
 * @param {date} pastDate
 * @returns {string}
 */
const fromPastDateToNow = pastDate => {
  return `date BETWEEN ${pastDate} AND Now()`;
}

/**
 * Creates a POSTGRESQL query argument to search between now and a future date.
 * @param {date} futureDate
 * @returns {string}
 */
const fromNowToFutureDate = futureDate => {
  return `date BETWEEN Now() AND ${futureDate}`;
}

/**
 * Creates a POSTGRESQL query argument to search for a specific number of days before the current date.
 * @param {int} daysCount
 * @returns {string}
 */
const daysBeforeNow = daysCount => {
  return `date BETWEEN ${daysCount} AND Now()`;
}

/**
 * Creates a POSTGRESQL query argument to search for a specific number of days after the current date.
 * @param {int} daysCount
 * @returns
 */
const daysAfterNow = daysCount => {
  return `date BETWEEN Now() AND ${daysCount}`;
}

module.exports = { startDateToEndDate, fromPastDateToNow, fromNowToFutureDate, daysBeforeNow, daysAfterNow };
