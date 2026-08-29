const PDFJS = require(
  "pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js"
);

PDFJS.disableWorker = true;

/**
 * Extract text from a PDF, including password-protected PDFs.
 *
 * @param {Buffer} buffer - PDF file buffer
 * @param {string} password - Optional PDF password
 * @returns {Promise<{
 *   text: string,
 *   numpages: number
 * }>}
 */
async function parsePdf(buffer, password = "") {
  if (!buffer) {
    throw new Error("PDF buffer is required");
  }

  const cleanPassword =
    typeof password === "string"
      ? password.trim()
      : "";

  console.log("Attempting PDF extraction:", {
    hasPassword: Boolean(cleanPassword),
    passwordLength: cleanPassword.length,
  });

  const loadingTask = PDFJS.getDocument({
    data: buffer,
    password: cleanPassword || undefined,
  });

  const doc = await loadingTask.promise;

  console.log("PDF opened successfully:", {
    pages: doc.numPages,
  });

  let text = "";

  try {
    for (
      let pageNumber = 1;
      pageNumber <= doc.numPages;
      pageNumber++
    ) {
      const page =
        await doc.getPage(pageNumber);

      const content =
        await page.getTextContent();

      const pageText =
        content.items
          .map((item) => item.str || "")
          .join(" ");

      text += `\n\n${pageText}`;
    }
  } finally {
    await doc.destroy();
  }

  text = text.trim();

  console.log("PDF extraction successful:", {
    pages: doc.numPages,
    characters: text.length,
  });

  return {
    text,
    numpages: doc.numPages,
  };
}

module.exports = parsePdf;