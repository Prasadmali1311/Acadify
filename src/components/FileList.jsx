import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileList.css';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/upload/files');
            setFiles(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching files:', err);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (filename) => {
        try {
            await axios.delete(`http://localhost:5000/api/upload/file/${filename}`);
            // Refresh the file list
            fetchFiles();
        } catch (err) {
            console.error('Error deleting file:', err);
            setError('Failed to delete file');
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/upload/file/${filename}`, {
                responseType: 'blob'
            });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading file:', err);
            setError('Failed to download file');
        }
    };

    if (loading) {
        return <div className="loading">Loading files...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="file-list-container">
            <h2>Uploaded Files</h2>
            <button onClick={fetchFiles} className="refresh-button">
                Refresh List
            </button>
            {files.length === 0 ? (
                <p className="no-files">No files uploaded yet</p>
            ) : (
                <table className="file-table">
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Original Name</th>
                            <th>Size</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file._id}>
                                <td>{file.filename}</td>
                                <td>{file.metadata?.originalName || file.filename}</td>
                                <td>{(file.length / 1024 / 1024).toFixed(2)} MB</td>
                                <td>{new Date(file.uploadDate).toLocaleString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleDownload(file.filename)}
                                        className="action-button download"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.filename)}
                                        className="action-button delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FileList; 