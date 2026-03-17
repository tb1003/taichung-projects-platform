/**
 * 萬用爬蟲 - Electron 主進程（Mac 桌面版）
 * 提供視窗、儲存路徑選擇、執行爬蟲並寫入檔案
 */
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const isDev = process.env.NODE_ENV !== "production" || !app.isPackaged;
const crawlerRoot = isDev
  ? path.join(__dirname, "..", "crawler")
  : path.join(process.resourcesPath, "crawler");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 720,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "萬用爬蟲",
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 選擇儲存目錄
ipcMain.handle("choose-save-dir", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
    title: "選擇結果儲存位置",
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

// 執行爬蟲並儲存
ipcMain.handle("run-crawler", async (_event, config, saveDir, format) => {
  const crawlerPath = path.join(crawlerRoot, "lib", "crawler.js");
  const exportersPath = path.join(crawlerRoot, "lib", "exporters.js");

  const { runCrawler } = await import(pathToFileURL(crawlerPath).href);
  const { exportResults } = await import(pathToFileURL(exportersPath).href);

  const options = { ...config.options, maxPages: Math.min(config.options?.maxPages ?? 100, 500) };
  const fullConfig = { ...config, options };

  const results = await runCrawler(fullConfig);

  const output = {
    dir: saveDir,
    filename: "crawler-result",
    format: format || "json",
  };
  const savedPath = exportResults(output, results);
  return { count: results.length, savedPath };
});
