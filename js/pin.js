'use strict';

// модуль для отрисовки пина и взаимодействия с ним, без вставки
(function () {
  var MAX_PINS = 5;
  var DEBOUNCE_INTERVAL = 500;
  // Находим шаблон маркера в template, который будем копировать
  var mapPinTemplate = document.querySelector('template').content.querySelector('.map__pin');
  var mapPinMain = document.querySelector('.map__pin--main');
  var pinWidth = 40; // ширина иконки
  var pinHeight = 40; // высота иконки

  var mapFilters = document.querySelector('.map__filters');
  var filterHousingType = mapFilters.querySelector('#housing-type');
  var filterPrice = mapFilters.querySelector('#housing-price');
  var filterRooms = mapFilters.querySelector('#housing-rooms');
  var filterGuests = mapFilters.querySelector('#housing-guests');
  var filterFeatures = mapFilters.querySelectorAll('#housing-features input[type="checkbox"]');
  var adsCopy = []; // копия данных полученных с сервера перед началом каждой фильтрации

  // функция учитывает ширину картинки, смещается влево на пол-ширину
  var getPinWidth = function (x) {
    return x - pinWidth / 2;
  };

  // функция учитывает высоту маркера и высоту картинки
  var getPinHeight = function (y) {
    return y - pinHeight;
  };

  // Создает DOM-элемент маркера на основе шаблона и данных объявления
  var renderPoint = function (ad, index) {
    var pinElement = mapPinTemplate.cloneNode(true); // клонируем содержимое маркера из template
    ad.id = index; // каждому пину даём id
    pinElement.setAttribute('dataid', index);
    pinElement.querySelector('img').width = pinWidth;
    pinElement.querySelector('img').height = pinHeight;
    pinElement.style.left = getPinWidth(ad.location.x) + 'px';
    pinElement.style.top = getPinHeight(ad.location.y) + 'px';
    pinElement.querySelector('img').src = ad.author.avatar;
    pinElement.tabIndex = 1;
    pinElement.className = 'map__pin'; // задал имя классу
    // обработчик событий замены акивного маркера по клику и появление своего попапа
    pinElement.addEventListener('click', function () {
      window.showCard.renderNextPopap(pinElement, ad);
    });
    // обработчик событий замены акивного маркера по клику и появление своего попапа при нажатии Enter
    pinElement.addEventListener('keydown', function (evt) {
      if (evt.keyCode === window.util.ENTER_KEYCODE) {
        window.showCard.renderNextPopap(pinElement, ad);
      }
    });
    return pinElement;
  };

  // добавляем сгенерированный DOM-элемент маркера в fragment и храним его там. Добавляем на карту только при нажатии кнопки-активации
  var fragment = document.createDocumentFragment();
  // инициализация элементов пинов
  var init = function () {
    var ads = window.data.get(); // возвращает новые пины из модуля data
    for (var i = 0; i < ads.length; i++) {
      var pin = renderPoint(ads[i], i);
      fragment.appendChild(pin); // рендорим в массив-объявлений маркеры, каждому объявлению по маркеру
      if (i >= MAX_PINS) {
        pin.classList.add('hidden');
      }
    }
  };
  // функция добавления пинов на карту, хранящихся в fragment
  var addPins = function () {
    document.querySelector('.map__pins').appendChild(fragment);
  };

  // ----- фильтрация данных с сервера ----- //

  var lastTimeout;
  // функция для устранения 'дребезг'
  var debounce = function (fun) {
    if (lastTimeout) {
      window.clearTimeout(lastTimeout);
    }
    lastTimeout = window.setTimeout(fun, DEBOUNCE_INTERVAL);
  };

  // по типу жилья
  var selectTypeFilter = function (option) {
    if (option.value !== 'any') {
      adsCopy = adsCopy.filter(function (element) {
        return element.offer.type.toString() === option.value;
      });
    }
  };

  // по цене жилья
  var selectPriceFilter = function (arr) {
    adsCopy = adsCopy.filter(function (element) {
      if (arr.value === 'middle') {
        return (element.offer.price < 50000) && (element.offer.price > 10000);
      } else if (arr.value === 'low') {
        return element.offer.price <= 10000;
      } else if (arr.value === 'high') {
        return element.offer.price >= 50000;
      }
      return true;
    });
  };

  // по количеству комнат
  var selectRoomsFilter = function (option) {
    if (option.value !== 'any') {
      adsCopy = adsCopy.filter(function (element) {
        return element.offer.rooms.toString() === option.value;
      });
    }
  };

  // по количеству гостей
  var selectGuestsFilter = function (option) {
    if (option.value !== 'any') {
      adsCopy = adsCopy.filter(function (element) {
        return element.offer.guests.toString() === option.value;
      });
    }
  };

  // по перечню удобств
  var selectFeaturesFilter = function (arr) {
    [].forEach.call(arr, function (checkbox) {
      if (checkbox.checked) {
        adsCopy = adsCopy.filter(function (elem) {
          return elem.offer.features.indexOf(checkbox.value) >= 0;
        });
      }
    });
  };

  // убирает пины из карты кроме pin_main
  var deletePins = function () {
    var elementsPins = document.querySelectorAll('.map__pin');
    elementsPins.forEach(function (el) {
      if (el !== mapPinMain) {
        el.classList.add('hidden');
      }
    });
  };

  // Отображение отфильтрованых 5 пинов
  var showPins = function (pins) {
    var elementsPins = document.querySelectorAll('.map__pin');
    for (var i = 0; i < elementsPins.length; i++) {
      var matchCount = pins.filter(function (element) {
        return parseInt(element.id, 10) === parseInt(elementsPins[i].getAttribute('dataid'), 10);
      }).length;
      if (matchCount !== 0) {
        elementsPins[i].classList.remove('hidden');
      }
    }
  };

  // Функция фильтрации
  var updateMap = function () {
    deletePins();
    window.showCard.hideArticle();
    window.showCard.removeActive();
    selectTypeFilter(filterHousingType);
    selectPriceFilter(filterPrice);
    selectRoomsFilter(filterRooms);
    selectGuestsFilter(filterGuests);
    selectFeaturesFilter(filterFeatures);
    adsCopy = adsCopy.slice(0, MAX_PINS); // устанавливаем необходимую длину для полученного массива
    showPins(adsCopy);
  };

  var useFilters = function (adsLoaded) {
    adsLoaded = adsLoaded.slice(); // создаём копию загруженных данных
    // функция для применения фильтров
    function onSelectChange() {
      adsCopy = adsLoaded.slice(); // данным из сервера перед каждой фильтрации даём загруженные данные
      window.pin.debounce(updateMap); // "дребезг" для функции фильтрации
    }
    mapFilters.addEventListener('change', onSelectChange); // обработчик событий изменённых фильтров
  };

  // перенос в глобальную область видимости
  window.pin = {
    fragment: fragment,
    renderPoint: renderPoint,
    init: init,
    addPins: addPins,
    adsCopy: adsCopy,
    debounce: debounce,
    useFilters: useFilters
  };
})();
