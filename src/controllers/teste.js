let [year, month, day] = date.split('-');
month == '12' ? (month = '11') : null;
const formattedDate = new Date(year, month, day, 23, 59, 59);

transactionsQuery.andWhere('created_at', '<=', formattedDate);

function validateDate(date) {
  var matches = /(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/.exec(date);
  if (!matches) {
    return false;
  }

  const [year, month, day] = date.split('-');
  month == '12' ? (month = '11') : null;
  const dateObject = new Date(year, month, day);

  if (
    Number(year) != dateObject.getFullYear() ||
    Number(month) != dateObject.getMonth() ||
    Number(day) != dateObject.getDate()
  ) {
    return false;
  }
}
