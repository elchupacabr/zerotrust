// Кнопка для изменения фонового изображения.
const BUTTON = document.querySelector('button[name="theme"]');

// Исходный массив с изображениями. `Картинка+4` повторяется трижды.
const SOURCES = [
   'https://unsplash.it/1920/1920/?random',
  'https://unsplash.it/1920/1920/?gravity=center',
  'https://unsplash.it/1920/1080/?random',
   
  'https://unsplash.it/1920/1200/?random',
  'https://unsplash.it/2048/1152/?random',
  'https://unsplash.it/2560/2048/?random',
  'https://unsplash.it/2880/1800/?random',
  'https://unsplash.it/3000/2000/?random',
  'https://unsplash.it/3728/2481/?random',
  'https://unsplash.it/3840/2400/?random',
  'https://unsplash.it/4096/2560/?random',
  'https://unsplash.it/4579/3057/?random',
  'https://unsplash.it/1920/1080/?gravity=center',
   
  'https://unsplash.it/1920/1200/?random',
  'https://unsplash.it/2048/1152/?random',
  'https://unsplash.it/2560/2048/?random',
  'https://unsplash.it/2880/1800/?random',
  'https://unsplash.it/3000/2000/?random',
  'https://unsplash.it/3728/2481/?random',
  'https://unsplash.it/4096/2560/?random',
  'https://unsplash.it/4096/2560/?random',
   
  'https://unsplash.it/1920/1200/?gravity=center',
  'https://unsplash.it/2048/1152?gravity=center',
  'https://unsplash.it/2560/2048?gravity=center',
  'https://unsplash.it/2880/1800/?gravity=center',
  'https://unsplash.it/3000/2000/?gravity=center',
  'https://unsplash.it/3728/2481/?random',
  
 'https://randart.ru/art/JD99/wallpapers/?v=1',
        'https://loremflickr.com/1920/1080/landscape',
        'https://randart.ru/art/JD99/wallpapers/',
        'https://loremflickr.com/1920/1080/nature',
        'https://randart.ru/art/JD99/wallpapers/?v=1',
        'https://loremflickr.com/1920/1080/city'
];

// Рабочий массив изображений. Изначально пуст.
let images = [];

// Добавляем функцию обработчик на событие `click`.
BUTTON.addEventListener('click', changeTheme);

// Зададим начальное изображение.
changeTheme();

// Изменить фоновое изображение.
function changeTheme(event) {
  // Если не осталось больше изображений в массиве,
  // подготовим новый рабочий массив.
  if (!images.length) prepareImages();

  // Удаляем первое изображение из массива и
  // берем первое изображение из массива удаленных.
  const [image] = images.splice(0, 1);

  // Меняем фоновое изображение.
  document.body.style.backgroundImage = 'url(' + image + ')';

  // Если не осталось больше изображений в массиве, блокируем кнопку.
  // if (!images.length) BUTTON.disabled = true;
}

// Подготовить рабочий массив изображений.
function prepareImages() {
  // Оставим только уникальный набор изображений.
  images = [...new Set(SOURCES)];

  // Сортируем единожды в случайном порядке.
  images.sort((a, b) => Math.random() - 0.5);
}
