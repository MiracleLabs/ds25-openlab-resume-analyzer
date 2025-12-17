import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  }, [onFileSelect, disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`
        relative w-full max-w-xl mx-auto border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 group
        ${disabled ? 'opacity-50 cursor-not-allowed border-brand-lightgrey bg-gray-50' : ''}
        ${isDragging 
          ? 'border-brand-lightblue bg-brand-lightblue/5 scale-[1.02] shadow-xl shadow-brand-lightblue/10' 
          : 'border-brand-lightgrey hover:border-brand-lightblue hover:bg-brand-lightblue/5'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-5">
        <div className={`p-5 rounded-full transition-colors duration-300 ${isDragging ? 'bg-brand-lightblue/20' : 'bg-gray-100 group-hover:bg-brand-lightblue/10'}`}>
          <svg className={`w-12 h-12 transition-colors duration-300 ${isDragging ? 'text-brand-mediumblue' : 'text-brand-lightgrey group-hover:text-brand-lightblue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className={`text-xl font-semibold transition-colors ${isDragging ? 'text-brand-mediumblue' : 'text-brand-black'}`}>
            {isDragging ? "Drop your resume here" : "Upload your Resume"}
          </p>
          <p className="text-brand-darkgrey mt-2 font-medium">
            Drag & Drop or click to browse
          </p>
          <p className="text-xs text-brand-lightgrey mt-1">
            PDF files only (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;