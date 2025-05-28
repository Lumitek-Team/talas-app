"use client";

import React, { useEffect, useState, useRef } from 'react';
import Uppy from '@uppy/core';
import { Dashboard } from '@uppy/react';

// Import uppy styles
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

interface VideoUploaderProps {
  onFileSelected: (file: File | null) => void;
  onUploadError?: (error: Error) => void;
}

// Helper function to get video duration
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onFileSelected, 
  onUploadError 
}) => {
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Use refs to store the latest callback functions
  const onFileSelectedRef = useRef(onFileSelected);
  const onUploadErrorRef = useRef(onUploadError);
  
  // Update refs when props change
  useEffect(() => {
    onFileSelectedRef.current = onFileSelected;
  }, [onFileSelected]);
  
  useEffect(() => {
    onUploadErrorRef.current = onUploadError;
  }, [onUploadError]);

  useEffect(() => {
    const uppyInstance = new Uppy({
      id: 'video-uploader',
      autoProceed: false,
      debug: false,
      restrictions: {
        maxFileSize: 25 * 1024 * 1024, // 25MB
        maxNumberOfFiles: 1,
        allowedFileTypes: ['video/*'],
      },
      locale: {
        strings: {
          exceedsSize: 'This file exceeds maximum allowed size of 25MB',
          youCanOnlyUploadX: {
            0: 'You can only upload %{smart_count} file',
            1: 'You can only upload %{smart_count} files'
          },
          youCanOnlyUploadFileTypes: 'You can only upload video files (max 60 seconds)',
          companionError: 'Connection failed'
        },
        pluralize: (n: number) => (n === 1 ? 0 : 1)
      }
    });

    const setupEventListeners = () => {
      uppyInstance.on('file-added', async (file) => {
        console.log('File added:', file.name, file.type, file.size);
        
        // Use setTimeout to ensure this runs after the current execution context
        setTimeout(async () => {
          try {
            // Check file size
            if (file.size && file.size > 25 * 1024 * 1024) {
              uppyInstance.removeFile(file.id);
              if (onUploadErrorRef.current) {
                onUploadErrorRef.current(new Error('File size exceeds 25MB limit'));
              }
              return;
            }

            // Check file type
            if (!file.type.startsWith('video/')) {
              uppyInstance.removeFile(file.id);
              if (onUploadErrorRef.current) {
                onUploadErrorRef.current(new Error('Only video files are allowed'));
              }
              return;
            }

            // Create File object for duration check
            const regularFile = new File([file.data], file.name || 'untitled', {
              type: file.type
            });

            // Check video duration
            try {
              const duration = await getVideoDuration(regularFile);
              console.log('Video duration:', duration, 'seconds');
              
              if (duration > 60) {
                uppyInstance.removeFile(file.id);
                if (onUploadErrorRef.current) {
                  onUploadErrorRef.current(new Error(`Video duration (${Math.round(duration)}s) exceeds 60 second limit`));
                }
                return;
              }
            } catch (durationError) {
              console.warn('Could not check video duration:', durationError);
              // Continue without duration check if metadata loading fails
            }

            // File passed all checks
            if (onFileSelectedRef.current) {
              onFileSelectedRef.current(regularFile);
            }
          } catch (error) {
            console.error('Error processing file:', error);
            uppyInstance.removeFile(file.id);
            if (onUploadErrorRef.current) {
              onUploadErrorRef.current(new Error('Failed to process selected file'));
            }
          }
        }, 0);
      });

      uppyInstance.on('file-removed', (file) => {
        console.log('File removed:', file.name);
        setTimeout(() => {
          if (onFileSelectedRef.current) {
            onFileSelectedRef.current(null);
          }
        }, 0);
      });

      uppyInstance.on('restriction-failed', (file, error) => {
        console.error('File restriction failed:', {
          fileName: file?.name,
          fileType: file?.type,
          fileSize: file?.size,
          error: error
        });
        
        setTimeout(() => {
          let errorMessage = 'File not allowed';
          
          if (file?.size && file.size > 25 * 1024 * 1024) {
            errorMessage = 'File size exceeds 25MB limit';
          } else if (file?.type && !file.type.startsWith('video/')) {
            errorMessage = 'Only video files are allowed';
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          if (onUploadErrorRef.current) {
            onUploadErrorRef.current(new Error(errorMessage));
          }
        }, 0);
      });

      uppyInstance.on('error', (error) => {
        console.error('Uppy error:', error);
        setTimeout(() => {
          if (onUploadErrorRef.current) {
            onUploadErrorRef.current(new Error(error?.message || 'Upload error occurred'));
          }
        }, 0);
      });
    };

    // Delay setup to ensure parent component is fully mounted
    const timeoutId = setTimeout(() => {
      setupEventListeners();
      setUppy(uppyInstance);
      setIsReady(true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (uppyInstance) {
        uppyInstance.destroy();
      }
    };
  }, []);

  if (!uppy || !isReady) {
    return (
      <div className="flex items-center justify-center h-[350px] border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-gray-500">Loading uploader...</div>
      </div>
    );
  }

  return (
    <div className="uppy-video-uploader">
      <Dashboard
        uppy={uppy}
        width="100%"
        height={350}
        showProgressDetails={false}
        note="Drop video files here or click to browse (max 25MB, 60 seconds)"
        proudlyDisplayPoweredByUppy={false}
        disableStatusBar={true}
        disableInformer={false}
        disableThumbnailGenerator={true}
      />
    </div>
  );
};

export default VideoUploader;