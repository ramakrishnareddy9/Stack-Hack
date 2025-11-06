// hooks/usePdfParser.js
import { useState } from 'react';
import * as pdfParseModule from 'pdf-parse';

// Helper: normalize different export shapes of `pdf-parse` (CommonJS default, named, or class)
const _parsePdfBuffer = async (pdfModule, pdfData) => {
  const parser = pdfModule.default ?? pdfModule.PDFParse ?? pdfModule;

  // If parser is a constructor/class with .parse()
  if (typeof parser === 'function' && parser.prototype && typeof parser.prototype.parse === 'function') {
    const instance = new parser(pdfData);
    if (typeof instance.parse === 'function') {
      const result = await instance.parse();
      return result;
    }
  }

  // If parser is a callable function
  if (typeof parser === 'function') {
    return await parser(pdfData);
  }

  throw new Error('Unsupported pdf-parse export shape');
};

export const usePdfParser = () => {
  const [parsing, setParsing] = useState(false);

  const parsePdf = async (file) => {
    setParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdf = await _parsePdfBuffer(pdfParseModule, pdfData);
      return pdf.text;
    } catch (error) {
      throw new Error('Failed to parse PDF: ' + (error?.message || error));
    } finally {
      setParsing(false);
    }
  };

  return { parsePdf, parsing };
};