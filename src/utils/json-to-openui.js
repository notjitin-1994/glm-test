/**
 * Converts GLM's JSON/structured output into OpenUI Lang syntax
 * that the @openuidev/react-lang Renderer can actually parse.
 */

/**
 * Try to extract a JSON object from GLM's response (may be wrapped in ```json blocks)
 */
function extractJSON(text) {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Try extracting from code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {}
  }

  return null;
}

/**
 * Detect if GLM output is structured data that should be rendered as UI
 */
export function isStructuredResponse(text) {
  if (!text) return false;

  // Contains a JSON code block
  if (/```json\s*\n?[\s\S]*?\n?```/.test(text)) return true;

  // Starts with { or [ (raw JSON)
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return true;

  // Contains a table-like structure
  if (/\|.*\|.*\|/.test(text) && /\n.*\|.*\|.*\|/.test(text)) return true;

  return false;
}

/**
 * Convert GLM's structured output to OpenUI Lang
 */
export function convertToOpenUILang(text) {
  const json = extractJSON(text);

  if (json) {
    return jsonToOpenUI(json);
  }

  // Try markdown table conversion
  const tableMatch = text.match(/(\|.+\|[\n\r]+\|[-:\s|]+\|[\n\r]+((?:\|.+\|[\n\r]*)+))/);
  if (tableMatch) {
    return markdownTableToOpenUI(tableMatch[1]);
  }

  return null;
}

function jsonToOpenUI(json) {
  // Array of objects → Table
  if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') {
    return jsonArrayToTable(json);
  }

  // Object with "type" field (GLM's component format)
  if (json.type) {
    switch (json.type?.toLowerCase()) {
      case 'table':
        return jsonTableComponentToOpenUI(json);
      case 'form':
        return jsonFormToOpenUI(json);
      case 'chart':
      case 'barchart':
        return jsonChartToOpenUI(json);
      case 'card':
        return jsonCardToOpenUI(json);
      case 'list':
        return jsonListToOpenUI(json);
    }
  }

  // Object with columns + rows → Table
  if (json.columns && json.rows) {
    return jsonTableComponentToOpenUI(json);
  }

  // Object with fields → Form
  if (json.fields) {
    return jsonFormToOpenUI(json);
  }

  // Object with items → List
  if (json.items || json.data) {
    const items = json.items || json.data;
    if (Array.isArray(items)) {
      return jsonArrayToTable(items);
    }
  }

  // Generic object → Card with key-value table
  return jsonObjectToCard(json);
}

function jsonArrayToTable(arr) {
  if (!arr.length) return null;

  const keys = Object.keys(arr[0]);
  const colRefs = keys.map((k, i) => `col${i}`);
  const dataRefs = keys.map((k, i) => `data${i}`);

  let lines = ['root = Card([title, tbl, followUps])'];
  lines.push(`title = TextContent("Data Table", "large-heavy")`);

  // Build table columns
  const colArgs = keys.map((k, i) => `Col("${k}", ${dataRefs[i]})`).join(', ');
  lines.push(`tbl = Table([${colArgs}])`);

  // Build data arrays
  keys.forEach((k, i) => {
    const values = arr.map(row => {
      const val = row[k];
      return typeof val === 'number' ? val : `"${String(val).replace(/"/g, '\\"')}"`;
    }).join(', ');
    lines.push(`data${i} = [${values}]`);
  });

  lines.push('followUps = FollowUpBlock([fu1])');
  lines.push('fu1 = FollowUpItem("Tell me more")');

  return lines.join('\n');
}

function jsonTableComponentToOpenUI(json) {
  let columns, rows;

  if (json.columns && json.rows) {
    // Format: { columns: [{header, key}], rows: [{key: val}] }
    if (typeof json.columns[0] === 'object') {
      columns = json.columns.map(c => c.header || c.key || c.label || String(c));
      rows = json.rows;
    } else {
      columns = json.columns;
      rows = json.rows;
    }
  } else if (json.headers && json.data) {
    columns = json.headers;
    rows = json.data;
  } else {
    return null;
  }

  if (!Array.isArray(rows) || rows.length === 0) return null;

  // Normalize rows to arrays
  const normalizedRows = rows.map(row => {
    if (Array.isArray(row)) return row;
    if (typeof row === 'object') {
      return columns.map(col => {
        const key = typeof json.columns?.[0] === 'object'
          ? json.columns.find(c => c.header === col)?.key || col
          : col;
        return row[key] ?? row[col] ?? '';
      });
    }
    return [row];
  });

  let lines = ['root = Card([title, tbl, followUps])'];
  lines.push(`title = TextContent("${json.title || "Data Table"}", "large-heavy")`);

  const colRefs = columns.map((_, i) => `colData${i}`);
  const colArgs = columns.map((col, i) => `Col("${col}", ${colRefs[i]})`).join(', ');
  lines.push(`tbl = Table([${colArgs}])`);

  columns.forEach((_, i) => {
    const values = normalizedRows.map(row => {
      const val = row[i];
      return typeof val === 'number' ? val : `"${String(val).replace(/"/g, '\\"')}"`;
    }).join(', ');
    lines.push(`colData${i} = [${values}]`);
  });

  lines.push('followUps = FollowUpBlock([fu1])');
  lines.push('fu1 = FollowUpItem("Tell me more about this data")');

  return lines.join('\n');
}

function jsonFormToOpenUI(json) {
  const fields = json.fields || {};
  const fieldNames = Object.keys(fields);

  let lines = ['root = Card([title, form])'];
  lines.push(`title = TextContent("${json.title || "Form"}", "large-heavy")`);

  const controls = fieldNames.map((name, i) => {
    const field = fields[name];
    const fType = (field.type || 'text').toLowerCase();
    const label = field.label || name;
    const required = field.required ? ', { required: true }' : '';

    if (fType === 'textarea') {
      return `field${i} = FormControl("${label}", TextArea("${name}", "${field.placeholder || ''}", ${field.rows || 3}${required}))`;
    }
    if (fType === 'select') {
      return `field${i} = FormControl("${label}", Input("${name}", "${field.placeholder || ''}", "text"${required}))`;
    }
    return `field${i} = FormControl("${label}", Input("${name}", "${field.placeholder || ''}", "${fType}"${required}))`;
  });

  lines.push(`form = Form("${json.title || 'form'}", btns, [${controls.map((_, i) => `field${i}`).join(', ')}])`);
  lines.push('btns = Buttons([Button("Submit", Action([@ToAssistant("Submit")]), "primary")])');

  return lines.join('\n');
}

function jsonChartToOpenUI(json) {
  const data = json.data || json.values || [];
  if (!data.length) return null;

  let lines = ['root = Card([title, chart, followUps])'];
  lines.push(`title = TextContent("${json.title || "Chart"}", "large-heavy")`);

  const labels = data.map(d => `"${d.label || d.name || d.category || ""}"`).join(', ');
  const values = data.map(d => d.value || d.amount || d.count || 0);

  lines.push(`chart = BarChart(labels, [series1], "grouped"${json.xLabel ? `, xLabel: "${json.xLabel}"` : ''}${json.yLabel ? `, yLabel: "${json.yLabel}"` : ''})`);
  lines.push(`labels = [${labels}]`);
  lines.push(`series1 = Series("Value", [${values.join(', ')}])`);

  lines.push('followUps = FollowUpBlock([fu1])');
  lines.push('fu1 = FollowUpItem("Show different chart type")');

  return lines.join('\n');
}

function jsonListToOpenUI(json) {
  const items = json.items || [];
  if (!items.length) return null;

  let lines = ['root = Card([title, list, followUps])'];
  lines.push(`title = TextContent("${json.title || "List"}", "large-heavy")`);

  items.forEach((item, i) => {
    const label = typeof item === 'string' ? item : (item.label || item.title || item.name || '');
    const desc = typeof item === 'string' ? '' : (item.description || item.desc || item.body || '');
    lines.push(`item${i} = ListItem("${label}", "${desc.replace(/"/g, '\\"')}")`);
  });

  lines.push(`list = ListBlock([${items.map((_, i) => `item${i}`).join(', ')}])`);
  lines.push('followUps = FollowUpBlock([fu1])');
  lines.push('fu1 = FollowUpItem("Show more details")');

  return lines.join('\n');
}

function jsonCardToOpenUI(json) {
  let lines = ['root = Card([title, content])'];
  lines.push(`title = TextContent("${json.title || "Info"}", "large-heavy")`);
  lines.push(`content = TextContent("${(json.body || json.content || json.description || JSON.stringify(json)).replace(/"/g, '\\"').substring(0, 200)}")`);
  return lines.join('\n');
}

function jsonObjectToCard(json) {
  const keys = Object.keys(json).slice(0, 10);
  if (keys.length === 0) return null;

  // If all values are primitives, make a key-value table
  const allPrimitive = keys.every(k => typeof json[k] !== 'object');
  if (allPrimitive) {
    let lines = ['root = Card([title, tbl])'];
    lines.push('title = TextContent("Details", "large-heavy")');
    lines.push('tbl = Table([col1, col2])');
    const keysStr = keys.map(k => `"${k}"`).join(', ');
    const valsStr = keys.map(k => {
      const v = json[k];
      return typeof v === 'number' ? v : `"${String(v).replace(/"/g, '\\"')}"`;
    }).join(', ');
    lines.push(`col1 = Col("Property", propKeys)`);
    lines.push(`col2 = Col("Value", propVals)`);
    lines.push(`propKeys = [${keysStr}]`);
    lines.push(`propVals = [${valsStr}]`);
    return lines.join('\n');
  }

  return null;
}

function markdownTableToOpenUI(tableText) {
  const lines = tableText.trim().split('\n').filter(l => l.trim());
  if (lines.length < 3) return null;

  const headers = lines[0].split('|').map(s => s.trim()).filter(Boolean);
  const rows = lines.slice(2).map(l => l.split('|').map(s => s.trim()).filter(Boolean));

  let result = ['root = Card([title, tbl, followUps])'];
  result.push(`title = TextContent("Data Table", "large-heavy")`);

  const colRefs = headers.map((_, i) => `colData${i}`);
  const colArgs = headers.map((h, i) => `Col("${h}", ${colRefs[i]})`).join(', ');
  result.push(`tbl = Table([${colArgs}])`);

  headers.forEach((_, i) => {
    const values = rows.map(row => {
      const val = row[i] || '';
      return `"${val.replace(/"/g, '\\"')}"`;
    }).join(', ');
    result.push(`colData${i} = [${values}]`);
  });

  result.push('followUps = FollowUpBlock([fu1])');
  result.push('fu1 = FollowUpItem("Tell me more")');

  return result.join('\n');
}
