import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { FileDropzoneProps } from '@/types';

export const FileDropzone = ({
  onFileSelect,
  selectedFile,
  error,
  disabled = false,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    onFileSelect(droppedFile);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  const clearSelection = () => {
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="dropzone-wrapper">
      <div
        className={clsx('dropzone', {
          'dropzone--active': isDragging,
          'dropzone--filled': !!selectedFile,
          'dropzone--disabled': disabled,
        })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone__icon">
          <Upload size={22} />
        </div>

        <div className="dropzone__content">
          <strong>Selecione o arquivo de horário em JSON</strong>
          <p>Arraste e solte aqui ou escolha manualmente.</p>
        </div>

        <label htmlFor="file-input" className="button button--outline button--sm">
          <Upload size={16} />
          Escolher arquivo
        </label>
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".json,application/json"
          onChange={handleInputChange}
          className="sr-only"
          disabled={disabled}
        />
      </div>

      {selectedFile && (
        <div className="selected-file fade-in">
          <span>{selectedFile.name}</span>
          <button type="button" className="icon-button" onClick={clearSelection} aria-label="Remover arquivo">
            <X size={14} />
          </button>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  );
};
