# TEI Poetry Editor - Editing Strategy Documentation

## TEI Structure Overview

### Hierarchical Document Structure
```
TEI Document
├── Poem (div type="poem")
│   ├── Simple Structure (direct stanzas)
│   │   ├── Heading (head)
│   │   ├── Dedication (dedication) [optional]
│   │   ├── Stanza 1 (lg type="stanza")
│   │   │   ├── Line 1 (l)
│   │   │   └── Line 2 (l)
│   │   └── Stanza 2 (lg type="stanza")
│   │
│   └── Multi-Part Structure (with parts)
│       ├── Heading (head)
│       ├── Dedication (dedication) [optional]
│       ├── Part I (div type="part")
│       │   ├── Part Heading (head)
│       │   ├── Stanza 1 (lg type="stanza")
│       │   └── Stanza 2 (lg type="stanza")
│       └── Part II (div type="part")
│           ├── Part Heading (head)
│           └── Stanza 3 (lg type="stanza")
└── Page Breaks (pb) - can appear anywhere
```

### Key TEI Elements
- **Poem**: `<div type="poem">` - Container for complete poem
- **Part**: `<div type="part">` - Subdivision within multi-part poems
- **Stanza**: `<lg type="stanza">` - Group of poem lines
- **Line**: `<l>` - Individual poetry line with line numbers
- **Heading**: `<head>` - Titles for poems and parts
- **Dedication**: `<dedication>` - Poem dedications
- **Page Break**: `<pb>` - Manuscript page boundaries

## Editing Strategy Categories

### 1. TAG ASSIGNMENT OPERATIONS (Selection-Based)
**Pattern**: User selects text → Apply TEI structure

#### 1.1 Basic Element Creation
- **Line Creation**: Select text → Convert to `<l>` with auto-numbering
- **Heading Creation**: Select text → Convert to `<head>` 
- **Dedication Creation**: Select text → Convert to `<dedication><p>text</p></dedication>`

#### 1.2 Container Element Creation  
- **Stanza Creation**: Select multiple lines → Wrap in `<lg type="stanza">`
- **Part Creation**: Select multiple stanzas → Wrap in `<div type="part">`
- **Poem Creation**: Select entire content → Wrap in `<div type="poem">`

#### 1.3 Structure Conversion
- **Simple → Multi-Part**: Convert poem with direct stanzas to part-based structure
- **Multi-Part → Simple**: Flatten part structure to direct stanzas
- **Line → Heading**: Convert poem line to heading element

### 2. STRUCTURAL OPERATIONS (Selection + Position)
**Pattern**: Complex operations involving multiple elements

#### 2.1 Merging Operations
- **Merge Stanzas**: Select 2+ adjacent stanzas → Combine into single stanza
- **Merge Parts**: Select 2+ adjacent parts → Combine content
- **Merge Lines**: Select multiple lines → Combine text into single line

#### 2.2 Splitting Operations  
- **Split Stanza**: Place cursor mid-stanza → Split at cursor position
- **Split Part**: Place cursor mid-part → Create new part boundary
- **Split Line**: Place cursor mid-line → Break into two lines

#### 2.3 Reordering Operations
- **Reorder Stanzas**: Drag & drop stanzas within poem/part
- **Reorder Parts**: Drag & drop parts within poem
- **Reorder Lines**: Drag & drop lines within stanza

### 3. CONTENT INSERTION (Cursor-Based)
**Pattern**: Add new content at specific positions

#### 3.1 Element Insertion
- **Insert Line**: Click between lines → Add empty `<l>` element
- **Insert Stanza**: Click between stanzas → Add empty `<lg type="stanza">`
- **Insert Part**: Click between parts → Add empty `<div type="part">`
- **Insert Page Break**: Click between elements → Add `<pb>` with page number

#### 3.2 Metadata Insertion
- **Insert Dedication**: Add at poem beginning
- **Insert Date/Location**: Add at poem end
- **Insert Editorial Notes**: Add contextual metadata

### 4. CONTENT MODIFICATION (Direct Editing)
**Pattern**: Edit existing text in-place

#### 4.1 Text Editing
- **Line Text Editing**: Click line → Enable contenteditable mode
- **Heading Editing**: Click heading → Modify title text  
- **Dedication Editing**: Click dedication → Edit dedication text

#### 4.2 Attribute Editing
- **Line Numbers**: Edit `n` attribute values
- **XML IDs**: Edit `xml:id` attribute values
- **Page References**: Edit `facs` attribute values
- **Part Numbers**: Edit part numbering (I, II, III)

#### 4.3 Auto-Renumbering
- **Line Renumbering**: Automatic after structural changes
- **Stanza Renumbering**: Automatic within poems/parts
- **Part Renumbering**: Automatic within poems

### 5. CONTENT REMOVAL (Selection-Based)
**Pattern**: Delete elements and content

#### 5.1 Element Deletion
- **Delete Lines**: Select lines → Remove from stanza (with renumbering)
- **Delete Stanzas**: Select stanzas → Remove from poem/part
- **Delete Parts**: Select parts → Remove from poem (flatten if needed)
- **Delete Structure Only**: Remove tags, keep text content

#### 5.2 Content Clearing
- **Clear Line Text**: Keep `<l>` element, remove text content
- **Clear Stanza**: Keep `<lg>` element, remove all lines
- **Clear Part**: Keep `<div type="part">`, remove all stanzas

## Implementation Status & Priorities

### ✅ **COMPLETED - Phase 2 (Core Features)**

#### **Phase 2A - Foundation & Basic Editing**
- ✅ **Selection-based editing** with floating toolbar
- ✅ **Text selection detection** and visual feedback
- ✅ **Basic TEI operations**: tag assignment, content insertion
- ✅ **Element deletion** with checkbox-based selection for stanzas
- ✅ **Auto-numbering system** for lines/stanzas/parts

#### **Phase 2B - Page-Block Synchronized Scrolling**
- ✅ **Three-pane synchronization** across Image, Text, and TEI panes
- ✅ **Page navigation system** with Previous/Next buttons and direct page jumping  
- ✅ **Modern UI design** with compact page navigator
- ✅ **Smooth scroll animations** (800ms transitions)

#### **Phase 2C - TEI Source Code Integration**
- ✅ **CodeMirror integration** with XML syntax highlighting
- ✅ **TEI Source Code pane** with live editing capabilities
- ✅ **Perfect scroll synchronization** - header-less display eliminates alignment issues
- ✅ **Enhanced debugging** with clean console logging

### 📋 **NEXT PHASE - Phase 3 (Advanced Features)**

#### **Phase 3A - Critical Bug Fixes & UX Improvements** (HIGH PRIORITY - IMMEDIATE)
1. **🐛 BUG FIX: Page Reset After Merging** ✅ **COMPLETED**
   - Issue: Panes return to first page after stanza merging operations
   - Root cause: TEI document changes trigger page mapping recalculation
   - Solution implemented: Added `isModifyingTei` flag to prevent auto-detection during operations

2. **🎛️ Context-Aware Floating Toolbar**
   - **Current Issue**: Toolbar shows all options regardless of selection type
   - **Improvement**: Adapt toolbar options based on what user selected:

   | Selection Type | Available Operations |
   |----------------|---------------------|
   | **Multiple stanzas** | Merge, Delete, Reorder |
   | **Single stanza** | Delete, Split, Add Line |
   | **Single line** | Change Type (line→heading), Delete, Split |
   | **Multiple lines** | Create Stanza, Delete |
   | **Text content** | Create Line, Create Heading, Create Dedication |
   | **No selection** | Hide toolbar |

3. **🎨 File Loading UX Improvement**
   - **Current Issue**: Two-tab design requires unnecessary click to access samples
   - **Improvement**: Convert to card-based layout showing both options simultaneously:

   ```
   ┌─────────────────────────────────────────────────────────┐
   │                 Load TEI Document                        │
   ├──────────────────────┬──────────────────────────────────┤
   │   📁 Upload File     │      📚 Sample Documents         │
   │                      │                                  │
   │  ┌─────────────────┐ │  • doc_2e0b9b6c9a1d.xml         │
   │  │ Drag & Drop     │ │  • [other samples...]            │
   │  │ or              │ │                                  │
   │  │ [Choose File]   │ │  Click any sample to load       │
   │  └─────────────────┘ │                                  │
   └──────────────────────┴──────────────────────────────────┘
   ```

   - **Benefits**: Single-screen access, no tab switching, clearer options

#### **Phase 3B - Multi-Page Content Handling** (HIGH PRIORITY)
1. **Multi-page poem rendering**
   - Split poems that span multiple pages properly
   - Handle `<pb>` tags within poem content
   - Ensure continuity across page boundaries

2. **Complex structural editing**
   - Merge/split stanzas across page boundaries
   - Handle part divisions spanning multiple pages
   - Maintain TEI structure integrity during multi-page operations

#### **Phase 3C - Advanced Editing Operations** (MEDIUM PRIORITY)
1. **Part Management**
   - Create parts from selected stanzas
   - Convert between simple/multi-part structure
   - Part-level operations (merge, split, reorder)

2. **Content Insertion Enhancements**
   - Insert new lines/stanzas at cursor position
   - Insert page breaks with proper page number management
   - Add metadata elements (dedications, dates, notes)

#### **Phase 3C - User Experience Polish** (LOW PRIORITY)
1. **Advanced Operations**
   - Drag & drop reordering for stanzas/parts
   - Complex multi-element operations
   - Advanced attribute editing (xml:id, facs, etc.)
   - Editorial notes and comments

2. **Performance & Accessibility**
   - Optimize for documents with 50+ pages
   - Keyboard navigation improvements
   - Screen reader accessibility
   - Mobile responsiveness

## User Interaction Patterns

### Selection Types
1. **Text Selection**: For tag assignment and content modification
2. **Element Selection**: For structural operations (visual highlight of stanza/part)
3. **Cursor Position**: For insertion and splitting operations
4. **Multi-Selection**: For complex operations (Ctrl+click)

### Interface Elements
1. **Floating Toolbar**: Context-sensitive operations based on selection
2. **Click Handlers**: Single-click for cursor, double-click for editing
3. **Hover States**: Preview operations before applying
4. **Keyboard Shortcuts**: Quick access to common operations
5. **Confirmation Dialogs**: For destructive operations

### Operation Feedback
1. **Visual Preview**: Show changes before applying
2. **Undo/Redo**: Support for all operations
3. **Validation**: Ensure TEI structure remains valid
4. **Auto-save**: Preserve changes automatically

## Technical Considerations

### State Management
- Track selection type (text vs element vs cursor)
- Maintain operation history for undo/redo
- Validate TEI structure after each operation
- Auto-renumber elements when needed

### Performance
- Efficient DOM manipulation for large documents
- Lazy rendering for complex operations
- Optimized re-rendering after changes

### Data Integrity
- Preserve original TEI attributes
- Maintain XML validity throughout editing
- Handle character encoding properly
- Backup before destructive operations