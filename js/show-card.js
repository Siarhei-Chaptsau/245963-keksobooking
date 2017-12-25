'use strict';

// модуль для показа карточки выбранного жилья по нажатию на метку на карте
(function () {
  var map = document.querySelector('.map'); // общая поле = карта + настройки
  var mapPins = map.querySelector('.map__pins'); // находим элемент-карту в которую отрисовываем сгенерированные DOM-элементы

  // функция снятия класса активного маркера
  var removeActive = function () {
    var pin = document.querySelector('.map__pin--active');
    if (pin !== null) {
      pin.classList.remove('map__pin--active');
    }
  };

  // функция удаления попапа
  var hideArticle = function () {
    var removePopup = document.querySelector('.map__card'); // шаблон объявления-попап
    if (removePopup !== null) {
      mapPins.removeChild(removePopup);
    }
  };

  // закрываем попап Esc и убираем активный класс
  var onPopupEscPress = function (evt) {
    if (evt.keyCode === window.util.ESC_KEYCODE) {
      removeActive();
      hideArticle();
    }
  };

  // закрываем попап Enter и убираем активный класс
  var onEnterClosePopap = function (evt) {
    if (evt.keyCode === window.util.ENTER_KEYCODE) {
      removeActive();
      hideArticle();
    }
  };

  // удаляем дочерние элементы
  var deletePopupFeatures = function (featureElement) {
    while (featureElement.firstChild) {
      featureElement.removeChild(featureElement.firstChild);
    }
    return featureElement;
  };

  var getFeatures = function (item) {
    return '<li class="feature feature--' + item + '"></li>';
  };

  // создаём DOM-элемент объявление-попап, заполняя его данными из сервера
  var renderArticle = function (ad) {
    var articleElement = window.card.get(); // получили шаблон объявления
    articleElement.querySelector('.popup__avatar').src = ad.author.avatar; // Заменяем аватарку пользователя
    articleElement.querySelector('h3').textContent = ad.offer.title;
    articleElement.querySelector('small').textContent = ad.offer.address;
    articleElement.querySelector('.popup__price').textContent = ad.offer.price + '\u20BD/ночь';
    articleElement.querySelector('h4').textContent = ad.offer.type;
    articleElement.querySelector('p:nth-of-type(3)').textContent = ad.offer.rooms + ' комнат для ' + ad.offer.guests + ' гостей';
    articleElement.querySelector('p:nth-of-type(4)').textContent = 'Заезд после ' + ad.offer.checkin + ', выезд до ' + ad.offer.checkout;
    deletePopupFeatures(articleElement.querySelector('.popup__features')); // удаляем дочерние элементы
    articleElement.querySelector('.popup__features').insertAdjacentHTML('afterbegin', ad.offer.features.map(getFeatures).join(' '));
    articleElement.querySelector('ul + p').textContent = ad.offer.description;
    // кириллицу выводит вместо латинницы
    if (ad.offer.type === 'flat') { // Квартира для flat, Бунгало для bungalo, Дом для house
      articleElement.querySelector('h4').textContent = 'Квартира';
    } else if (ad.offer.type === 'bungalo') {
      articleElement.querySelector('h4').textContent = 'Бунгало';
    } else {
      articleElement.querySelector('h4').textContent = 'Дом';
    }
    // обработчик события закрытия попапа и смены класса
    var closePopupItem = articleElement.querySelector('.popup__close');
    closePopupItem.addEventListener('click', function () {
      closePopupItem.autofocus = false;
      removeActive();
      hideArticle();
    });
    // обработчик события закрытия попапа и убирает активный класс при нажатии Enter
    closePopupItem.addEventListener('keydown', onEnterClosePopap);
    closePopupItem.tabIndex = 1;
    mapPins.appendChild(articleElement); // на карту добавить отрисованный попап
  };

  // функция отрисовывает новый попап по активному пину
  var renderNextPopap = function (element, card) {
    removeActive(); // снимает активный класс у кого находит при клике на маркер
    hideArticle(); // скрывает текущий попап
    element.classList.add('map__pin--active'); // отрисовка попапа соответствующего нажатому маркеру
    renderArticle(card);
    document.addEventListener('keydown', onPopupEscPress);
  };

  window.showCard = {
    renderArticle: renderArticle,
    onPopupEscPress: onPopupEscPress,
    renderNextPopap: renderNextPopap,
    hideArticle: hideArticle,
    removeActive: removeActive
  };
})();
