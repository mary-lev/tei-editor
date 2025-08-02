# Context-Aware Floating Toolbar Logic

## Current Problem
The floating toolbar shows all available operations regardless of what the user has selected, leading to confusion and inappropriate actions (e.g., showing "Merge" when only one line is selected).

## Solution: Context-Aware Operation Display

### Selection Detection Logic
```javascript
function getSelectionContext(selection, selectedStanzas) {
  // Priority order: checkbox selections > text selections > no selection
  
  if (selectedStanzas.length > 1) {
    return { type: 'multiple-stanzas', count: selectedStanzas.length }
  }
  
  if (selectedStanzas.length === 1) {
    return { type: 'single-stanza', id: selectedStanzas[0] }
  }
  
  if (selection && selection.text) {
    const context = analyzeTextSelection(selection)
    return context // { type: 'lines', count: X } or { type: 'text' }
  }
  
  return { type: 'none' }
}

function analyzeTextSelection(selection) {
  // Determine if selection spans lines, stanzas, or is just text
  const selectedElements = getSelectedElements(selection.range)
  
  if (selectedElements.lines.length > 1) {
    return { type: 'multiple-lines', count: selectedElements.lines.length }
  }
  
  if (selectedElements.lines.length === 1) {
    return { type: 'single-line', id: selectedElements.lines[0].id }
  }
  
  return { type: 'text', content: selection.text }
}
```

### Operation Mapping by Context

| Context | Available Operations | Reasoning |
|---------|---------------------|-----------|
| **Multiple Stanzas** (2+) | • Merge Stanzas<br>• Delete Elements<br>• Reorder (future) | Can only merge 2+ stanzas, deletion makes sense |
| **Single Stanza** | • Delete Element<br>• Split Stanza (future)<br>• Add Line (future) | Can't merge one item, but can delete or modify |
| **Multiple Lines** (2+) | • Create Stanza<br>• Delete Elements | Multiple lines can form a stanza |
| **Single Line** | • Change to Heading<br>• Change to Dedication<br>• Delete Element<br>• Split Line (future) | Line type conversion, no merging possible |
| **Text Selection** | • Create Line<br>• Create Heading<br>• Create Dedication | Convert raw text to TEI elements |
| **No Selection** | *(Hide toolbar)* | Nothing to operate on |

### Implementation Plan

#### Phase 1: Basic Context Detection
```javascript
// In FloatingToolbar component
const getAvailableOperations = (context) => {
  switch (context.type) {
    case 'multiple-stanzas':
      return ['merge-stanzas', 'delete-element']
    
    case 'single-stanza':
      return ['delete-element']
    
    case 'multiple-lines':
      return ['create-stanza', 'delete-element']
    
    case 'single-line':
      return ['change-to-heading', 'change-to-dedication', 'delete-element']
    
    case 'text':
      return ['create-line', 'create-heading', 'create-dedication']
    
    default:
      return [] // Hide toolbar
  }
}
```

#### Phase 2: Enhanced Context Information
- Show selection count in toolbar header
- Display context-specific instructions
- Preview operation effects before applying

#### Phase 3: Advanced Context Features
- Smart operation suggestions based on content
- Multi-step operation guidance
- Context-sensitive keyboard shortcuts

### User Experience Improvements

#### Visual Feedback
```jsx
// Toolbar header shows context
<div className="toolbar-header">
  {context.type === 'multiple-stanzas' && 
    `${context.count} stanzas selected`}
  {context.type === 'single-line' && 
    'Line selected'}
  {context.type === 'text' && 
    `"${context.content.substring(0, 20)}..." selected`}
</div>
```

#### Operation Descriptions
```jsx
// Show what each operation will do
<button onClick={() => handleOperation('merge-stanzas')}>
  Merge Stanzas
  <span className="operation-hint">
    Combine {context.count} stanzas into one
  </span>
</button>
```

### Implementation Priority

#### Immediate (Phase 3A)
1. ✅ **Detection Logic**: Implement `getSelectionContext()`
2. ✅ **Operation Filtering**: Show only relevant operations  
3. ✅ **Visual Context**: Display selection type and count

#### Next Sprint (Phase 3B)
1. **Enhanced Descriptions**: Show operation previews
2. **Smart Suggestions**: Context-based operation recommendations
3. **Keyboard Shortcuts**: Context-aware hotkeys

#### Future (Phase 3C+)
1. **Multi-step Operations**: Guided workflows for complex edits
2. **Operation History**: Context-aware undo/redo
3. **Batch Operations**: Apply operations to multiple selections

### Technical Considerations

#### Performance
- Cache selection analysis to avoid re-computation
- Debounce context changes to prevent UI flickering
- Lazy load operation components

#### Accessibility
- Screen reader announcements for context changes
- Keyboard navigation within contextual operations
- High contrast indicators for operation availability

#### Error Prevention
- Disable invalid operations instead of hiding them
- Show why operations are disabled
- Confirm destructive operations with context info

### Testing Strategy

#### Unit Tests
- Selection context detection accuracy
- Operation filtering correctness
- Edge cases (empty selections, malformed TEI)

#### User Experience Tests
- Intuitive operation discovery
- Reduced accidental operations
- Faster workflow completion

#### Integration Tests
- Context preservation during TEI operations
- Toolbar state consistency across page navigation
- Multi-selection handling