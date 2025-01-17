let addItemForm = document.querySelector('#addItemForm');
let itemsList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;


let actionItemUtils = new ActionItems();

storage.get(['actionItems', 'name'], ( data ) => {
  let actionItems = data.actionItems;
  let name = data.name;
  setUsersName(name);
  setGreeting();
  createQuickActionListener();
  renderActionItems(actionItems);
  actionItemUtils.setProgress();
  createUpdateNameDialogListener();
  createUpdateNameListener();
  getCurrentTab();
  chrome.storage.onChanged.addListener( () => {
    actionItemUtils.setProgress();
  })
});

const setUsersName = ( name ) => {
  let newName = name ? name : 'Add name';
  document.querySelector('.name__value').innerText = newName;
}

const renderActionItems = ( actionItems ) => {
  const filteredItems = filterActionItems(actionItems);
  filteredItems.forEach( ( item ) => {
    renderActionItem(item.text, item.id, item.completed, item.website, 250);
  });
  storage.set({
    actionItems : filteredItems
  })
}

const filterActionItems = ( actionItems ) => {
  var currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const filteredItems = actionItems.filter(( item ) => {
    if(item.completed) {
      const completedDate = new Date(item.completed);
      if(completedDate < currentDate) {
        return false;
      }
    }
    return true;
  })
  return filteredItems;
}

const createUpdateNameDialogListener = () => {
  let greetingName = document.querySelector('.greeting__name');

  greetingName.addEventListener('click', () => {
    //open the modal
    storage.get(['name'], ( data ) => {
      let name = data.name ? data.name : '';
      document.getElementById('input-name').value = name;
    });
    $('#updateNameModal').modal('show');
  })
}

const handleUpdateName = (e) => {
  const name = document.getElementById('inputName').value;
  if( name ) {
    actionItemUtils.saveName(name, () => {
      setUsersName(name);
      $('#updateNameModal').modal('hide');
    })
  }
}

const createUpdateNameListener = () => {
  let element = document.querySelector('#update-name');
  element.addEventListener('click', handleUpdateName)
}

const handleQuickActionListener = ( e ) => {
  const text = e.target.getAttribute('data-text');
  const id = e.target.getAttribute('data-id');
  getCurrentTab().then(( tab ) => {
    actionItemUtils.addQuickActionItem(id, text, tab, ( item ) => {
      renderActionItem(item.text, item.id, item.completed, item.website, 250);
    });
  })
}

const createQuickActionListener = () => {
  let buttons = document.querySelectorAll('.quick-action');
  buttons.forEach(( button ) => {
    button.addEventListener('click', handleQuickActionListener)
  })
}

async function getCurrentTab() {
  return await new Promise(( resolve, reject ) => {
    chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, ( tabs ) => {
      resolve(tabs[0]);
    })
  })
}

addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let itemText = addItemForm.elements.namedItem('itemText').value;
  if(itemText) {
    actionItemUtils.add(itemText, null, ( actionItem )=>{
      renderActionItem(item.text, item.id, item.completed, item.website, 250);
      addItemForm.elements.namedItem('itemText').value = '';
    });
  } 
})

const handleCompletedEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  
  if (parent.classList.contains('completed')) {
    actionItemUtils.markUnmarkCompleted(id, null);
    parent.classList.remove('completed');
  } else {
    actionItemUtils.markUnmarkCompleted(id, new Date().toString());
    parent.classList.add('completed');
  }
}

const handleDeleteEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute('data-id');
  const parent = e.target.parentElement.parentElement;
  let jElement = $(`div[data-id="${id}"]`);
  actionItemUtils.remove(id, () => {
    animateRight(jElement);
  });
}

const renderActionItem = (text, id, completed, website = null, animationDuration=500 ) => {
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
  if(website) {
    let linkContainer = createLinkContainer(website.url, website.fav_icon, website.title);
    divElement.appendChild(linkContainer);
    console.log(website);
  }
  itemsList.prepend(divElement);
  let jElement = $(`div[data-id="${id}"]`);
  animateDown(jElement, animationDuration);
}

const animateRight = ( element ) => {
  let width = element.innerWidth();
  element.animate({
    opacity: 0,
    marginLeft: `${width}px`,
    marginRight: `-${width}px`,
  }, 350, () => {
    element.remove();
  })
}

const animateDown = ( element, duration ) => {
  let height = element.innerHeight();
  element.css({marginTop: `-${height}px`, opacity: 0 }).animate({
    opacity: 1,
    marginTop: '12px',
  }, duration)
}

const createLinkContainer = (url, favIcon, title) => {
  let element = document.createElement('div');
  element.classList.add('actionItem__linkContainer');
  element.innerHTML= `
  <a href="${url}" target="_blank">
    <div class="actionItem__link">
      <div class="actionItem__favIcon">
        <img src="${favIcon}" alt="favicon">
      </div>
      <div class="actionItem__title">
        <span>${title}</span>
      </div>
    </div>
  </a>
  `
  return element;
}

const setGreeting = () => {
  let greeting = 'Good ';
  let img = document.getElementById('greeting__image');
  const date = new Date();
  const hours = date.getHours();
  if( hours >=5 && hours <=11){
    greeting += 'Morning,';
    img.src = './assets/images/good-morning.png';
  }else if( hours >=12 && hours <=16){
    greeting += 'Afternoon,';
    img.src = './assets/images/good-afternoon.png';
  }else if( hours >=17 && hours <=20){
    greeting += 'Evening,';
    img.src = './assets/images/good-evening.png';
  }else{
    greeting += 'Night,';
    img.src = './assets/images/good-night.png';
  }

  document.querySelector('.greeting__type').innerText = greeting;
}