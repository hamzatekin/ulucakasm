export const capitalizeEachWord = (str: string) => {
  const newWord = str
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr') + word.slice(1))
    .join(' ');

  return newWord
    .split('-')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr') + word.slice(1))
    .join('-');
};
