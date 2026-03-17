const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("crawlerAPI", {
  chooseSaveDir: () => ipcRenderer.invoke("choose-save-dir"),
  runCrawler: (config, saveDir, format) => ipcRenderer.invoke("run-crawler", config, saveDir, format),
});
