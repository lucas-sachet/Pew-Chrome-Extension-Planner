let actionItemUtils = new ActionItems();

chrome.contextMenus.create({
  "id": "linkSiteMenu",
  "title": "Link site for later",
  "contexts": ["all"],
})

chrome.runtime.onInstalled.addListener(( details ) => {
  if(details.reason == 'install') {
    chrome.storage.sync.set({
      actionItems : []
    })
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if(info.menuItemId == "linkSiteMenu") {
    actionItemUtils.addQuickActionItem('quick-action-4', 'Read this site', tab, () => {
      actionItemUtils.setProgress();
    });
   
  }
});