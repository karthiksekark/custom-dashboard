chrome.action.onClicked.addListener(async () => {
  const dashboardUrl = chrome.runtime.getURL('index.html');
  const existing = await chrome.tabs.query({ url: dashboardUrl });

  if (existing.length > 0) {
    await chrome.tabs.update(existing[0].id, { active: true });
    await chrome.windows.update(existing[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: dashboardUrl });
  }
});
