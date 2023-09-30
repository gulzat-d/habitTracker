'use strict';

let habits = [];
const HABIT_KEY = 'HABIT_KEY';
let globalActiveHabitId;

/* page */
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.articleHeader'),
    progressPercent: document.querySelector('.progress__percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habit__day'),
  } ,
  popup: {
    index: document.querySelector('.cover'),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  }
};

/* utils */
function loadData() {
  const habitsString = localStorage.getItem(HABIT_KEY);
  const habitArray = JSON.parse(habitsString);
  if (Array.isArray(habitArray)) {
    habits = habitArray;
  }
}

function saveData() {
  localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

/* render */
function rerenderMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id = "${habit.id}"]`);
    if (!existed) {
      //создание унопки в боковой панели
      const element = document.createElement('button');
      element.setAttribute('menu-habit-id', habit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => {rerender(habit.id)})
      element.innerHTML = `<img src="images/${habit.icon}.svg" alt="${habit.name}">`;
      if (activeHabit.id === habit.id) {
        element.classList.add('menu__item_active');
      }
      page.menu.appendChild(element);
      continue;
    }
    // удаляет и добавляет menu__item_active
    if (activeHabit.id === habit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
};

function rerenderHead(activeHabit) {
  if (!activeHabit) {
    return;
  }
  page.header.h1.innerText = activeHabit.name;
  const progress = activeHabit.days.length / activeHabit.target > 1 
    ? 100
    : activeHabit.days.length / activeHabit.target * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + '%';
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderBody(activeHabit) {
  page.content.daysContainer.innerHTML = '';
  for (const i in activeHabit.days) {
    const element = document.createElement('div');
    element.classList.add('habit');
    element.innerHTML = `<div class="habit__day">День ${Number(i)+1}</div>
      <div class="habit__comment">${activeHabit.days[i].comment}</div>
      <button class="habit__delete" onclick = "deleteDay(${Number(i)})">
        <img src="images/delete.svg" alt="Удалить день ${Number(i)+1}">
      </button>`;
      page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabit.days.length + 1}`;
}


function rerender(activeHabitId) {
  globalActiveHabitId = activeHabitId;
  const activeHabit = habits.find(habit => habit.id === activeHabitId);
  if (!activeHabit) {
    return;
  }
  document.location.replace(document.location.pathname + '#' + activeHabitId);
  rerenderMenu(activeHabit);
  rerenderHead(activeHabit);
  rerenderBody(activeHabit);
}

/* work with days */
function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['comment']);
  if (!data) {
    return;
  }
  habits = habits.map(habit => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([{ comment: data.comment }])
      }
    }
    return habit;
  });
  resetForm(event.target, ['comment']);
  rerender(globalActiveHabitId);
  saveData();
}

function deleteDay(index) {
  habits = habits.map(habit => {
    if (habit.id === globalActiveHabitId) {
      habit.days.splice(index, 1);
      return {
        ...habit,
        days: habit.days
      };
    }
    return habit;
  })
  rerender(globalActiveHabitId);
  saveData();
}

function togglePopup() {
  page.popup.index.classList.toggle('cover_hidden');
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  let res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      return form[field].classList.add('error');
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

/* working with habits */
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active')
  console.log(context); 
}

function addHabit(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }
  habits.push({
    id: habits.length + 1,
    icon: data.icon,
    name: data.name,
    target: Number(data.target),
    days: []
  });
  resetForm(event.target, ['name', 'target']);
  togglePopup();
  saveData();
  rerender(habits[habits.length - 1].id);
}

/* init */
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace('#', ''));
  let urlHabitId = habits.find(habit => habit.id == hashId).id;
  if (urlHabitId) {
    rerender(urlHabitId);
  } else {
    rerender(habits[0].id);
  }
})();
