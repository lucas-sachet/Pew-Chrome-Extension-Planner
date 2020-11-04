let addItemForm = document.querySelector('#addItemForm');
let itemsList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;

let actionItemUtils = new ActionItems();

storage.get(['actionItems', 'name'], ( data ) => {
  let actionItems = data.actionItems;
  let name = data.name;
  setUsersName(name);
  console.log(actionItems);
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
  actionItems.forEach( ( item ) => {
    renderActionItem(item.text, item.id, item.completed, item.website);
  });
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
      renderActionItem(item.text, item.id, item.completed, item.website);
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
      renderActionItem(item.text, item.id, item.completed, item.website);
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
  actionItemUtils.remove(id, () => {
    parent.remove();
  });
}

const renderActionItem = (text, id, completed, website = null) => {
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
