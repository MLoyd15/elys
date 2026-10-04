import { useState } from "react";
import { api } from "../api.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Icon } from "../icons.jsx";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function extractPageText(items) {
  let text = "";
  let previousY = null;
  let previousHasEOL = false;

  for (const item of items) {
    const value = item.str?.trim();
    if (!value) continue;

    const y = item.transform?.[5];
    if (text) {
      const newLine = previousHasEOL
        || (Number.isFinite(y) && Number.isFinite(previousY) && Math.abs(y - previousY) > 2);
      text += newLine ? "\n" : " ";
    }
    text += value;
    previousY = y;
    previousHasEOL = Boolean(item.hasEOL);
  }

  return text;
}

export default function PdfToText({ onGenerated }) {
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileName("");
    setPageCount(0);
    setText("");
    setError("");
    setCopyMessage("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setProcessingLabel("Extracting text from your PDF…");
    let loadingTask;
    let document;
    try {
      loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      document = await loadingTask.promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(extractPageText(content.items));
      }

      const extractedText = pages.join("\n\n").trim();
      setPageCount(document.numPages);
      await document.destroy();
      document = null;
      loadingTask = null;
      setText(extractedText);
      if (!extractedText) {
        setError("No selectable text was found. This PDF may contain scanned pages; OCR is not supported yet.");
      } else if (extractedText.length > 100000) {
        setError("This PDF has too much text to process at once. Try a shorter document (up to 100,000 characters).");
      } else {
        setProcessingLabel("Generating your study guide, flashcards, and quiz with Gemini…");
        try {
          const result = await api("/study-guides/generate", {
            method: "POST",
            body: JSON.stringify({ fileName: file.name, text: extractedText }),
          });
          setCopyMessage("Your study materials are saved. Opening the Study Room…");
          onGenerated(result.guide);
        } catch (generationError) {
          setError(generationError.message);
        }
      }
    } catch (conversionError) {
      setError(conversionError instanceof Error ? `Could not read this PDF: ${conversionError.message}` : "Could not read this PDF.");
    } finally {
      try {
        if (document) await document.destroy();
        else if (loadingTask) await loadingTask.destroy();
      } catch (cleanupError) {
        setError((currentError) => currentError || (cleanupError instanceof Error
          ? `Could not finish PDF processing: ${cleanupError.message}`
          : "Could not finish PDF processing."));
      }
      setLoading(false);
      setProcessingLabel("");
    }
  }

  async function copyText() {
    setCopyMessage("");
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Text copied.");
    } catch {
      setError("Could not copy the text. Select it below and copy it manually.");
    }
  }

  return (
    <section className="pdf-text-workspace" aria-busy={loading}>
      <div className="pdf-upload-card">
        <div className="pdf-upload-icon"><Icon name="fileText" size={22} /></div>
        <div className="pdf-upload-copy">
          <h2>Turn a PDF into text</h2>
          <p>PDF text is extracted in your browser, then sent to Gemini to create a saved study guide, flashcards, and quiz. Don’t upload patient identifiers or confidential documents; generated materials are shared with app users. Scanned PDFs need OCR.</p>
        </div>
        <input
          className="visually-hidden pdf-upload-input"
          id="pdf-upload"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={loading}
        />
        <label className={`button button-primary pdf-upload-button ${loading ? "is-disabled" : ""}`} htmlFor="pdf-upload">
          <Icon name="plus" size={17} />
          {loading ? "Extracting…" : fileName ? "Choose another PDF" : "Choose PDF"}
        </label>
      </div>

      {fileName && <div className="pdf-file-status">{fileName}{pageCount > 0 && ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}</div>}
      {text && error && !loading && (
        <button className="button pdf-copy-button pdf-retry-button" onClick={async () => {
          setError("");
          setCopyMessage("");
          setLoading(true);
          setProcessingLabel("Generating your study guide, flashcards, and quiz with Gemini…");
          try {
            const result = await api("/study-guides/generate", {
              method: "POST",
              body: JSON.stringify({ fileName, text }),
            });
            setCopyMessage("Your study materials are saved. Opening the Study Room…");
            onGenerated(result.guide);
          } catch (generationError) {
            setError(generationError.message);
          } finally {
            setLoading(false);
            setProcessingLabel("");
          }
        }}>Try generating again</button>
      )}
      {loading && <div className="pdf-conversion-status" role="status"><span className="loader" /> {processingLabel}</div>}
      {error && <p className="pdf-conversion-error" role="alert">{error}</p>}

      <div className="pdf-result-heading">
        <div>
          <h2>Extracted text</h2>
          <p>{text ? "Review and copy the text below." : "Your converted text will appear here."}</p>
        </div>
        {text && <button className="button pdf-copy-button" onClick={copyText}><Icon name="note" size={16} /> Copy text</button>}
      </div>
      {copyMessage && <span className="pdf-copy-status" role="status">{copyMessage}</span>}
      <textarea
        className="pdf-text-output"
        aria-label="Extracted text from PDF"
        value={text}
        readOnly
        placeholder="Choose a PDF to get started."
        spellCheck="false"
      />
    </section>
  );
}
