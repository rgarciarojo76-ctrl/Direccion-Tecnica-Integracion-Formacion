import React, { useRef, useState } from 'react';
import { Upload, X, FileSpreadsheet, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUpload, history = [] }) => {
  const [activeType, setActiveType] = useState(null);
  const [dragOverType, setDragOverType] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleButtonClick = (type) => {
    setActiveType(type);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && activeType) {
      onUpload(file, activeType);
      setActiveType(null);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverType(type);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverType(null);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverType(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        onUpload(file, type);
      } else {
        alert('Por favor, arrastra un archivo Excel (.xlsx o .xls)');
      }
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-modal-header">
          <h2 className="upload-modal-title">
            <Upload size={20} />
            Actualizar Programación
          </h2>
          <button onClick={onClose} className="upload-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="upload-modal-body">
          <p className="upload-modal-description">
            Selecciona o arrastra el archivo de programación (.xlsx, .xls) sobre la compañía correspondiente.
            <br />
            <span className="upload-modal-description-sub">El proceso actualizará automáticamente las sinergias.</span>
          </p>

          <div className="upload-modal-buttons-grid">
            {/* ASPY Card */}
            <button
              onClick={() => handleButtonClick('ASPY')}
              onDragOver={(e) => handleDragOver(e, 'ASPY')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'ASPY')}
              className={`upload-card upload-card-aspy ${dragOverType === 'ASPY' ? 'upload-card-dragover' : ''}`}
            >
              <div className="upload-card-icon upload-card-icon-aspy">
                <FileSpreadsheet size={32} />
              </div>
              <h3 className="upload-card-title">ASPY Prevención</h3>
              <p className="upload-card-subtitle">
                {dragOverType === 'ASPY' ? '¡Suelta el archivo aquí!' : 'Clic o arrastra el Excel'}
              </p>
            </button>

            {/* MAS Card */}
            <button
              onClick={() => handleButtonClick('MAS')}
              onDragOver={(e) => handleDragOver(e, 'MAS')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'MAS')}
              className={`upload-card upload-card-mas ${dragOverType === 'MAS' ? 'upload-card-dragover' : ''}`}
            >
              <div className="upload-card-icon upload-card-icon-mas">
                <FileSpreadsheet size={32} />
              </div>
              <h3 className="upload-card-title">MAS Prevención</h3>
              <p className="upload-card-subtitle">
                {dragOverType === 'MAS' ? '¡Suelta el archivo aquí!' : 'Clic o arrastra el Excel'}
              </p>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
          />

          {/* History Section */}
          {history.length > 0 && (
            <div className="upload-modal-history">
              <h4 className="upload-modal-history-title">
                <Clock size={14} />
                Historial de Cargas
              </h4>
              <div className="upload-modal-history-list">
                {history.map((entry, idx) => (
                  <div key={idx} className="upload-history-entry">
                    <div className="upload-history-entry-left">
                      {entry.status === 'success' ? (
                        <CheckCircle size={16} color="#22c55e" />
                      ) : (
                        <AlertCircle size={16} color="#ef4444" />
                      )}
                      <div>
                        <span className={`upload-history-type ${entry.type === 'ASPY' ? 'type-aspy' : 'type-mas'}`}>
                          {entry.type}
                        </span>
                        <span className="upload-history-separator">|</span>
                        <span className="upload-history-filename">{entry.fileName}</span>
                      </div>
                    </div>
                    <span className="upload-history-time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
