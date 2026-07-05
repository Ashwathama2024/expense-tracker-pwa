// Converts a user-picked file into a PNG/JPEG data URL suitable for the
// vision API. Images pass through as-is; PDFs get their first page
// rasterized to a canvas (receipts/screenshots are effectively always a
// single page, so we don't bother with the rest).

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function renderPdfFirstPageToDataUrl(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas context to render PDF.");

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
}

export async function fileToImageDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return renderPdfFirstPageToDataUrl(file);
  }
  return fileToDataUrl(file);
}
