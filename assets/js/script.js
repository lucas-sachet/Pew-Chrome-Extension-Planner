let addItemForm = document.querySelector('#addItemForm');
let itemsList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;

let actionItemItils = new ActionItems();

storage.get(['actionItems'], ( data ) => {
  let actionItems = data.actionItems;
  console.log(actionItems);
  renderActionItems(actionItems);
  actionItemItils.setProgress();
});

const renderActionItems = (actionItems) => {
  actionItems.forEach( ( item ) => {
    renderActionItem(item.text, item.id, item.completed);
  });
}

addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let itemText = addItemForm.elements.namedItem('itemText').value;
  if(itemText) {
    actionItemItils.add(itemText);
    renderActionItem(itemText);
    addItemForm.elements.namedItem('itemText').value = '';
  } 
})

const handleCompletedEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  
  if (parent.classList.contains('completed')) {
    actionItemItils.markUnmarkCompleted(id, null);
    parent.classList.remove('completed');
  } else {
    actionItemItils.markUnmarkCompleted(id, new Date().toString());
    parent.classList.add('completed');
  }
}

const handleDeleteEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  parent.remove();
  actionItemItils.remove(id);
}

const renderActionItem = (text, id, completed) => {
  let divElement = document.createElement('div');
  let mainElement = document.createElement('div');
  let checkElement = document.createElement('div');
  let textElement = document.createElement('div');
  let deleteElement = document.createElement('div');
  divElement.classList.add('actionItem__item');
  mainElement.classList.add('actionItem__main');
  checkElement.classList.add('actionItem__check');
  textElement.classList.add('actionItem__text');
  deleteElement.classList.add('actionItem__delete');

  checkElement.innerHTML =
    `
        <div class="actionItem__checkBox">
          <i class="fas fa-check" aria-hidden="true"></i>
        </div> 
      `;
  if(completed) {
    divElement.classList.add('completed');
  }
  divElement.setAttribute('data-id', id);
  checkElement.addEventListener('click', handleCompletedEventListener);
  textElement.textContent = text;
  deleteElement.innerHTML =
    `
      <i class="fas fa-times" aria-hidden="true"></i>
    `;
  deleteElement.addEventListener('click', handleDeleteEventListener);
  mainElement.appendChild(checkElement);
  mainElement.appendChild(textElement);
  mainElement.appendChild(deleteElement);
  divElement.appendChild(mainElement);
  itemsList.prepend(divElement);
}