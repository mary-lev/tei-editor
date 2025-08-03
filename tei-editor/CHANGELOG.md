# TEI Poetry Editor - Changelog

## Version 2.0 - Enhanced Document Support & Context-Aware Editing

### 🎉 Major New Features

#### 1. **Complete TEI Document Support**
- **Full document rendering**: Now displays entire TEI documents including TEI header, front matter, and body content
- **Front matter support**: Proper rendering of `<titlePage>`, `<docTitle>`, `<titlePart>`, `<docImprint>`, and `<publisher>` elements
- **Empty page handling**: Visual placeholders and proper spacing for empty manuscript pages
- **Comprehensive synchronization**: All three panes (Image, Text, TEI) now sync across all document sections

#### 2. **Context-Aware Floating Toolbar**
- **Smart button selection**: Toolbar buttons change based on selected content type
- **Line element conversions**: Convert any line-like element (lines, headings, dedications, epigraphs) to different types
- **Multi-element operations**: Merge stanzas, split content, delete elements
- **Intelligent detection**: Automatically detects single lines, multiple lines, headings, and stanza selections

**Available Operations:**
- **Single line**: Convert to Title, Subtitle, Epigraph, Dedication, or Delete
- **Multiple lines**: Create stanzas or delete selection
- **Multiple stanzas**: Merge or delete selected stanzas
- **Free text**: Create new lines or headings

#### 3. **Enhanced Page Navigation & Synchronization**
- **Universal page support**: Navigate through all page types (empty, front matter, content pages)
- **Improved synchronization**: Fixed jumping issues and enhanced scroll detection
- **Multi-source page detection**: Handles both `<pb n="X">` and `facs="#page_X"` page references
- **Stable navigation**: Reduced threshold-based page switching for smoother experience

#### 4. **Advanced Text Selection System**
- **Reliable selection**: Fixed text selection flickering and disappearing issues
- **UI element exclusion**: Line numbers, checkboxes, and UI elements no longer interfere with text selection
- **Selection preservation**: Maintains selection during toolbar interactions
- **Cross-element selection**: Works across different TEI element types

### 🔧 Technical Improvements

#### **Frontend Enhancements**
- **RenderedTextPane.jsx**: 
  - Extended TEI element rendering support (front matter, title pages)
  - Added page marker generation for `facs` attributes
  - Improved empty page detection and placeholder rendering
  
- **FloatingToolbar.jsx**:
  - Implemented context-aware button mapping system
  - Added line-like element detection logic
  - Enhanced button grouping and layout

- **useTextSelection.js**:
  - Fixed selection stability issues
  - Added selection preservation mechanisms
  - Optimized debounce timing

- **usePageBlockScrolling.js**:
  - Enhanced page marker extraction from multiple sources
  - Improved scroll detection algorithms
  - Added support for `facs` attribute navigation
  - Fixed TEI pane synchronization for front matter

#### **Design System Improvements**
- **Tailwind CSS**: Downgraded from v4 to v3.4 for better compatibility
- **Consistent styling**: Unified design across file loader components
- **Visual hierarchy**: Clear distinction between different content types
- **Responsive layout**: Improved button layouts and spacing

### 📄 Document Structure Support

#### **TEI Header Display**
```xml
<teiHeader>
  <fileDesc>...</fileDesc>
  <encodingDesc>...</encodingDesc>
  <profileDesc>...</profileDesc>
  <revisionDesc>...</revisionDesc>
</teiHeader>
```

#### **Front Matter Support**
```xml
<front>
  <titlePage facs="#page_5">
    <docTitle>
      <titlePart>СМѢШНАЯ ЛЮБОВЬ</titlePart>
    </docTitle>
    <docImprint>
      <publisher>Типографія „Сѣверъ"</publisher>
    </docImprint>
  </titlePage>
</front>
```

#### **Enhanced Poetry Content**
```xml
<body>
  <div type="poem" facs="#page_9">
    <lg type="stanza" n="1">
      <l n="1">Жили были два горбуна,</l>
      <l n="2">онъ любилъ и любила она.</l>
    </lg>
  </div>
</body>
```

### 🎯 User Experience Improvements

#### **Navigation**
- **Page indicator**: Shows current page and total pages with navigation controls
- **Keyboard shortcuts**: Navigate through pages with arrow keys
- **Visual feedback**: Clear indication of current page in all panes

#### **Content Editing**
- **Context menus**: Right-click or select text to see available operations
- **Visual selection**: Selected stanzas and elements are clearly highlighted
- **Undo/Redo**: All operations support undo functionality

#### **Visual Design**
- **Content type indicators**: Different styling for front matter, poetry, and metadata
- **Page markers**: Clear page break indicators with page numbers
- **Loading states**: Proper loading indicators for images and content

### 🐛 Bug Fixes

- **Fixed**: Text selection flickering and disappearing
- **Fixed**: Page synchronization jumping to beginning of document
- **Fixed**: Duplicate page markers for pages with both `<pb>` and `facs` attributes
- **Fixed**: TEI pane not synchronizing with front matter pages
- **Fixed**: Missing images for front matter pages in image pane
- **Fixed**: Inconsistent file loader card sizing
- **Fixed**: Header buttons showing on file loader screen

### 🔍 Behind the Scenes

#### **Performance Optimizations**
- **Reduced cache invalidation**: Less aggressive cache clearing during scroll operations
- **Optimized debouncing**: Dynamic scroll detection timing
- **Efficient rendering**: Reduced unnecessary re-renders and DOM updates

#### **Code Quality**
- **Removed debug logging**: Cleaner console output in production
- **Improved error handling**: Better fallbacks for missing content
- **Enhanced type safety**: Better handling of optional properties

### 📚 Documentation Structure

The TEI Poetry Editor now supports complex manuscript structures with:

1. **Multi-page documents** (1-88+ pages)
2. **Mixed content types** (empty pages, front matter, poetry, prose)
3. **Complex TEI encoding** (nested elements, multiple namespaces, rich metadata)
4. **Manuscript-text alignment** (precise image-to-text correspondence)

### 🎓 Educational Value

The enhanced editor serves as:
- **TEI learning tool**: Complete TEI document structure visibility
- **Digital humanities platform**: Proper manuscript-text-encoding alignment
- **Research interface**: Full-featured editing and navigation capabilities
- **Publishing tool**: Export capabilities for scholarly editions

---

## Migration Notes

### For Existing Documents
- All existing TEI documents continue to work without modification
- New features are automatically available for documents with front matter
- Page navigation improvements apply to all document types

### For Developers
- All existing API endpoints remain unchanged
- New context-aware operations are backward compatible
- Enhanced page detection works with existing scroll handlers

---

*This version represents a major advancement in TEI document editing capabilities, providing comprehensive support for complex manuscript structures while maintaining ease of use and performance.*