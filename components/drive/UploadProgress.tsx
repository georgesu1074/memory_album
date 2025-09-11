'use client';

import { useState, useEffect } from 'react';

interface UploadStatus {
  pending: number;
  uploading: number;
  completed: number;
  failed: number;
  recentUploads: {
    id: string;
    photoUrl: string;
    status: string;
    uploadedAt?: string;
    errorMessage?: string;
  }[];
}

interface UploadProgressProps {
  weddingSlug: string;
  refreshInterval?: number;
}

export default function UploadProgress({ 
  weddingSlug, 
  refreshInterval = 5000 
}: UploadProgressProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUploadStatus = async () => {
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/drive/uploads/status`);
      if (response.ok) {
        const data = await response.json();
        setUploadStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch upload status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadStatus();
    
    // Poll for updates if there are pending/uploading items
    const interval = setInterval(() => {
      if (uploadStatus && (uploadStatus.pending > 0 || uploadStatus.uploading > 0)) {
        fetchUploadStatus();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [weddingSlug, refreshInterval, uploadStatus?.pending, uploadStatus?.uploading]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!uploadStatus) {
    return null;
  }

  const hasActivity = uploadStatus.pending > 0 || uploadStatus.uploading > 0 || uploadStatus.failed > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Progress</h2>
      
      {/* Progress Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {uploadStatus.pending > 0 && (
          <div className="text-center p-2 bg-yellow-50 rounded">
            <p className="text-2xl font-bold text-yellow-600">{uploadStatus.pending}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
        )}
        
        {uploadStatus.uploading > 0 && (
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-2xl font-bold text-blue-600">{uploadStatus.uploading}</p>
            <p className="text-xs text-gray-600">Uploading</p>
          </div>
        )}
        
        {uploadStatus.completed > 0 && (
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-2xl font-bold text-green-600">{uploadStatus.completed}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        )}
        
        {uploadStatus.failed > 0 && (
          <div className="text-center p-2 bg-red-50 rounded">
            <p className="text-2xl font-bold text-red-600">{uploadStatus.failed}</p>
            <p className="text-xs text-gray-600">Failed</p>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      {uploadStatus.recentUploads.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {uploadStatus.recentUploads.map((upload) => (
              <div
                key={upload.id}
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  upload.status === 'completed' ? 'bg-green-50' :
                  upload.status === 'failed' ? 'bg-red-50' :
                  upload.status === 'uploading' ? 'bg-blue-50' :
                  'bg-yellow-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    upload.status === 'completed' ? 'bg-green-500' :
                    upload.status === 'failed' ? 'bg-red-500' :
                    upload.status === 'uploading' ? 'bg-blue-500 animate-pulse' :
                    'bg-yellow-500'
                  }`} />
                  <span className="truncate max-w-xs">
                    {upload.photoUrl.split('/').pop()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {upload.uploadedAt ? new Date(upload.uploadedAt).toLocaleTimeString() : 
                   upload.status === 'uploading' ? 'Uploading...' : 
                   upload.status === 'pending' ? 'Queued' : 
                   upload.errorMessage || 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button for Failed Uploads */}
      {uploadStatus.failed > 0 && (
        <button
          onClick={async () => {
            const response = await fetch(`/api/weddings/${weddingSlug}/drive/uploads/retry`, {
              method: 'POST',
            });
            if (response.ok) {
              fetchUploadStatus();
            }
          }}
          className="mt-3 w-full px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
        >
          Retry Failed Uploads
        </button>
      )}

      {!hasActivity && (
        <p className="text-sm text-gray-500 text-center">All photos are backed up</p>
      )}
    </div>
  );
}