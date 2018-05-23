'use strict';

// модуль функций для работаты с сервером данных
(function () {
  var SERVER_URL = 'dump/server.json';
  var divMessage = document.createElement('div');

  // Функция загрузки данных при успешном результате
  var successHandler = function (adsData) { // в параметре данные из сервера
    window.data.set(adsData);
    window.pin.useFilters(adsData);
  };

  // Функция вывода ошибки при отправке
  var errorHandler = function (errorMessage) {
    divMessage.style = 'z-index: 10; width: 300px; height: 20px; margin: 0 auto; padding: 15px; text-align: center; border-radius: 5%; background-color: yellow;';
    divMessage.style.position = 'absolute';
    divMessage.style.border = '2px solid red';
    divMessage.style.top = '10%';
    divMessage.style.left = 0;
    divMessage.style.right = 0;
    divMessage.style.fontSize = '20px';
    divMessage.textContent = errorMessage;
    document.body.insertAdjacentElement('afterbegin', divMessage);
  };

  // закрытие сообщения об ошибке ESC
  document.addEventListener('keydown', function (evt) {
    if (evt.keyCode === window.util.ESC_KEYCODE) {
      divMessage.classList.add('hidden');
    }
  });

  // закрытие сообщения об ошибке при клике
  divMessage.addEventListener('click', function (evt) {
    evt.target.classList.add('hidden');
  });

  var setup = function (onLoad, onError) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.addEventListener('load', function () { // обработчик для успешного запроса
      if (xhr.status === 200) {
        onLoad(xhr.response); // функция обратного вызова, которая срабатывает при успешном выполнении запроса, response - Ответ сервера
      } else {
        onError(xhr.response); // функция обратного вызова, которая срабатывает при неуспешном выполнении запроса
      }
    });
    xhr.addEventListener('error', function () { // обработчик для ошибки при запросе
      onError('Произошла ошибка соединения');
    });
    xhr.addEventListener('timeout', function () { // обработчик для истечения заданного времени
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    xhr.timeout = 10000; // 10s
    return xhr;
  };

  // функции для глобальной области видимости
  window.backend = {
    save: function (data, onLoad, onError) { // метод для отправки данных форм на сервер
      var xhr = setup(onLoad, onError);
      xhr.open('POST', SERVER_URL);
      xhr.send(data); // объект FormData, содержит данные формы
    },

    load: function (onLoad, onError) { // метод для загрузки данных
      var xhr = setup(onLoad, onError);
      xhr.open('GET', SERVER_URL);
      xhr.send();
    },

    successHandler: successHandler,
    errorHandler: errorHandler
  };
})();
