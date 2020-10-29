let addItemForm = document.querySelector('#addItemForm');
let itemsList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;



storage.get(['actionItems'], ( data ) => {
  let actionItems = data.actionItems;
  renderActionItems(actionItems);
  console.log(actionItems);
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
    add(itemText);
    renderActionItem(itemText);
    addItemForm.elements.namedItem('itemText').value = '';
  } 
})

const add = (text) => {
  let actionItem = {
    id: uuidv4(),
    added: new Date().toString(),
    text: text,
    completed: null,
  }
  
  storage.get(['actionItems'], ( data ) => {
    let items = data.actionItems;
    if(!items){
      items = [actionItem]
    } else {
      items.push(actionItem);
    }

    storage.set({
      actionItems: items
    }, () => {
      storage.get(['actionItems'], ( data ) => {
        console.log(data);
      })
    }); 
  });
  
}

const markUnmarkCompleted = ( id, completeStatus ) => {
  storage.get(['actionItems'], ( data ) => {
    let items = data.actionItems;
    let completed = items.completed;
    let foundItemIndex = items.findIndex(( item ) => item.id == id);
    if(foundItemIndex >= 0) {
      items[foundItemIndex].completed = completeStatus;
      storage.set({
        actionItems: items
      });
    }
  })
}

const handleCompletedEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  
  if (parent.classList.contains('completed')) {
    markUnmarkCompleted(id, null);
    parent.classList.remove('completed');
  } else {
    markUnmarkCompleted(id, new Date().toString());
    parent.classList.add('completed');
  }
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
  mainElement.appendChild(checkElement);
  mainElement.appendChild(textElement);
  mainElement.appendChild(deleteElement);
  divElement.appendChild(mainElement);
  itemsList.prepend(divElement);
}


var circle = new ProgressBar.Circle('#container', {
  color: '#7532a8',
  // This has to be the same size as the maximum width to
  // prevent clipping
  strokeWidth: 6,
  trailWidth: 2,
  easing: 'easeInOut',
  duration: 1400,
  text: {
    autoStyleContainer: false
  },
  from: {
    color: '#b24dff',
    width: 1
  },
  to: {
    color: '#7532a8',
    width: 4
  },
  // Set default step function for all animate calls
  step: function (state, circle) {
    circle.path.setAttribute('stroke', state.color);
    circle.path.setAttribute('stroke-width', state.width);

    var value = Math.round(circle.value() * 100);
    if (value === 0) {
      circle.setText('');
    } else {
      circle.setText(value);
    }

  }
});
circle.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
circle.text.style.fontSize = '2rem';

circle.animate(1.0); // Number from 0.0 to 1.0