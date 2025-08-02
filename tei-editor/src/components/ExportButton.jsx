function ExportButton({ onExport, disabled }) {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className={`px-4 py-1 text-sm rounded border transition-colors ${
        disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      Export TEI
    </button>
  )
}

export default ExportButton