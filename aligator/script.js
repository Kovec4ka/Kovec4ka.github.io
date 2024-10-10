// Глобальные переменные
let total = 0; // Общая сумма для автомойки
let selectedServices = []; // Массив выбранных услуг для автомойки
let selectedDate = new Date().toISOString().slice(0, 10); // Текущая дата в формате YYYY-MM-DD

let totalStatistics = 0; // Общая сумма за весь месяц (статистика)
let totalStatistics15 = 0; // Общая сумма за первые 15 дней
let totalStatistics16 = 0; // Общая сумма с 16 дня по конец месяца

// Загружаем данные из localStorage при загрузке страницы
window.onload = () => {
  loadData(); // Загружаем данные для автомойки
  loadStatisticsData(); // Загружаем данные статистики
  updateTotal(); // Обновляем сумму автомойки при загрузке
  updateHistory(); // Обновляем историю для автомойки
  updateStatisticsTotal(); // Обновляем статистику
  setupTabs(); // Настройка вкладок
  updateDateDisplay(); // Обновляем отображение выбранной даты

  // Отображаем input type="date" по умолчанию
  document.getElementById('selected-date').style.display = "block";
};

// Обработка события изменения даты
document.getElementById('selected-date').addEventListener('change', function() {
  selectedDate = this.value; // Обновляем выбранную дату

  // Проверяем, была ли эта дата выбрана ранее
  if (selectedDate !== this.previousDate) {
    loadData(); // Загружаем данные для автомойки, если это новая дата
  }

  // Сохраняем предыдущую выбранную дату
  this.previousDate = selectedDate;

  updateTotal(); // Обновляем сумму автомойки
  updateHistory(); // Обновляем историю для автомойки
  updateDateDisplay(); // Обновляем отображение выбранной даты

  // Скрываем input type="date" после выбора даты
  // this.style.display = "none"; // Комментарий для отображения input type="date" по умолчанию
});

// Обработка события клика по блоку с датой
document.getElementById('selected-date-display').addEventListener('click', function() {
  // Отображаем input type="date"
  document.getElementById('selected-date').style.display = "block";
});


// Добавление цены к общей сумме и в массив выбранных услуг для автомойки
function addPrice(service, price) {
  total += price;
  selectedServices.push(service);
  updateTotal();
  saveSelectedServices();
  updateHistory();

  // Добавляем сообщение об добавлении услуги
  const messageContainer = document.getElementById('message-container');

  for (let i = 0; i < 3; i++) { // Создаем 3 одинаковых сообщения
    const message = document.createElement('div');
    message.classList.add('message');
    message.textContent = `${service} добавлена!`;
    messageContainer.appendChild(message);

    // Устанавливаем начальную прозрачность для каждого сообщения
    message.style.opacity = 0.3 * (3 - i); // 1 - 0.9, 2 - 0.6, 3 - 0.3

    // Анимация плавного всплывания сообщения
    message.style.transform = 'translateY(100%)';
    message.style.opacity = 0;

    //  Добавляем requestAnimationFrame для каждого сообщения
    requestAnimationFrame(() => {
      message.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out'; // Увеличиваем время анимации
      message.style.transform = 'translateY(-50px)'; // Поднимаем сообщение выше
      message.style.opacity = 1;
    });

    // Удаление сообщения через 3 секунды
    setTimeout(() => {
      message.style.opacity = 0;
      setTimeout(() => {
        messageContainer.removeChild(message);
      }, 500); // Дополнительная задержка для плавного исчезновения
    }, 3000);
  }
}

// Обновление отображения общей суммы, скидки, количества услуг для автомойки
function updateTotal() {
  const discount = total * 0.27;
  document.getElementById('total').textContent = `${total}₽`;
  document.getElementById('discount').textContent = `${discount.toFixed(2)}₽`;

  // Обновляем services-count, исключая ненужные услуги
  let servicesCount = 0;
  let addedServicesCount = 0;
  const excludedServices = ['салон I', 'салон II', 'днище', 'чернение', 'силикон', 'полировка пластика', 'двигатель', '50р', '100р', '150р', '200р'];
  for (let i = 0; i < selectedServices.length; i++) {
    if (excludedServices.includes(selectedServices[i])) {
      addedServicesCount++;
    } else {
      servicesCount++;
    }
  }
  document.getElementById('services-info').textContent = `${servicesCount} / ${addedServicesCount}`;

  // Обновляем статистику, если дата изменилась
  const currentMonth = new Date(selectedDate).getMonth() + 1;
  const currentYear = new Date(selectedDate).getFullYear();

  if (currentMonth !== lastMonth || currentYear !== lastYear) {
    calculateStatisticsTotal();
    lastMonth = currentMonth;
    lastYear = currentYear;
  }
}

// Загрузка данных из localStorage для автомойки
function loadData() {
  const savedServices = localStorage.getItem(`selectedServices-${selectedDate}`);
  if (savedServices) {
    selectedServices = JSON.parse(savedServices);
    total = parseInt(localStorage.getItem(`total-${selectedDate}`), 10) || 0; // Загружаем общую сумму
  } else {
    total = 0; // Сбрасываем total если нет сохраненных данных
    selectedServices = []; // Сбрасываем selectedServices если нет сохраненных данных
  }
  updateTotal();
  updateHistory(); // Обновляем историю после обнуления
}

// Обнуление общей суммы и массива выбранных услуг для автомойки
function resetTotal() {
  total = 0;
  selectedServices = [];
  updateTotal();
  saveSelectedServices();
  updateHistory(); // Обновляем историю после обнуления
}

// Очистка истории (удаление всех элементов из selectedServices) для автомойки
function clearHistory() {
  selectedServices = [];
  updateTotal();
  saveSelectedServices();
  updateHistory(); // Обновляем историю после обнуления
}

// Удаление последнего элемента из массива selectedServices для автомойки
function removeLast() {
  if (selectedServices.length > 0) {
    const lastService = selectedServices.pop();
    const price = getPrice(lastService);
    total -= price;
    updateTotal();
    saveSelectedServices();
    updateHistory(); // Обновляем историю после удаления
  }
}

// Получение цены услуги по ее названию для автомойки
function getPrice(service) {
  switch (service) {
    case 'салон 🚗': return 1000;
    case 'салон 🚐': return 1300;
    case 'днище': return 400;
    case 'чернение': return 300;
    case 'силикон': return 250;
    case 'п. пластика': return 500;
    case 'двигатель': return 2500;
    case '50р': return 50;
    case '100р': return 100;
    case '150р': return 150;
    case '200р': return 200;
    case 'эконом 1 🚗': return 800;
    case 'эконом 1 🚗': return 1000;
    case 'эконом 1 🚐': return 1300; // Добавлена цена для "эк 1 🚐"
    case 'эконом 2 🚐': return 1500; // Добавлена цена для "эк 2 🚐"
    case 'нано 1 🚗': return 900;
    case 'нано 2 🚗': return 1400;
    case 'нано 1 🚐': return 1200;
    case 'нано 2 🚐': return 1700;
    case 'экспресс 🚗': return 500;
    case 'экспресс 🚐': return 600;
    case 'экспресс III': return 1000;
    case 'кварц 1 🚗': return 2000;
    case 'кварц 2 🚗': return 2500;
    case 'кварц 1 🚐': return 2200;
    case 'кварц 2 🚐': return 2700;
    default: return 0;
  }
}

// Сохранение массива selectedServices в localStorage для автомойки
function saveSelectedServices() {
  localStorage.setItem(`selectedServices-${selectedDate}`, JSON.stringify(selectedServices));
  localStorage.setItem(`total-${selectedDate}`, total); // Сохраняем общую сумму
}

// Обновление отображения истории выбранных услуг для автомойки
function updateHistory() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = ''; // Очищаем список истории

  const savedServices = localStorage.getItem(`selectedServices-${selectedDate}`);
  if (savedServices) {
    const services = JSON.parse(savedServices);
    services.forEach((service, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${index + 1}. ${service}`; // Добавляем нумерацию

      // Кнопка удаления "-"
      const removeButton = document.createElement('button');
      removeButton.textContent = '-';
      removeButton.addEventListener('click', () => {
        removeServiceFromHistory(index);
      });
      listItem.appendChild(removeButton);

      // Кнопка добавления "+"
      const addButton = document.createElement('button');
      addButton.textContent = '+';
      addButton.addEventListener('click', () => {
        addServiceToHistory(index);
      });
      listItem.appendChild(addButton);

      historyList.appendChild(listItem);
    });
  }
}

// Удаление услуги из истории для автомойки
function removeServiceFromHistory(index) {
  const service = selectedServices[index];
  const price = getPrice(service);
  total -= price;
  selectedServices.splice(index, 1);
  updateTotal();
  saveSelectedServices();
  updateHistory(); // Обновляем историю после удаления
}

// Удаление услуги из истории (без изменения total) для автомойки
function deleteServiceFromHistory(index) {
  selectedServices.splice(index, 1);
  updateTotal();
  saveSelectedServices();
  updateHistory(); // Обновляем историю после удаления
}

// Добавление услуги в историю (перед текущим элементом) для автомойки
function addServiceToHistory(index) {
  const service = selectedServices[index];
  const price = getPrice(service);
  total += price;
  selectedServices.splice(index + 1, 0, service); // Вставляем перед текущим элементом
  updateTotal();
  saveSelectedServices();
  updateHistory(); // Обновляем историю после добавления
}

// Добавлен код для автоматической установки даты в поле "selected-date"
document.addEventListener("DOMContentLoaded", function() {
  const datePicker = document.getElementById('selected-date');
  datePicker.valueAsDate = new Date();
});

// Обновляем отображение выбранной даты
function updateDateDisplay() {
  const dateText = document.getElementById('date-text');
  const selectedDate = document.getElementById('selected-date').value;
  const dateParts = selectedDate.split('-');
  const day = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]);
  const year = parseInt(dateParts[0]);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  dateText.textContent = `${day} ${months[month - 1]}`;
}

//----------////////////////////////////////////////////////////////////////////////////////////----------//
///////////////////////////////// Новые функции для окна выбора "Эконом"///////////////////////////////////
function openEkonomOptions() {
  document.getElementById('ekonom-options').classList.remove('hidden');
}

function closeEkonomOptions() {
  document.getElementById('ekonom-options').classList.add('hidden');
}

///////////////////////////////// Новые функции для окна выбора "Нано"///////////////////////////////////
function openNanoOptions() {
  document.getElementById('nano-options').classList.remove('hidden');
}

function closeNanoOptions() {
  document.getElementById('nano-options').classList.add('hidden');
}

///////////////////////////////// Новые функции для окна выбора "Express"///////////////////////////////////
function openExpressOptions() {
  document.getElementById('express-options').classList.remove('hidden');
}

function closeExpressOptions() {
  document.getElementById('express-options').classList.add('hidden');
}

///////////////////////////////// Новые функции для окна выбора "Quartz"///////////////////////////////////
function openQuartzOptions() {
  document.getElementById('quartz-options').classList.remove('hidden');
}

function closeQuartzOptions() {
  document.getElementById('quartz-options').classList.add('hidden');
}

///////////////////////////////// Новые функции для окна выбора "Optional"///////////////////////////////////
function openOptionalOptions() {
  document.getElementById('optional-options').classList.remove('hidden');
}

function closeOptionalOptions() {
  document.getElementById('optional-options').classList.add('hidden');
}
////////////////////////////////////----------------------------//////////////////////////////////////////




///// Добавляем обработчик события для кнопки "Эконом"/////////////////////////////////////////////////////
document.getElementById('open-ekonom-options').addEventListener('click', openEkonomOptions);

// Добавляем обработчик события для кнопки "Нано"
document.getElementById('open-nano-options').addEventListener('click', openNanoOptions);

// обработчик события кнопки express
document.getElementById('open-express-options').addEventListener('click', openExpressOptions);

// обработчик события кнопки quartz
document.getElementById('open-quartz-options').addEventListener('click', openQuartzOptions);

// обработчик события кнопки optional
document.getElementById('open-optional-options').addEventListener('click', openOptionalOptions);
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Обновление функции updateTotal() для автомойки
function updateTotal() {
  const discount = total * 0.27;
  document.getElementById('total').textContent = `${total}₽`;
  document.getElementById('discount').textContent = `${discount.toFixed(2)}₽`;

  // Обновляем services-count, исключая ненужные услуги
  let servicesCount = 0;
  let addedServicesCount = 0;
  const excludedServices = ['салон I', 'салон II', 'днище', 'чернение', 'силикон', 'полировка пластика', 'двигатель', '50р', '100р', '150р', '200р'];
  for (let i = 0; i < selectedServices.length; i++) {
    if (excludedServices.includes(selectedServices[i])) {
      addedServicesCount++;
    } else {
      servicesCount++;
    }
  }
  document.getElementById('services-info').textContent = `${servicesCount} / ${addedServicesCount}`;

  // Обновляем статистику, если дата изменилась
  const currentMonth = new Date(selectedDate).getMonth() + 1;
  const currentYear = new Date(selectedDate).getFullYear();

  if (currentMonth !== lastMonth || currentYear !== lastYear) {
    calculateStatisticsTotal();
    lastMonth = currentMonth;
    lastYear = currentYear;
  }
}

// Функции для статистики
// Подсчет общей суммы за весь месяц
function calculateStatisticsTotal() {
  const currentYear = new Date(selectedDate).getFullYear();
  const currentMonth = new Date(selectedDate).getMonth() + 1;

  totalStatistics = 0;
  totalStatistics15 = 0;
  totalStatistics16 = 0;

  for (let i = 1; i <= 31; i++) {
    const dateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
    const savedTotal = localStorage.getItem(`total-${dateString}`);

    if (savedTotal) {
      totalStatistics += parseFloat(savedTotal);

      if (i <= 15) {
        totalStatistics15 += parseFloat(savedTotal);
      } else {
        totalStatistics16 += parseFloat(savedTotal);
      }
    }
  }

  updateStatisticsTotal();
  saveStatisticsData();
}

// Обновление отображения общей суммы статистики
function updateStatisticsTotal() {
  document.getElementById('total-statistics').textContent = totalStatistics.toFixed(2) + '';
  document.getElementById('zp-15').textContent = `${totalStatistics15.toFixed(0)}₽ / ${(totalStatistics15 * 0.27).toFixed(0)}`;
  document.getElementById('zp-16').textContent = `${totalStatistics16.toFixed(0)}₽ / ${(totalStatistics16 * 0.27).toFixed(0)}`;
}

// Загрузка статистики из localStorage
function loadStatisticsData() {
  totalStatistics = parseFloat(localStorage.getItem('totalStatistics')) || 0;
  totalStatistics15 = parseFloat(localStorage.getItem('totalStatistics15')) || 0;
  totalStatistics16 = parseFloat(localStorage.getItem('totalStatistics16')) || 0;
}

// Сохранение статистики в localStorage
function saveStatisticsData() {
  localStorage.setItem('totalStatistics', totalStatistics);
  localStorage.setItem('totalStatistics15', totalStatistics15);
  localStorage.setItem('totalStatistics16', totalStatistics16);
}

// Настройка вкладок
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Убираем активность у предыдущих вкладок
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Делаем текущую вкладку активной
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Переменные для отслеживания месяца и года
let lastMonth = null;
let lastYear = null;

// Отображение даты
function updateDateDisplay() {
  const dateText = document.getElementById('date-text');
  const selectedDate = document.getElementById('selected-date').value;
  const dateParts = selectedDate.split('-');
  const day = parseInt(dateParts[2]);
  const month = parseInt(dateParts[1]);
  const year = parseInt(dateParts[0]);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  dateText.textContent = `${day} ${months[month - 1]}`;
}

// Обновление страницы с открытой вкладкой "Статистика"
function updateStatistics() {
  location.reload(); // Обновляем страницу
  // Дополнительный код, чтобы сделать вкладку "Статистика" активной после обновления
  const statisticsTab = document.querySelector('.tab[data-tab="statistics"]');
  statisticsTab.click();
}

// Изменяем обработчик события для кнопки "Обновить"
document.querySelector('.update-button').addEventListener('click', updateStatistics);