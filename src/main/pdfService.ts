import { BrowserWindow } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Renders HTML to a PDF Buffer using Paged.js for pagination.
 */
export async function renderPdfBuffer(htmlContent: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  try {
    // 1. Load the HTML content
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

    // 2. Inject Paged.js polyfill
    const pagedJsPath = require.resolve('pagedjs/dist/paged.polyfill.js')
    const pagedJsScript = fs.readFileSync(pagedJsPath, 'utf-8')
    
    await win.webContents.executeJavaScript(pagedJsScript)

    // 3. Wait for Paged.js to finish rendering pages
    await win.webContents.executeJavaScript(`
      new Promise((resolve) => {
        if (document.querySelector('.pagedjs_pages')) {
          resolve();
        } else {
          window.PagedConfig = {
            auto: false
          };
          window.PagedPolyfill.preview().then(() => resolve());
        }
      })
    `)

    // 4. Generate PDF
    // We disable default Electron headers/footers because Paged.js handles them.
    // We set margins to 0 because Paged.js already applies margins in CSS.
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      displayHeaderFooter: false,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      pageSize: 'A4'
    })

    return pdfBuffer
  } finally {
    if (!win.isDestroyed()) {
      win.destroy()
    }
  }
}
