import numeral from 'numeral';

export function formatDuration (duration) {
  const wholeSecs = Math.ceil(duration);
  const mins = Math.ceil(wholeSecs / 6) / 10;
  return numeral(mins).format('0,0.0');
  // const secs = Math.floor(duration - 60 * mins);
  // return ((mins > 0) ? formatNumber(mins) + 'min ' : '') + numeral(secs).format('00') + 's ';
}

export function formatNumber (number) {
  if (number) {
    return numeral(number).format('0,0');
  } else {
    return 0;
  }
}

export function formatDate (data) {
  let date = new Date(data);
  const year = numeral(date.getFullYear()).format('0000');
  const month = numeral(date.getMonth() + 1).format('00');
  const day = numeral(date.getDate()).format('00');
  const hour = numeral(date.getHours()).format('00');
  const minute = numeral(date.getMinutes()).format('00');
  const second = numeral(date.getSeconds()).format('00');
  return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
}

export function formatCost (cost) {
  if (cost) {
    return numeral(cost).format('0,0.00');
  } else {
    return 0
  }
}

export function formatAverageCost (cost) {
  if (cost) {
    return numeral(cost).format('0,0.00000');
  } else {
    return 0
  }
}
