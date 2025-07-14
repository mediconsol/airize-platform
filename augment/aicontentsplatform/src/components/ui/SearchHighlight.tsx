'use client';

import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export default function SearchHighlight({ text, searchQuery, className = '' }: SearchHighlightProps) {
  if (!searchQuery || !text) {
    return <span className={className}>{text}</span>;
  }

  const query = searchQuery.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (!lowerText.includes(query)) {
    return <span className={className}>{text}</span>;
  }

  const parts = [];
  let lastIndex = 0;
  let index = lowerText.indexOf(query);

  while (index !== -1) {
    // 매칭 전 텍스트 추가
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    
    // 하이라이트된 텍스트 추가
    parts.push(
      <mark 
        key={`highlight-${index}`}
        className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded"
      >
        {text.slice(index, index + query.length)}
      </mark>
    );
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(query, lastIndex);
  }

  // 마지막 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
