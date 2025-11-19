'use client';

import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function FileUpload({ onLinksExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      processFile(file);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let links = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();
        
        const pageLinks = annotations
          .filter(annotation => annotation.url)
          .map(annotation => ({
            url: annotation.url,
            page: i
          }));
          
        links = [...links, ...pageLinks];
      }

      // Remove duplicates
      const uniqueLinks = Array.from(new Set(links.map(l => l.url)))
        .map(url => links.find(l => l.url === url));

      onLinksExtracted(uniqueLinks);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Failed to parse PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div
        className={`glass-card relative border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center cursor-pointer
          ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-primary/50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".pdf"
          onChange={handleFileSelect}
        />
        
        <div className="mb-4 text-6xl">📄</div>
        
        <h3 className="text-xl font-bold mb-2">
          {isLoading ? 'Scanning PDF...' : 'Drop your PDF here'}
        </h3>
        
        <p className="text-gray-400 mb-6">
          {isLoading ? 'Extracting links, please wait.' : 'or click to browse files'}
        </p>

        {error && (
          <div className="text-error mt-4 p-3 bg-error/10 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
