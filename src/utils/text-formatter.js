/**
 * Text Formatter - Detects OpenUI Lang and cleans plain text
 */

/**
 * Detect actual OpenUI Lang code.
 * OpenUI Lang uses reference-style assignments: name = Component(args...)
 * We only match lines that start with a lowercase identifier = ComponentName(
 */
export function containsOpenUILang(text) {
  if (!text) return false;
  const lines = text.split('\n');
  // Need at least one root assignment like: root = Card([...]) or title = TextContent(...)
  const hasAssignment = lines.some(line =>
    /^[a-z][a-zA-Z0-9_]*\s*=\s*[A-Z][a-zA-Z]*\(/.test(line.trim())
  );
  return hasAssignment;
}

export function formatAIResponse(text) {
  if (!text) return '';

  let formatted = text;

  // Remove markdown headings
  formatted = formatted.replace(/^#+\s+/gm, '');

  // Remove bold/italic markdown
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');
  formatted = formatted.replace(/\*([^*]+)\*/g, '$1');

  // Remove code fences
  formatted = formatted.replace(/```[\s\S]*?\n/g, '');
  formatted = formatted.replace(/```/g, '');

  // Remove inline code
  formatted = formatted.replace(/`([^`]+)`/g, '$1');

  // Remove bullet points and numbering
  formatted = formatted.replace(/^[\s]*[-*+]\s+/gm, '');
  formatted = formatted.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquotes
  formatted = formatted.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  formatted = formatted.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove AI filler phrases
  const fillerPhrases = [
    'Certainly!',
    'Great question!',
    "I'd be happy to help",
    "Here's what you need:",
    "Let me think about this",
    "Sure thing!",
    "Here's the answer:",
  ];
  fillerPhrases.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    formatted = formatted.replace(regex, '');
  });

  // Clean up whitespace
  formatted = formatted.replace(/[ \t]+/g, ' ');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');

  return formatted.trim();
}

export function shouldDisplayAsMarkdown(text) {
  return (
    /```/.test(text) ||
    /\[.+\]\(.+\)/.test(text) ||
    /\|.*\|/.test(text) ||
    /https?:\/\/[^\s]+/.test(text)
  );
}
