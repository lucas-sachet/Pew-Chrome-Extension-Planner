

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
        callback(actionItem);
      }); 
    });
  }

  remove = ( id, callback ) => {
    storage.get(['actionItems'], ( data ) => {
      let items = data.actionItems;
      let foundItemIndex = items.findIndex(( item ) => item.id == id);
      if(foundItemIndex >= 0) {
        items.splice(foundItemIndex, 1);
        storage.set({
          actionItems: items
        }, callback);
      }
    })
  }

  markUnmarkCompleted = ( id, completeStatus ) => {
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

  setProgress = () => {
    storage.get(['actionItems'], ( data ) => {
      let actionItems = data.actionItems;
      let completedItems;
      let totalItems = actionItems.length;
      completedItems = actionItems.filter( item => item.completed).length;
      let progress = 0;
      progress = completedItems / totalItems;
      circle.animate(progress);
    })
  }

}