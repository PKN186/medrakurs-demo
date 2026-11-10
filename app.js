'use strict';

// Only published service categories are used. No diagnoses, prices or availability
// are inferred. Reception confirms the actual appointment by telephone.
const directions = [
  { id:'rehab', number:'01', name:'Реабилитация', audience:['adult','child'], description:'Восстановление движения и повседневной активности. План процедур обсуждается на консультации со специалистом.', summary:'Движение и восстановление', services:['Индивидуальная физическая культура','Механотерапия','Физиотерапия','Массаж'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'ortho', number:'02', name:'Ортопедия', audience:['adult','child'], description:'Консультация травматолога-ортопеда по вопросам суставов, позвоночника и стоп.', summary:'Суставы, позвоночник, стопы', services:['Приём травматолога-ортопеда','Лечение сколиоза','Индивидуальные ортопедические стельки','Ортезирование'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'neuro', number:'03', name:'Неврология', audience:['adult'], description:'Консультация невролога: жалобы, результаты обследований и следующие шаги.', summary:'Забота о нервной системе', services:['Приём невролога','Обсуждение результатов обследований','Выбор дальнейшего обследования и лечения'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'children', number:'04', name:'Детям', audience:['child'], description:'Педиатрия и помощь детям с нарушениями движения и развития. Возраст приёма и нужного специалиста уточнит администратор.', summary:'Педиатрия и развитие', services:['Приём педиатра','Детская хирургия','Помощь при нарушениях речевого развития','Реабилитация детей'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'therapy', number:'05', name:'Терапия', audience:['adult'], description:'Консультация терапевта по вопросам общего самочувствия и дальнейшего обследования.', summary:'Общее самочувствие и консультации', services:['Приём терапевта','Обсуждение жалоб и медицинских документов','Рекомендации по дальнейшему обследованию'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'surgery', number:'06', name:'Хирургия', audience:['adult','child'], description:'Консультации хирурга и детского хирурга. Специализацию и возраст приёма уточняйте при записи.', summary:'Консультации взрослых и детей', services:['Приём хирурга','Детская хирургия','Консультация хирурга-эндокринолога'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'podology', number:'07', name:'Подология', audience:['adult','child'], description:'Консультация по вопросам состояния стоп и ногтей. Нужный объём помощи определяет специалист.', summary:'Стопы, ногти, плоскостопие', services:['Лечение проблем стоп','Помощь при вросших ногтях','Лечение плоскостопия','Помощь при проблемах стоп у детей'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'gastro', number:'08', name:'Гастроэнтерология', audience:['adult'], description:'Приём гастроэнтеролога по вопросам органов пищеварения.', summary:'Забота о пищеварении', services:['Консультация гастроэнтеролога','Обсуждение жалоб и результатов обследований'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'ent', number:'09', name:'ЛОР и сурдология', audience:['adult'], description:'Консультация ЛОР-врача и сурдолога. Подготовку и доступное время приёма уточнит администратор.', summary:'Ухо, горло, нос и слух', services:['Приём ЛОР-сурдолога','Консультация по вопросам слуха'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'derma', number:'10', name:'Дерматология', audience:['adult'], description:'Консультация по вопросам состояния кожи. Возраст приёма и расписание уточняйте у администратора.', summary:'Консультация по вопросам кожи', services:['Консультация дерматолога'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'manual', number:'11', name:'Мануальная терапия', audience:['adult'], description:'Мануальная терапия и остеопатия. Возможность проведения процедур обсуждается со специалистом на консультации.', summary:'Мануальная терапия и остеопатия', services:['Мануальная терапия','Остеопатия','Кинезиотейпирование'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'mental', number:'12', name:'Психическое здоровье', audience:['adult'], description:'Консультации психиатра и психотерапевта. Уточнить специалиста и порядок записи можно у администратора.', summary:'Психиатр и психотерапевт', services:['Приём психиатра','Приём психотерапевта'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'diet', number:'13', name:'Диетология', audience:['adult'], description:'Консультация диетолога по вопросам питания. Рекомендации обсуждаются индивидуально на приёме.', summary:'Питание и консультации', services:['Консультация диетолога'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'procedures', number:'14', name:'Лечебные процедуры', audience:['adult'], description:'Процедуры проводятся по назначению врача. Подготовку, стоимость и наличие услуги уточняйте при записи.', summary:'Процедурный кабинет и терапия', services:['Процедурный кабинет','Ударно-волновая терапия','Лечебные блокады','Внутрисуставное введение лекарственных средств'], source:'https://ra-kurs86.ru/uslugi' },
  { id:'narcology', number:'15', name:'Наркология', audience:['adult'], description:'Приём нарколога. Порядок консультации и расписание можно уточнить у администратора.', summary:'Консультация специалиста', services:['Консультация нарколога'], source:'https://ra-kurs86.ru/uslugi' },
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const booking = $('#booking-dialog');
const catalog = $('#catalog-dialog');
const detail = $('#direction-dialog');
let activeDirection = null;
let catalogFilter = 'all';
let returnFocus = null;
let detailFromCatalog = false;

function openDialog(dialog, initiator = document.activeElement) {
  // Never stack modal dialogs; preserve the original, visible focus target.
  if (!$$('dialog[open]').length) returnFocus = initiator;
  $$('dialog[open]').forEach(open => open.close());
  dialog.showModal();
  document.body.classList.add('modal-open');
}

function restoreFocus() {
  document.body.classList.toggle('modal-open', !!$$('dialog[open]').length);
  if (!$$('dialog[open]').length && returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
}

$$('dialog').forEach(dialog => {
  dialog.addEventListener('close', restoreFocus);
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

function openBooking(direction = null) {
  closeMenu();
  $('#copy-label').textContent = 'Скопировать номер';
  $('#copy-status').textContent = '';
  $('#copy-phone use').setAttribute('href','#copy');
  $('#booking-context').textContent = direction
    ? `Вы выбрали направление «${direction.name}». Администратор уточнит специалиста, стоимость и время приёма.`
    : 'Администратор поможет выбрать специалиста и удобное время.';
  openDialog(booking);
}

$$('[data-book]').forEach(button => button.addEventListener('click', () => openBooking()));

function openDirection(id, fromCatalog = false) {
  activeDirection = directions.find(item => item.id === id);
  if (!activeDirection) return;
  detailFromCatalog = fromCatalog;
  $('#direction-index').textContent = `${activeDirection.number} / МЕДРАКУРС`;
  $('#direction-title').textContent = activeDirection.name;
  $('#direction-description').textContent = activeDirection.description;
  $('#direction-services').replaceChildren(...activeDirection.services.map(service => {
    const li = document.createElement('li');
    li.textContent = service;
    return li;
  }));
  $('#direction-source').href = activeDirection.source;
  openDialog(detail);
}

$$('[data-direction]').forEach(button => button.addEventListener('click', () => openDirection(button.dataset.direction)));
$('#direction-book').addEventListener('click', () => openBooking(activeDirection));

// Escape from a catalog result returns to the current search rather than losing it.
detail.addEventListener('cancel', event => {
  if (!detailFromCatalog) return;
  event.preventDefault();
  openDialog(catalog);
  $('#catalog-search').focus();
});

function normalize(text) {
  return text.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
}

function renderCatalog() {
  const query = normalize($('#catalog-search').value);
  const words = query.split(/\s+/).filter(Boolean);
  const matches = directions.filter(item => {
    const text = normalize([item.name, item.summary, ...item.services].join(' '));
    return (catalogFilter === 'all' || item.audience.includes(catalogFilter)) && words.every(word => text.includes(word));
  });
  $('#catalog-status').textContent = `Найдено направлений: ${matches.length}`;
  const results = $('#catalog-results');
  results.replaceChildren();
  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'По этому запросу ничего не найдено. Попробуйте другое название или обратитесь к администратору.';
    results.append(empty);
    return;
  }
  matches.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'catalog-result';
    const copy = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'result-name';
    name.textContent = item.name;
    const description = document.createElement('span');
    description.className = 'result-description';
    description.textContent = item.summary;
    copy.append(name, description);
    const arrow = document.createElementNS('http://www.w3.org/2000/svg','svg');
    arrow.setAttribute('aria-hidden','true');
    const use = document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href','#arrow-up');
    arrow.append(use);
    button.append(copy,arrow);
    button.addEventListener('click', () => openDirection(item.id, true));
    results.append(button);
  });
}

$$('[data-catalog]').forEach(button => button.addEventListener('click', () => {
  renderCatalog();
  openDialog(catalog);
  $('#catalog-search').focus();
}));
$('#catalog-search').addEventListener('input', renderCatalog);
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  catalogFilter = button.dataset.filter;
  $$('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  renderCatalog();
}));

$('#copy-phone').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('+79821820182');
    $('#copy-label').textContent = 'Скопировано';
    $('#copy-status').textContent = 'Номер скопирован: +7 982 182-01-82';
    $('#copy-phone use').setAttribute('href','#check');
  } catch {
    $('#copy-status').textContent = 'Не удалось скопировать автоматически. Номер для записи: +7 982 182-01-82';
  }
});

const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label','Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = isOpen;
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
matchMedia('(min-width:851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const readingToggle = $('.reading-toggle');
let readingMode = false;
try { readingMode = localStorage.getItem('medrakurs-reading-mode') === 'true'; } catch { /* File previews may restrict storage. */ }
function applyReadingMode() {
  document.body.classList.toggle('reading-mode', readingMode);
  readingToggle.setAttribute('aria-pressed', String(readingMode));
  readingToggle.setAttribute('aria-label', readingMode ? 'Вернуть обычный размер текста' : 'Увеличить текст и контраст');
}
readingToggle.addEventListener('click', () => {
  readingMode = !readingMode;
  applyReadingMode();
  try { localStorage.setItem('medrakurs-reading-mode', String(readingMode)); } catch { /* No persistence needed to use the toggle. */ }
});
applyReadingMode();

// Keep the opening screen quiet; the mobile action follows only after its
// original button has scrolled above the viewport.
if ('IntersectionObserver' in window) {
  const actionObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('mobile-cta-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
  });
  actionObserver.observe($('.hero-actions'));
} else {
  document.body.classList.add('mobile-cta-visible');
}
