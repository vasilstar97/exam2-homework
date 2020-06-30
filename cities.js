/**
 * Для выполнения задания нужно установить Node JS (делается быстро и просто)
 *
 *
 * Дан список городов. Код для их получения в переменную написан. Вам нужно написать программу, которая будет выполняться следующим образом:
 * node ./cities.js "all where %number%>5" - выведет все города из списка с полем number у объектов городов которые соответствуют условию (вместо number могут быть region и city)
 *
 * первое слово указывает максимальное количиство или позицию (Для first и second выводится одна запись) - all - все, first - первый, last - последний, цифра - количество, например
 * node ./cities.js "3 where %number%>5" - выведет в консоль 3 записи
 * node ./cities.js "first where %number%>5" - выведет в консоль первую запись
 *
 * если слова where нет, например:
 * node ./cities.js "all"
 * то вывод работает без фильтрации, в примере выше выведутся в консоль все города.
 * Для удобства разбора (парсинга) строки с запросом рекомендую использовать regex
 * если задан неверный запрос (в примере ниже пропущено слово where но присутствует условие) выводится ошибка: wrong query
 * node ./cities.js "all %number%>5"
 *
 * Операции для запроса могут быть: больше (>), меньше (<), совпадает (=)
 *
 * ОТВЕТ ВЫВОДИТЬ В КОНСОЛЬ И ПИСАТЬ В ФАЙЛ OUTPUT.JSON (каждый раз перезаписывая)
 */

const LIST_OF_CITIES = "./cities.json";
const LIST_OF_OUTPUT = "./output.json";

const fs = require("fs");
const query = process.argv[2];
let cities = {};

readFile(LIST_OF_CITIES)
  .then(data => {
    let params = parse(query);
    return params == null? null : filter(data,params);
  })
  .then(data => writeFile(data, LIST_OF_OUTPUT))

//чтение из файла
function readFile(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, "utf8", (error, data) => {
			error ? reject(error) : resolve(JSON.parse(data));
		});
	});
}
//запись в файл
function writeFile(data, file) {
  return new Promise((resolve, reject) => {
  	fs.writeFile(file, JSON.stringify(data), "utf8", (error) => {
  		if (error) reject(error);
  		resolve(data);
  	});
  });
}
//filtered list
function filter(data, params) {
  let result = data;
  if (params.isFiltered) {
    switch (params.sign) {
      case '>':
        result = result.filter(e => e[params.field]>params.value);
        break;
      case '<':
        result = result.filter(e => e[params.field]<params.value);
        break;
      default:
        result = result.filter(e => e[params.field]==params.value);
        break;
    }
  }

  switch (params.count) {
    case 'first':
      result = result[0];
      break;
    case 'last':
      result = result[result.length-1];
      break;
    case 'all':
      break;
    default:
      let n = params.count;
      result = result.slice(0,n);
      break;
  }

  return result;
}

//null or parameters
function parse(query) {
  let regex = /(all|first|last|[0-9]+)(\s(where)\s%(number|region|city)%(\>|\<|\=)(.+))?/;
  let matches = regex.exec(query);

  if (matches == null || matches[0]!=query) return null;

  let result = {
    count: matches[1],
    isFiltered: matches[2] != undefined
  };
  if (result.isFiltered) {
    result.field = matches[4],
    result.sign = matches[5],
    result.value = matches[6]
  }
  return result;
}
