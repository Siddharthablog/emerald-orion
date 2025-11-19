'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ResultsTable from '@/components/ResultsTable';

const FileUpload = dynamic(() => import('@/components/FileUpload'), { ssr: false });

export default function Home() {
  const [links, setLinks] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  const handleLinksExtracted = async (extractedLinks) => {
    setLinks(extractedLinks);
    setIsChecking(true);

    // Chunk requests to avoid overwhelming the server or getting rate limited
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < extractedLinks.length; i += chunkSize) {
      chunks.push(extractedLinks.slice(i, i + chunkSize));
    }

    let updatedLinks = [...extractedLinks];

    for (const chunk of chunks) {
      try {
        const response = await fetch('/api/check-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: chunk.map(l => l.url) }),
        });

        if (response.ok) {
          const data = await response.json();

          // Update links with status
          updatedLinks = updatedLinks.map(link => {
            const result = data.results.find(r => r.url === link.url);
            if (result) {
              return { ...link, status: result.status };
            }
            return link;
          });

          setLinks([...updatedLinks]); // Trigger re-render with partial results
        }
      } catch (error) {
        console.error('Error checking links:', error);
      }
    }

    setIsChecking(false);
  };

  return (
    <main className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
      <div className="container">
        <header className="mb-16 animate-fade-in">
          <h1 className="title-gradient">PDF Link Checker</h1>
          <p className="subtitle">
            Upload your PDF to automatically extract and verify all hyperlinks.
          </p>
        </header>

        <FileUpload onLinksExtracted={handleLinksExtracted} />

        <ResultsTable links={links} />

        {isChecking && (
          <div className="text-center mt-8 text-gray-400 animate-pulse">
            Checking link statuses...
          </div>
        )}
      </div>
    </main>
  );
}
