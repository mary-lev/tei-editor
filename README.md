# TEI Poetry Editor

A modern web-based editor for TEI (Text Encoding Initiative) XML documents containing Russian poetry manuscripts with pre-revolutionary orthography. This tool helps scholars review, correct, and enhance automatically generated TEI markup through an intuitive three-pane interface.

## 🎯 Project Goals

- **Scholarly Workflow**: Streamline the process of reviewing and editing TEI-encoded poetry manuscripts
- **Visual Alignment**: Synchronize manuscript images with structured text for accurate transcription verification
- **TEI Compliance**: Maintain strict TEI P5 standards while enabling intuitive editing operations
- **Accessibility**: Provide a user-friendly interface for scholars without extensive XML knowledge

## ✨ Key Features

### Three-Pane Interface
- **Image Pane**: High-resolution manuscript page display with zoom and navigation
- **Rendered Text Pane**: Formatted poetry view with proper stanza and line structure
- **TEI Code Pane**: Live XML editing with syntax highlighting (toggleable)

### Intelligent Editing
- **Selection-Based Operations**: Floating toolbar appears based on text selection
- **Structural Editing**: Create, merge, split, and reorder poems, parts, stanzas, and lines
- **Auto-Numbering**: Automatic renumbering of elements after structural changes
- **Page Synchronization**: Coordinated scrolling between all three panes

### Document Management
- **File Upload**: Support for TEI P5 XML documents
- **Sample Documents**: Pre-loaded examples for testing and demonstration
- **Export Functionality**: Download modified TEI files with preserved structure
- **Validation**: Real-time TEI structure validation

### Multi-Page Support
- **Page Navigation**: Smooth transitions between manuscript pages
- **Cross-Page Content**: Handle poems and stanzas spanning multiple pages
- **Page Boundaries**: Proper handling of `<pb>` (page break) elements

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18**: Component-based UI with hooks
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first styling with custom design system
- **CodeMirror**: Advanced XML editing with syntax highlighting

### Design Principles
- **Single-File Application**: No server dependencies, runs entirely in browser
- **Offline Capable**: Client-side processing for secure document handling
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Handles documents with 50+ pages efficiently

### TEI Structure Support
- **Simple Poems**: Direct stanzas within poem containers
- **Multi-Part Poems**: Complex compositions with numbered parts (I, II, III)
- **Metadata Elements**: Headings, dedications, notes, and bibliographic information
- **Hierarchical Editing**: Poem → Part → Stanza → Line structure

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd tei-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
tei-editor/
├── src/
│   ├── components/          # React components
│   │   ├── FileLoader.jsx   # Document loading interface
│   │   ├── ThreePaneLayout.jsx
│   │   ├── ImagePane.jsx
│   │   ├── RenderedTextPane.jsx
│   │   ├── TEICodePane.jsx
│   │   └── FloatingToolbar.jsx
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # TEI processing utilities
│   └── App.jsx             # Main application
├── public/                 # Static assets and sample files
└── CLAUDE.md              # Development documentation
```

## 🎨 Design System

### Modern Minimalist Aesthetic
- **Color Palette**: Monochromatic grays with deep teal accent (#0f766e)
- **Typography**: Light font weights with careful spacing and hierarchy
- **Layout**: Clean borders, generous whitespace, content-focused design
- **Interactions**: Subtle transitions and hover states

### User Interface
- **Cards-Based Loading**: Clean upload and sample selection interface
- **Contextual Toolbars**: Selection-aware editing operations
- **Synchronized Navigation**: Coordinated pane scrolling and page transitions
- **Status Indicators**: Real-time feedback for operations and validation

## 📖 Usage Guide

### Loading Documents
1. **Upload TEI File**: Click "Browse Files" to select your TEI XML document
2. **Try Samples**: Choose from pre-loaded Russian poetry examples
3. **Automatic Processing**: Document structure is parsed and displayed across three panes

### Editing Operations
1. **Select Text**: Click and drag to select content in the rendered text pane
2. **Use Toolbar**: Choose from context-appropriate editing options
3. **Structural Changes**: Create stanzas, merge lines, reorder elements
4. **Live Preview**: See changes immediately in all panes

### Navigation
- **Page Controls**: Use Previous/Next buttons or direct page jumping
- **Synchronized Scrolling**: All panes stay aligned during navigation
- **Search and Find**: Locate specific content across the document

### Export
- **Download Modified TEI**: Export your edited document as valid TEI P5 XML
- **Preserve Structure**: Maintain all original TEI elements and attributes
- **Validation Check**: Ensure document integrity before export

## 🔧 Configuration

### Sample Documents
Add new sample documents by updating `/public/samples/index.json`:
```json
{
  "samples": [
    {
      "id": "doc_example",
      "title": "Document Title",
      "author": "Author Name",
      "xmlPath": "path/to/document.xml",
      "totalPages": 10,
      "description": "Brief description"
    }
  ]
}
```

### Development Settings
- **Port Configuration**: Default development server runs on port 5173
- **Build Output**: Single HTML file generated in `dist/` directory
- **Asset Handling**: Static files served from `public/` directory

## 🤝 Contributing

This project follows modern React development practices:
- Component-based architecture with clear separation of concerns
- Comprehensive documentation in `CLAUDE.md`
- Modular utility functions for TEI processing
- Responsive design with mobile-first approach

## 📜 TEI Standards

Compliant with TEI P5 guidelines:
- Proper XML namespace handling
- Standard element hierarchy (TEI → text → body → div)
- Facsimile linking for manuscript images
- Preservation of editorial markup and metadata

## 🔗 Related Resources

- [TEI Guidelines](https://tei-c.org/guidelines/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Note**: This application is designed specifically for scholarly work with TEI-encoded poetry manuscripts. It prioritizes accuracy, standards compliance, and user experience for academic research workflows.