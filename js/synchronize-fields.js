'use strict';

// модуль функции обратного вызова изменения значения зависимого поля
(function () {
  window.synchronizeFields = function (firstElement, secondElement, valuesOfFirstElement, valuesOfSecondElement, callback) {
    var indexOfSecondValue = valuesOfSecondElement.indexOf(secondElement.value); // находим индекс эл-та во втором массиве
    callback(firstElement, valuesOfFirstElement[indexOfSecondValue]); // находим элемент с той же позицией в первом массиве
  };
})();
