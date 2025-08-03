# TEI Poetry Editor 📚✨

A sophisticated web-based editor for TEI (Text Encoding Initiative) encoded poetry manuscripts, featuring synchronized three-pane editing, context-aware tools, and comprehensive document support.

![TEI Poetry Editor](https://img.shields.io/badge/Status-Production_Ready-green) ![React](https://img.shields.io/badge/React-18.0+-blue) ![TEI](https://img.shields.io/badge/TEI-P5-orange)

## 🌟 Key Features

### 📖 **Complete TEI Document Support**
- **Full document rendering**: TEI header, front matter, body content, and metadata
- **Manuscript alignment**: Precise synchronization between manuscript images and text
- **Universal navigation**: Support for all page types (empty, front matter, content pages)
- **Rich TEI elements**: Handles complex poetry structures, title pages, and editorial content

### 🎯 **Context-Aware Editing**
- **Smart toolbar**: Buttons adapt based on selected content type
- **Flexible conversions**: Transform lines into titles, subtitles, epigraphs, dedications
- **Multi-element operations**: Merge stanzas, split content, bulk operations
- **Intelligent detection**: Automatically recognizes content types and available actions

### 🔄 **Three-Pane Synchronized Interface**
1. **📸 Image Pane**: High-resolution manuscript facsimiles
2. **📝 Text Pane**: Rendered, readable text with editorial features  
3. **🔧 TEI Code Pane**: Raw XML source with syntax highlighting

### 🎨 **Advanced Text Selection**
- **Stable selection**: Fixed flickering and disappearing issues
- **Cross-element selection**: Works across different TEI element types
- **UI isolation**: Interface elements don't interfere with text selection
- **Preserved state**: Maintains selection during toolbar interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd tei-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Using Sample Documents
The editor includes sample TEI documents showcasing different manuscript types:
- **Russian Poetry**: Historical poetry collections with front matter
- **Multi-page Documents**: Complex manuscripts with empty pages and title pages
- **Mixed Content**: Documents combining poetry, prose, and editorial content

## 📋 Usage Guide

### Loading Documents
1. **Upload TEI files**: Drag and drop or browse for `.xml` files
2. **Sample documents**: Choose from pre-loaded examples
3. **Automatic processing**: Images and metadata are automatically detected

### Navigation
- **Page indicator**: Use navigation bar to jump to specific pages
- **Keyboard shortcuts**: Arrow keys for page navigation
- **Synchronized scrolling**: All panes move together automatically

### Editing Operations

#### **Single Line Selection** 
Select any line to convert it:
- **Title**: Main heading
- **Subtitle**: Secondary heading  
- **Epigraph**: Quote or motto
- **Dedication**: Dedicatory text
- **Delete**: Remove element

#### **Multiple Line Selection**
Select multiple lines to:
- **Create Stanza**: Group lines into stanza structure
- **Delete Selection**: Remove selected content

#### **Stanza Operations**
Use checkboxes to select stanzas, then:
- **Merge Stanzas**: Combine multiple stanzas
- **Split Stanza**: Divide at cursor position
- **Delete Stanzas**: Remove selected stanzas

### Document Structure Support

#### **TEI Header**
```xml
<teiHeader>
  <fileDesc>
    <titleStmt>
      <title>Document Title</title>
      <author>Author Name</author>
    </titleStmt>
  </fileDesc>
</teiHeader>
```

#### **Front Matter**
```xml
<front>
  <titlePage facs="#page_5">
    <docTitle>
      <titlePart>Main Title</titlePart>
    </docTitle>
    <docImprint>
      <publisher>Publisher Info</publisher>
    </docImprint>
  </titlePage>
</front>
```

#### **Poetry Content**
```xml
<body>
  <div type="poem">
    <head>Poem Title</head>
    <lg type="stanza" n="1">
      <l n="1">First line of poetry</l>
      <l n="2">Second line of poetry</l>
    </lg>
  </div>
</body>
```

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18**: Component-based UI
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **CodeMirror**: Syntax-highlighted XML editing

### Key Components
- **`ThreePaneLayout`**: Main interface coordination
- **`RenderedTextPane`**: Human-readable text rendering
- **`ImagePane`**: Manuscript image display
- **`TEICodePane`**: XML source editing
- **`FloatingToolbar`**: Context-aware editing tools

### Hooks & Utilities
- **`useTextSelection`**: Advanced text selection management
- **`usePageBlockScrolling`**: Three-pane synchronization
- **`teiOperations`**: TEI transformation utilities

## 🎓 Educational Applications

### Digital Humanities
- **Manuscript transcription**: Create scholarly digital editions
- **Text encoding training**: Learn TEI guidelines through practice
- **Comparative analysis**: Side-by-side manuscript and text study

### Research & Publishing
- **Scholarly editions**: Prepare texts for academic publication
- **Manuscript studies**: Analyze document structure and content
- **Collaborative editing**: Multiple researchers can work on same document

### Teaching & Learning
- **TEI workshops**: Hands-on encoding experience
- **Literature courses**: Enhanced text analysis capabilities
- **Digital skills**: Modern academic technology training

## 🔧 Advanced Features

### Custom TEI Elements
The editor supports custom TEI vocabularies and can be extended for:
- Specialized manuscript types
- Domain-specific annotations
- Custom editorial workflows

### Export Capabilities
- **TEI-compliant XML**: Standards-compliant output
- **Scholarly formats**: Integration with academic publishing workflows
- **Archival formats**: Long-term preservation standards

### Integration Options
- **Version control**: Git integration for collaborative editing
- **APIs**: RESTful endpoints for document management
- **Authentication**: User management and access control

## 📊 Performance & Scalability

### Optimizations
- **Virtual scrolling**: Handles large documents efficiently
- **Lazy loading**: Images load on demand
- **Caching**: Smart caching of computed positions and mappings
- **Debounced operations**: Smooth scrolling and editing

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Style
- ESLint configuration included
- Prettier for code formatting
- React hooks patterns
- Functional component architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TEI Consortium**: For TEI P5 guidelines and standards
- **Digital Humanities Community**: For inspiration and feedback
- **React Community**: For excellent tooling and libraries
- **CodeMirror**: For powerful code editing capabilities

## 📞 Support & Contact

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Documentation**: Additional guides available in `/docs`
- **Community**: Join discussions in GitHub Discussions

---

**TEI Poetry Editor** - Bringing manuscript editing into the digital age with sophisticated tools for scholars, students, and digital humanities practitioners.