import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import { saveAs } from 'file-saver';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: '/sample.pdf';
}

const PDFViewer: React.FC<PDFViewerProps> = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/sample.pdf');
      const blob = await response.blob();
      saveAs(blob, 'downloadedFile.pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div style={{display: "flex", justifyContent: "center"}}>
      <div style={{width: "700px", border: "3px solid gray"}}>
        <Document className="custom-document" file="/sample.pdf" onLoadSuccess={onDocumentLoadSuccess}>
          {Array(numPages)
            .fill()
            .map((_, i) => (
              <Page key={i + 1} pageNumber={i + 1} />
            ))}
        </Document>
      </div>
      <button onClick={handleDownload}>Download PDF</button>
    </div>
  );
};

export default PDFViewer;
