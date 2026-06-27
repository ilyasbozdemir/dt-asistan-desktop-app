import { BrowserWindow } from 'electron'
import htmlDocx from 'html-docx-js'

/**
 * Prepares HTML for DOCX and renders it to a Buffer using html-docx-js.
 * We use an offscreen BrowserWindow to parse the DOM, base64 encode images,
 * and enforce explicit widths/heights so that MS Word can render them correctly.
 */
export async function renderDocxBuffer(htmlContent: string): Promise<Buffer> {
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

    // 2. Extract and prepare HTML using DOM manipulation
    const processedHtml = await win.webContents.executeJavaScript(`
      (async () => {
        // Base64 encode images and set explicit width/height
        const imgs = document.querySelectorAll('img');
        for (let img of imgs) {
          try {
            // Explicitly set width/height as inline styles and attributes for DOCX
            // This is required for html-docx-js to render them at the correct size
            const rect = img.getBoundingClientRect();
            if (rect.width > 0) {
                img.setAttribute('width', Math.round(rect.width) + 'px');
                img.style.width = Math.round(rect.width) + 'px';
            }
            if (rect.height > 0) {
                img.setAttribute('height', Math.round(rect.height) + 'px');
                img.style.height = Math.round(rect.height) + 'px';
            }

            if (img.src.startsWith('http') || img.src.startsWith('dta-res')) {
              const res = await fetch(img.src);
              const blob = await res.blob();
              const reader = new FileReader();
              await new Promise((resolve) => {
                reader.onloadend = () => {
                  img.src = reader.result;
                  resolve();
                };
                reader.readAsDataURL(blob);
              });
            }
          } catch (e) {
            console.error('Failed to process image for DOCX', e);
          }
        }
        
        // Remove interactive elements like buttons, etc if necessary
        // For DOCX, we just want the clean HTML
        return document.documentElement.outerHTML;
      })()
    `)

    // 3. Generate DOCX Buffer
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${processedHtml}</body></html>`
    const docxBlob = htmlDocx.asBlob(fullHtml)
    const docxBuffer = Buffer.from(await docxBlob.arrayBuffer())

    return docxBuffer
  } finally {
    if (!win.isDestroyed()) {
      win.destroy()
    }
  }
}
