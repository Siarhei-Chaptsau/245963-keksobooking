'use strict';

// модуль, который работает с картой
(function () {
  var PIN_WIDTH = 40; // ширина иконки
  var PIN_HEIGHT = 40; // высота иконки пина
  var POINTER_HEIGHT = 22; // высота стрелки
  var locationXY = {
    MIN_X: 300,
    MAX_X: 900,
    MIN_Y: 100,
    MAX_Y: 500
  };
  var noticeForm = document.querySelector('.notice__form');
  var address = noticeForm.querySelector('#address');
  var formFieldset = document.querySelectorAll('fieldset');
  var map = document.querySelector('.map'); // общая поле = карта + настройки
  var mapPinMain = map.querySelector('.map__pin--main');
  var locationMainInForm = { // координаты главного маркера-пина
    x: 525,
    y: 330
  };

  // функция внесения адрес-координат в форму по умолчанию
  var getAddress = function () {
    address.value = locationMainInForm.x + ', ' + locationMainInForm.y;
  };

  // функция перетаскивания
  var onPinMove = function (evt) {
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

      var coordX = mapPinMain.offsetLeft - shift.x; // переменная для отображения положения текущего пина по оси абсцисс
      var coordY = mapPinMain.offsetTop - shift.y;
      var coordForFormX = coordX + PIN_WIDTH / 2;
      var coordForFormY = coordY + PIN_HEIGHT / 2 + POINTER_HEIGHT;

      if (coordX >= (locationXY.MIN_X - PIN_WIDTH / 2) && coordX <= (locationXY.MAX_X - PIN_WIDTH / 2) && coordY >= (locationXY.MIN_Y - PIN_WIDTH / 2 + POINTER_HEIGHT) && coordY <= locationXY.MAX_X - PIN_WIDTH / 2 + POINTER_HEIGHT) {
        mapPinMain.style.left = coordX + 'px';
        mapPinMain.style.top = coordY + 'px';
        locationMainInForm.x = coordForFormX; // отображение координат для вывода в форму
        locationMainInForm.y = coordForFormY;
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
  var onPinActivateMap = function () {
    if (window.data.get() === '') { // проверка на то, чтобы успелись загрузиться данные
      return;
    }
    window.pin.init(); // инициализация пинов
    window.pin.addPins(); // выводит пины на карту
    activate(); // активирует карту и форму
    formFieldset.forEach(function (el) {
      el.removeAttribute('disabled');
    });
    getAddress(); // внесение адрес-координат в форму
    mapPinMain.removeEventListener('mouseup', onPinActivateMap); // удаляет обработчик для предотвращения вызова 1-го попапа при нажатии главного пина
    mapPinMain.removeEventListener('keydown', foo); // удаляет обработчик для предотвращения вызова 1-го попапа при нажатии ENTER главного пина
    mapPinMain.addEventListener('mousedown', onPinMove); // обработчик перетаскивания
  };

  // функция активации при ENTER
  var foo = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      onPinActivateMap();
    }
  };

  // обработчик события на блоке при отпускании кнопки мыши активирует поля и карту
  mapPinMain.addEventListener('mouseup', onPinActivateMap);

  // обработчик события на блоке при нажатии ENTER
  mapPinMain.addEventListener('keydown', foo);

  // обработчик события закрытия попапа и убирает активный класса при ESC
  document.addEventListener('keydown', window.showCard.onPopupEscPress);

  // перенос в глобальную область видимости
  window.map = {
    getAddress: getAddress
  };
})();
