

class ActionItems {
  add = ( text, callback ) => {
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