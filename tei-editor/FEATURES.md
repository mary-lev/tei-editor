# TEI Poetry Editor - Feature Overview

## 🎯 Context-Aware Editing System

### Smart Toolbar Adaptation
The floating toolbar dynamically changes based on the type of content selected:

| Selection Type | Available Operations | Use Case |
|----------------|---------------------|----------|
| **Single Line** | Title, Subtitle, Epigraph, Dedication, Delete | Convert any line-like element to different semantic types |
| **Multiple Lines** | Create Stanza, Delete | Group loose lines into structured stanzas |
| **Single Stanza** | Split, Delete | Divide large stanzas or remove individual stanzas |
| **Multiple Stanzas** | Merge, Delete | Combine stanzas or bulk delete operations |
| **Free Text** | Create Line, Create Heading | Convert unstructured text to TEI elements |

### Intelligent Content Detection
- **Line-like elements**: Detects `<l>`, `<head>`, `<dedication>`, `<epigraph>` elements
- **Hierarchical awareness**: Understands stanza/poem/division structure
- **Cross-element selection**: Works across different TEI element types
- **Mixed content handling**: Processes complex nested structures

## 📄 Complete Document Structure Support

### TEI Document Sections
```
TEI Document
├── TEI Header (metadata, encoding info, revision history)
├── Front Matter (title pages, tables of contents, prefaces)
├── Body Content (poems, prose, main text)
└── Back Matter (appendices, indices, notes)
```

### Page Reference Systems
- **Page breaks**: Traditional `<pb n="9"/>` elements
- **Facsimile links**: `<titlePage facs="#page_5">` references
- **Mixed numbering**: Handles gaps, non-sequential pages, and different numbering systems
- **Empty pages**: Visual placeholders for manuscript gaps

### Front Matter Elements
| Element | Purpose | Rendering |
|---------|---------|-----------|
| `<titlePage>` | Book title page | Centered, bordered container |
| `<docTitle>` | Main title group | Grouped title parts |
| `<titlePart>` | Individual title components | Large, bold text |
| `<docImprint>` | Publication information | Smaller, italic text |
| `<publisher>` | Publisher details | Standard paragraph text |

## 🔄 Three-Pane Synchronization

### Synchronized Navigation
- **Universal page numbers**: Works across all document sections
- **Proportional scrolling**: Maintains relative position across panes
- **Cross-reference linking**: Click any page reference to navigate
- **Keyboard navigation**: Arrow keys for sequential browsing

### Scroll Detection Algorithm
```javascript
// Enhanced scroll detection with multiple thresholds
if (detectedPage !== currentPage && 
    maxVisibleArea > containerHeight * 0.4 && 
    maxVisibleArea > 100) {
  setCurrentPage(detectedPage)
  scrollToPageBlock(detectedPage, initiatingPane)
}
```

### Page Mapping System
Each page maintains multiple position references:
- **Text position**: Scroll offset in rendered text pane
- **Image position**: Scroll offset in manuscript image pane  
- **TEI position**: Line number in XML source code
- **Content flags**: Indicates presence of text/image content

## 🎨 Advanced Text Selection

### Selection Stability Features
- **UI element isolation**: Line numbers, checkboxes, and controls don't interfere
- **Debounced clearing**: Prevents accidental selection loss
- **Toolbar preservation**: Maintains selection during menu interactions
- **Cross-element spanning**: Selections can cross element boundaries

### Selection States
```javascript
const selectionStates = {
  isSelecting: false,        // Currently making selection
  selection: null,           // Current selection data
  preserveSelection: false,  // Toolbar interaction mode
  selectedStanzas: []        // Checkbox-based selections
}
```

## 🔧 TEI Operations Engine

### Transformation Operations
- **Element conversion**: Change semantic meaning while preserving content
- **Structural operations**: Merge, split, group, and ungroup elements
- **Bulk operations**: Apply changes to multiple elements simultaneously
- **Undo/redo support**: Full operation history tracking

### XML Manipulation
```javascript
// Example: Convert line to title
const convertLineToTitle = (lineElement) => {
  const titleElement = document.createElement('head')
  titleElement.textContent = lineElement.textContent
  titleElement.setAttribute('type', 'main')
  lineElement.parentNode.replaceChild(titleElement, lineElement)
}
```

## 📱 Responsive Design System

### Layout Adaptation
- **Three-pane layout**: Configurable pane visibility and sizing
- **Mobile optimization**: Stacked layout on smaller screens
- **Flexible sizing**: Draggable pane dividers for custom layouts
- **High-DPI support**: Crisp rendering on retina displays

### Visual Hierarchy
```css
/* Content type styling */
.front-matter { @apply bg-slate-50 border-amber-200; }
.poem         { @apply bg-gray-50 border-gray-200; }
.title-page   { @apply bg-white border-amber-200; }
.empty-page   { @apply bg-gray-50 border-gray-200; }
```

## 🚀 Performance Optimizations

### Rendering Performance
- **Virtual scrolling**: Handles documents with hundreds of pages
- **Lazy image loading**: Images load only when needed
- **Component memoization**: Prevents unnecessary re-renders
- **Debounced operations**: Smooth scrolling and typing experience

### Memory Management
- **Page mapping cache**: Computed positions cached for reuse  
- **Image cleanup**: Automatic cleanup of off-screen images
- **Event cleanup**: Proper cleanup of scroll and selection listeners
- **Memory-efficient DOM**: Minimal DOM manipulation for large documents

### Network Optimization
- **Progressive loading**: Content loads in chunks as needed
- **Image compression**: Optimized manuscript images
- **Cached resources**: Browser caching for static assets
- **CDN integration**: Fast content delivery for sample documents

## 🎓 Educational Integration

### Learning Workflows
1. **Text exploration**: Browse manuscript with aligned transcription
2. **Encoding practice**: Edit TEI markup with immediate visual feedback  
3. **Comparative analysis**: Side-by-side manuscript and text study
4. **Quality assurance**: Visual verification of encoding accuracy

### Pedagogical Features
- **Visual TEI structure**: Color-coded elements in rendered view
- **Real-time validation**: Immediate feedback on TEI compliance
- **Export options**: Generate clean TEI for submission or publication
- **Collaborative features**: Multiple users can work on same document

## 🔍 Advanced Search & Navigation

### Search Capabilities
- **Full-text search**: Search across all document content
- **Element search**: Find specific TEI elements by type
- **Attribute search**: Search by attribute values
- **Regular expressions**: Advanced pattern matching

### Navigation Features
- **Table of contents**: Auto-generated from document structure  
- **Page thumbnails**: Visual page browser
- **Bookmark system**: Save and return to specific locations
- **History tracking**: Navigate through recent positions

## 🛠️ Developer Features

### Extension Points
- **Custom elements**: Add support for new TEI elements
- **Custom operations**: Define new editing operations
- **Theme customization**: Modify visual appearance
- **Export formats**: Add new output formats

### API Integration
- **RESTful endpoints**: Full CRUD operations on documents
- **WebSocket support**: Real-time collaborative editing
- **Authentication**: User management and access control
- **Version control**: Git integration for change tracking

---

*The TEI Poetry Editor represents a comprehensive solution for digital manuscript editing, combining sophisticated technical capabilities with intuitive user experience design for the digital humanities community.*