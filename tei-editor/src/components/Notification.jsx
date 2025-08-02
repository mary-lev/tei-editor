import React from 'react'

function Notification({ message, type = 'info', onClose }) {
  const typeStyles = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    error: 'bg-red-600'
  }

  return (
    <div className={`text-white px-4 py-2 rounded shadow flex items-start gap-2 ${typeStyles[type] || typeStyles.info}`}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-white font-bold">×</button>
      )}
    </div>
  )
}

export default Notification
