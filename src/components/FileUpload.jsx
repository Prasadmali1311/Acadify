import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        })));
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip']
        }
    });

    const uploadFiles = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to upload');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(({ file }) => {
            formData.append('file', file);
        });

        try {
            const response = await axios.post('http://localhost:5000/api/upload/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({
                        ...prev,
                        [files[0].file.name]: percentCompleted
                    }));
                }
            });
            console.log('Upload successful:', response.data);
            setFiles([]);
            setError(null);
        } catch (err) {
            console.error('Upload failed:', err);
            if (err.response) {
                setError(`Upload failed: ${err.response.data.error || 'Server error'}`);
            } else if (err.request) {
                setError('Upload failed: Could not connect to server. Please make sure the server is running.');
            } else {
                setError('Upload failed: An unexpected error occurred');
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag 'n' drop some files here, or click to select files</p>
                )}
            </div>

            {files.length > 0 && (
                <div className="files-preview">
                    <h4>Files to upload:</h4>
                    <ul>
                        {files.map(({ file, preview }) => (
                            <li key={file.name}>
                                <div className="file-info">
                                    {file.type.startsWith('image/') && (
                                        <img src={preview} alt={file.name} width="50" />
                                    )}
                                    <span>{file.name}</span>
                                    <span className="file-size">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                {uploadProgress[file.name] && (
                                    <div className="progress-bar">
                                        <div
                                            className="progress"
                                            style={{ width: `${uploadProgress[file.name]}%` }}
                                        />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={uploadFiles} 
                        className="upload-button"
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default FileUpload; 