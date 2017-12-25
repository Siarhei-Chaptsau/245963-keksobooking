'use strict';

// модуль, который работает с картой
(function () {
  var noticeForm = document.querySelector('.notice__form');
  var address = noticeForm.querySelector('#address');
  var formFieldset = document.querySelectorAll('fieldset');
  var map = document.querySelector('.map'); // общая поле = карта + настройки
  var mapPinMain = map.querySelector('.map__pin--main');
  var locationMainInForm = { // координаты главного маркера-пина
    x: 580,
    y: 355
  };
  var pinWidth = 40; // ширина иконки
  var pinHeight = 40; // высота иконки пина

  // функция внесения адрес-координат в форму по умолчанию
  var getAddress = function () {
    address.value = locationMainInForm.x + ', ' + locationMainInForm.y;
  };

  // функция перетаскивания
  var onButtonDrop = function () {
    mapPinMain.addEventListener('mousedown', function (evt) {
      evt.preventDefault();
      var startCoords = {
        x: evt.clientX,
        y: evt.clientY
      };

      var onMainPinDrag = function (moveEvt) {
        moveEvt.preventDefault();

        var shift = {
          x: startCoords.x - moveEvt.clientX,
          y: startCoords.y - moveEvt.clientY
        };

        startCoords = {
          x: moveEvt.clientX,
          y: moveEvt.clientY
        };

        var newX = mapPinMain.offsetLeft - shift.x; // переменная для отображения положения текущего пина по оси абсцисс
        if (newX > window.data.locationXY.maxX) { // ограничения для пина на кaрте по оси абсцисс
          mapPinMain.style.left = window.data.locationXY.maxX + 'px';
          locationMainInForm.x = window.data.locationXY.maxX;
        } else if (newX < window.data.locationXY.minX) {
          mapPinMain.style.left = window.data.locationXY.minX + 'px';
          locationMainInForm.x = window.data.locationXY.minX;
        } else {
          mapPinMain.style.left = newX + 'px'; // отображение текущей координаты х
          locationMainInForm.x = newX - pinWidth / 2; // отображение координат для вывода в форму
        }

        var newY = mapPinMain.offsetTop - shift.y; // переменная для отображения положения текущего пина по оси ординат
        if (newY > window.data.locationXY.maxY) { // ограничения для пина на крте по оси ординат
          mapPinMain.style.top = window.data.locationXY.maxY + 'px';
          locationMainInForm.y = window.data.locationXY.maxY;
        } else if (newY < window.data.locationXY.minY) {
          mapPinMain.style.top = window.data.locationXY.minY + 'px';
          locationMainInForm.y = window.data.locationXY.minY;
        } else {
          mapPinMain.style.top = newY + 'px'; // отображение текущей координаты у
          locationMainInForm.y = newY - pinHeight / 2; // отображение координат для вывода в форму
        }

        getAddress(); // вывод текущих координат главного пина в форму
      };

      var onMouseUp = function (upEvt) {
        upEvt.preventDefault();
        document.removeEventListener('mousemove', onMainPinDrag);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMainPinDrag);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  // функция активации формы
  var activate = function () {
    map.classList.remove('map--faded');
    noticeForm.classList.remove('notice__form--disabled');
  };

  // функция делает недоступными все поля форм по умолчанию
  var disabledMapAndForms = function () {
    map.classList.add('map--faded');
    formFieldset.forEach(function (el) {
      el.setAttribute('disabled', '');
    });
  };
  disabledMapAndForms();

  // активация карты и формы
  var onButtonActivateMap = function () {
    window.pin.init(); // инициализация пинов
    window.pin.addPins(); // выводит пины на карту
    activate(); // активирует карту и форму
    formFieldset.forEach(function (el) {
      el.removeAttribute('disabled');
    });
    getAddress(); // внесение адрес-координат в форму
    mapPinMain.removeEventListener('mouseup', onButtonActivateMap); // удаляет обработчик для предотвращения вызова 1-го попапа при нажатии главного пина
    mapPinMain.addEventListener('mousedown', onButtonDrop); // обработчик перетаскивания
  };

  // обработчик события на блоке при отпускании кнопки мыши активирует поля и карту
  mapPinMain.addEventListener('mouseup', onButtonActivateMap);

  // обработчик события на блоке при нажатии ENTER
  mapPinMain.addEventListener('keydown', function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      onButtonActivateMap();
    }
  });

  // обработчик события закрытия попапа и убирает активный класса при ESC
  document.addEventListener('keydown', window.showCard.onPopupEscPress);

  // перенос в глобальную область видимости
  window.map = {
    getAddress: getAddress
  };
})();
