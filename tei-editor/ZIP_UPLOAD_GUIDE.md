# ZIP Upload Guide

## Creating a ZIP File for TEI Editor

To upload both TEI XML and manuscript images, create a ZIP file with the following structure:

### Required Structure
```
manuscript.zip
├── document.xml           # Your TEI P5 XML document (any filename ending in .xml)
└── images/               # Image directory (required)
    ├── page_0001.png     # Page images with sequential numbers
    ├── page_0002.png     # 4-digit zero-padded format preferred
    ├── page_0003.png     # PNG or JPG formats supported
    └── ...
```

### Alternative Formats Supported
The editor supports flexible page numbering:
- `page_0001.png` (4-digit padding) ✅ Preferred
- `page_001.png` (3-digit padding) ✅ Supported  
- `page_01.png` (2-digit padding) ✅ Supported
- `page_1.png` (1-digit) ✅ Supported

### Image Requirements
- **Formats**: PNG, JPG, JPEG
- **Location**: Must be in `images/` or `Images/` directory
- **Naming**: Must include `page_` prefix and match TEI page numbers
- **Resolution**: High resolution recommended (300+ DPI for manuscript quality)

### TEI Document Requirements
- **Format**: Valid TEI P5 XML
- **Encoding**: UTF-8 (for Cyrillic text support)
- **Page References**: Use `<pb n="1"/>` tags to reference page numbers
- **Single File**: Only one XML file per ZIP archive

### Example Page Mapping
If your TEI contains:
```xml
<pb n="1"/>
<pb n="2"/>  
<pb n="5"/>
```

Your ZIP should include:
```
images/page_0001.png  (matches pb n="1")
images/page_0002.png  (matches pb n="2") 
images/page_0005.png  (matches pb n="5")
```

### Upload Process
1. Select "TEI XML + Images (ZIP)" option in upload card
2. **Optional**: Check "📚 Contribute to sample collection" to share your document
3. Browse and select your ZIP file
4. The editor will extract and validate the structure
5. Images will be displayed alongside the rendered TEI content
6. **If contributing**: Multiple files will download with contribution instructions

### Error Handling
- **No XML file**: "No XML file found in ZIP archive"
- **Multiple XML files**: "Multiple XML files found. Please include only one TEI document."
- **No images found**: Editor will show warning but continue with text-only editing
- **Invalid XML**: Standard TEI parsing error messages

### Sample Contribution Feature
When you check "📚 Contribute to sample collection":
- Your document will be processed normally for editing
- **Additional downloads will start automatically**:
  - `CONTRIBUTION_INSTRUCTIONS_[hash].md` - Setup guide for maintainers
  - `doc_[hash].xml` - Your TEI document
  - `page_NNNN.png` - Each image file individually
- **Share these files** with TEI Editor maintainers to add your document to the public sample collection
- **Metadata extracted automatically** from your TEI header (title, author, page count)

### Memory Usage
- Images are stored in browser memory as data URLs
- Automatically cleaned up when tab is closed  
- No permanent storage on device or server
- Suitable for documents with 50+ pages