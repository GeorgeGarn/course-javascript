/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

document.addEventListener('touchstart', dragStart, false);
document.addEventListener('touchend', dragEnd, false);
document.addEventListener('touchmove', drag, false);

document.addEventListener('mousedown', dragStart, false);
document.addEventListener('mouseup', dragEnd, false);
document.addEventListener('mousemove', drag, false);

export function createDiv() {
  const maxHeight = 200;
  const maxWidth = 300;
  const maxTop = 500;
  const maxLeft = 800;

  const div = document.createElement('DIV');
  div.classList.add('draggable-div');
  div.draggable = true;
  div.style.backgroundColor =
    'rgb(' +
    Math.floor(Math.random() * 256) +
    ',' +
    Math.floor(Math.random() * 256) +
    ',' +
    Math.floor(Math.random() * 256) +
    ')';
  div.style.height = Math.floor(Math.random() * maxHeight).toString() + 'px';
  div.style.width = Math.floor(Math.random() * maxWidth).toString() + 'px';
  div.style.top = Math.floor(Math.random() * maxTop).toString() + 'px';
  div.style.left = Math.floor(Math.random() * maxLeft).toString() + 'px';
  return div;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const div = createDiv();
  homeworkContainer.appendChild(div);
});

let currentDrag;

function dragStart(e) {
  if (e.target.classList.contains('draggable-div')) {
    currentDrag = e.target;

    if (currentDrag !== null) {
      if (!currentDrag.xOffset) {
        currentDrag.xOffset = 0;
      }

      if (!currentDrag.yOffset) {
        currentDrag.yOffset = 0;
      }

      if (e.type === 'touchstart') {
        currentDrag.initialX = e.touches[0].clientX - currentDrag.xOffset;
        currentDrag.initialY = e.touches[0].clientY - currentDrag.yOffset;
      } else {
        currentDrag.initialX = e.clientX - currentDrag.xOffset;
        currentDrag.initialY = e.clientY - currentDrag.yOffset;
      }
    }
  }
}

function dragEnd(e) {
  if (currentDrag !== null) {
    currentDrag.initialX = currentDrag.currentX;
    currentDrag.initialY = currentDrag.currentY;
  }

  currentDrag = null;
}

function drag(e) {
  if (currentDrag !== null) {
    e.preventDefault();

    if (e.type === 'touchmove') {
      currentDrag.currentX = e.touches[0].clientX - currentDrag.initialX;
      currentDrag.currentY = e.touches[0].clientY - currentDrag.initialY;
    } else {
      currentDrag.currentX = e.clientX - currentDrag.initialX;
      currentDrag.currentY = e.clientY - currentDrag.initialY;
    }

    currentDrag.xOffset = currentDrag.currentX;
    currentDrag.yOffset = currentDrag.currentY;

    currentDrag.style.transform = `translate3d(${currentDrag.currentX}px, ${currentDrag.currentY}px, 0)`;
  }
}
