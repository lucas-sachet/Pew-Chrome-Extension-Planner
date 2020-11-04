

class ActionItems {


  addQuickActionItem = ( id, text, tab, callback ) => {
   let website = null;
    //quick action 4 = Link site for later
    
    if(id == "quick-action-4") {
      website = {
        url: tab.url,
        fav_icon: tab.favIconUrl,
        title: tab.title
      }
    }

    this.add(text, website, callback)
  }
  
  add = ( text, website = null, callback ) => {
    let actionItem = {
      id: uuidv4(),
      added: new Date().toString(),
      text: text,
      completed: null,
      website: website,
    }
    
    chrome.storage.sync.get(['actionItems'], ( data ) => {
      let items = data.actionItems;
      if(!items){
        items = [actionItem]
      } else {
        items.push(actionItem);
      }
  
      chrome.storage.sync.set({
        actionItems: items
      }, () => {
        callback(actionItem);
      }); 
    });
  }

  saveName = ( name, callback ) => {
    chrome.storage.sync.set({
      name: name
    }, callback)
  }

  remove = ( id, callback ) => {
    chrome.storage.sync.get(['actionItems'], ( data ) => {
      let items = data.actionItems;
      let foundItemIndex = items.findIndex(( item ) => item.id == id);
      if(foundItemIndex >= 0) {
        items.splice(foundItemIndex, 1);
        chrome.storage.sync.set({
          actionItems: items
        }, callback);
      }
    })
  }

  markUnmarkCompleted = ( id, completeStatus ) => {
    chrome.storage.sync.get(['actionItems'], ( data ) => {
      let items = data.actionItems;
      let completed = items.completed;
      let foundItemIndex = items.findIndex(( item ) => item.id == id);
      if(foundItemIndex >= 0) {
        items[foundItemIndex].completed = completeStatus;
        chrome.storage.sync.set({
          actionItems: items
        });
      }
    })
  }

  setProgress = () => {
    chrome.storage.sync.get(['actionItems'], ( data ) => {
      let actionItems = data.actionItems;
      let completedItems;
      let totalItems = actionItems.length;
      completedItems = actionItems.filter( item => item.completed).length;
      let progress = 0;
      if(totalItems > 0 ){
        progress = completedItems / totalItems;
      }
      this.setBrowserBadge(totalItems - completedItems);
      if(typeof window.circle !== "undefined") circle.animate(progress);
 
    })
  }

  setBrowserBadge = ( todoItems ) => {
    let text = `${todoItems}`
    if(todoItems > 9) {
      text = '9+';
    }
    chrome.browserAction.setBadgeBackgroundColor({ color: "#7532a8" });
    chrome.browserAction.setBadgeText({ text: text });
  }

}