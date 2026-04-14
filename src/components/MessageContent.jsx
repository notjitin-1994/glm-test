import React from 'react';
import { containsOpenUILang, shouldDisplayAsMarkdown, formatAIResponse } from '../utils/text-formatter';
import './MessageContent.css';

export default function MessageContent({ content, role }) {
  // Plain text or markdown — NOT OpenUI Lang (that's handled by GenerativeUI)
  if (shouldDisplayAsMarkdown(content)) {
    return <MarkdownDisplay content={content} />;
  }
  return <PlainTextDisplay content={content} />;
}

function PlainTextDisplay({ content }) {
  const formatted = formatAIResponse(content);
  return (
    <div className="plain-text-display">
      {formatted.split('\n\n').map((paragraph, idx) => (
        paragraph.trim() && (
          <p key={idx} className="mb-4">
            {paragraph}
          </p>
        )
      ))}
    </div>
  );
}

function MarkdownDisplay({ content }) {
  const formatted = formatAIResponse(content);
  return (
    <div className="markdown-display">
      {formatted.split('\n').map((line, idx) => {
        if (line.startsWith('```')) return null;

        if (line.includes('http')) {
          const linkMatch = line.match(/(https?:\/\/[^\s]+)/);
          if (linkMatch) {
            const url = linkMatch[1];
            const text = line.replace(url, '').trim() || url;
            return (
              <p key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="link-text">
                  {text}
                </a>
              </p>
            );
          }
        }

        if (line.trim()) {
          return <p key={idx}>{line}</p>;
        }
        return null;
      })}
    </div>
  );
}
