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
  const [inputMode, setInputMode] = useState("pdf");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [retryAvailable, setRetryAvailable] = useState(false);

  async function generateStudyMaterials(sourceText, sourceName) {
    setError("");
    setCopyMessage("");
    setRetryAvailable(false);
    setLoading(true);
    setProcessingLabel("Generating your study guide, flashcards, and quiz with Gemini…");
    try {
      const result = await api("/study-guides/generate", {
        method: "POST",
        body: JSON.stringify({ fileName: sourceName, text: sourceText }),
      });
      setCopyMessage("Your study materials are saved. Opening the Study Room…");
      onGenerated(result.guide);
    } catch (generationError) {
      setError(generationError.message);
      setRetryAvailable(generationError.status !== 413);
    } finally {
      setLoading(false);
      setProcessingLabel("");
    }
  }

  function switchInputMode(nextMode) {
    setInputMode(nextMode);
    setError("");
    setCopyMessage("");
    setRetryAvailable(false);
  }

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
      setPageCount(document.numPages);
      if (document.numPages > 30) {
        setError(`This PDF has ${document.numPages} pages. AI Guide supports PDFs up to 30 pages.`);
        return;
      }
      const pages = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(extractPageText(content.items));
      }

      const extractedText = pages.join("\n\n").trim();
      await document.destroy();
      document = null;
      loadingTask = null;
      setText(extractedText);
      if (!extractedText) {
        setError("No selectable text was found. This PDF may contain scanned pages; OCR is not supported yet.");
      } else {
        await generateStudyMaterials(extractedText, file.name);
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

  async function handleTextSubmit(event) {
    event.preventDefault();
    if (!text.trim() || loading) return;
    setFileName("");
    setPageCount(0);
    await generateStudyMaterials(text.trim(), "Pasted text");
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
      <div className="ai-guide-heading">
        <div className="pdf-upload-icon"><Icon name="spark" size={22} /></div>
        <div className="pdf-upload-copy">
          <h2>Build a study guide with AI</h2>
          <p>Generate a saved study guide, 12 flashcards, and a 10-question quiz. Text is sent to Gemini; generated materials are shared with app users. Don’t include patient identifiers or confidential information.</p>
        </div>
      </div>

      <div className="ai-guide-input-tabs" role="group" aria-label="Choose study material source">
        <button type="button" className={`ai-guide-input-tab ${inputMode === "pdf" ? "active" : ""}`} aria-pressed={inputMode === "pdf"} onClick={() => switchInputMode("pdf")}>Upload PDF</button>
        <button type="button" className={`ai-guide-input-tab ${inputMode === "text" ? "active" : ""}`} aria-pressed={inputMode === "text"} onClick={() => switchInputMode("text")}>Paste text</button>
      </div>

      {inputMode === "pdf" ? (
        <>
          <div className="pdf-upload-card">
            <div className="pdf-upload-icon"><Icon name="fileText" size={22} /></div>
            <div className="pdf-upload-copy">
              <h2>Choose a PDF (up to 30 pages)</h2>
              <p>Text is extracted in your browser. Scanned/image-only PDFs need OCR, which isn’t supported yet.</p>
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
              {loading ? "Working…" : fileName ? "Choose another PDF" : "Choose PDF"}
            </label>
          </div>
          {fileName && <div className="pdf-file-status">{fileName}{pageCount > 0 && ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}</div>}
        </>
      ) : (
        <form className="ai-guide-text-form" onSubmit={handleTextSubmit}>
          <label htmlFor="ai-guide-text">Paste or type your study material</label>
          <textarea
            id="ai-guide-text"
            className="pdf-text-output ai-guide-text-input"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
              setCopyMessage("");
              setRetryAvailable(false);
            }}
            placeholder="Paste your notes, reading material, or lecture transcript here…"
            spellCheck="false"
            disabled={loading}
          />
          <div className="ai-guide-text-footer">
            <span>There’s no app-set character limit. Gemini has a maximum context size; very long text may be rejected.</span>
            <button className="button button-primary" type="submit" disabled={!text.trim() || loading}>
              <Icon name="spark" size={16} /> Generate study materials
            </button>
          </div>
        </form>
      )}

      {text && error && retryAvailable && !loading && (
        <button className="button pdf-copy-button pdf-retry-button" onClick={() => generateStudyMaterials(text.trim(), fileName || "Pasted text")}>
          Try generating again
        </button>
      )}
      {loading && <div className="pdf-conversion-status" role="status"><span className="loader" /> {processingLabel}</div>}
      {error && <p className="pdf-conversion-error" role="alert">{error}</p>}

      {inputMode === "pdf" && (
        <>
          <div className="pdf-result-heading">
            <div>
              <h2>Extracted text</h2>
              <p>{text ? "Review and copy the text below." : "Extracted PDF text will appear here."}</p>
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
        </>
      )}
      {inputMode === "text" && copyMessage && <span className="pdf-copy-status" role="status">{copyMessage}</span>}
    </section>
  );
}
