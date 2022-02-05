export function timestampToCronExpressionAdapter(
  type: string,
  timeSpan: string
) {
  const tratedType = type.toLowerCase();
  const getCrowExpression: { [key: string]: any } = {
    month: () => {
      const dayOfMonth = new Date().getDate();
      return `00 00 ${dayOfMonth} */${timeSpan} *`;
    },
    week: () => {
      const dayOfWeek = new Date().getDay();
      return `00 00 */${timeSpan}  * ${dayOfWeek}`;
    },
    day: () => `00 00 */${timeSpan} * *`,
    minute: () => `*/${timeSpan} * * * *`,
  };

  return getCrowExpression[tratedType]();
}
