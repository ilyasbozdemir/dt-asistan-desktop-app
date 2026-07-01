import { BrowserWindow } from 'electron'

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

    // 2. Base64 encode images and extract header/footer
    const extracted = await win.webContents.executeJavaScript(`
      (async () => {
        // Base64 encode images for native header/footer support
        const imgs = document.querySelectorAll('img');
        for (let img of imgs) {
          if (img.src.startsWith('http')) {
            try {
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
            } catch (e) {
              console.error('Failed to encode image', e);
            }
          }
        }

        const footerEl = document.querySelector('.paged-footer');
        const footerHtml = footerEl ? footerEl.outerHTML : '<div></div>';
        
        const headerEl = document.querySelector('.paged-header');
        const isFirstPageOnly = headerEl && headerEl.getAttribute('data-behavior') === 'first-page-only';
        
        let headerHtml = '<div></div>';
        let hasHeader = false;
        
        if (headerEl) {
          if (isFirstPageOnly) {
            // Keep first-page-only headers in the body so they only print on the first page
          } else {
            headerHtml = headerEl.outerHTML;
            hasHeader = true;
            headerEl.remove();
          }
        }

        // Remove footer from body so it doesn't print in the main content
        if (footerEl) footerEl.remove();
        
        return { footerHtml, headerHtml, hasHeader };
      })()
    `)

    // 3. Generate initial PDF to determine page count
    const pdfBufferFirstPass = await win.webContents.printToPDF({
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="width: 100%; font-size: 10px; padding: 0 1.5cm; margin-top: 15px; -webkit-print-color-adjust: exact;">${extracted.headerHtml}</div>`,
      footerTemplate: `<div style="width: 100%; font-size: 10px; padding: 0 1.5cm; -webkit-print-color-adjust: exact;">
                         ${extracted.footerHtml}
                         <div style="text-align: center; margin-top: 8px; font-size: 9px; font-weight: bold; color: #555;">
                           <span class="pageNumber"></span> / <span class="totalPages"></span>
                         </div>
                       </div>`,
      margins: {
        top: extracted.hasHeader ? 1.6 : 0.98, // Increase top margin if there is a header
        bottom: 1.2, // ~3cm (Footer and pagination needs a bit more space)
        left: 0.59, // ~1.5cm
        right: 0.59 // ~1.5cm
      },
      pageSize: 'A4'
    })

    // Check if it is a single page
    const isSinglePage = (pdfBufferFirstPass.toString().match(/\/Type\s*\/Page\b/g) || []).length === 1;

    if (isSinglePage) {
      // Regenerate without the pagination footer
      return await win.webContents.printToPDF({
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div style="width: 100%; font-size: 10px; padding: 0 1.5cm; margin-top: 15px; -webkit-print-color-adjust: exact;">${extracted.headerHtml}</div>`,
        footerTemplate: `<div style="width: 100%; font-size: 10px; padding: 0 1.5cm; -webkit-print-color-adjust: exact;">
                           ${extracted.footerHtml}
                         </div>`,
        margins: {
          top: extracted.hasHeader ? 1.6 : 0.98,
          bottom: 1.2,
          left: 0.59,
          right: 0.59
        },
        pageSize: 'A4'
      })
    }

    return pdfBufferFirstPass

    return pdfBuffer
  } finally {
    if (!win.isDestroyed()) {
      win.destroy()
    }
  }
}
