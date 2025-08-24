import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CloudUpload, X, FileImage, Check } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (imageUrl: string) => void;
}

export default function FileUploadModal({ isOpen, onClose, onImageInsert }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate upload progress
      const xhr = new XMLHttpRequest();
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    },
    onSuccess: (response: any) => {
      toast({ title: 'Success', description: 'Image uploaded successfully' });
      const imageHtml = caption 
        ? `<figure><img src="${response.url}" alt="${caption}" style="max-width: 100%; height: auto;" /><figcaption>${caption}</figcaption></figure>`
        : `<img src="${response.url}" alt="" style="max-width: 100%; height: auto;" />`;
      onImageInsert(imageHtml);
      handleClose();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      setUploadProgress(0);
    }
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({ title: 'Error', description: 'Please select a valid image file', variant: 'destructive' });
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-file-upload">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Upload Image
            <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-upload-modal">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          {!selectedFile && (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              data-testid="dropzone-upload"
            >
              <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Drag and drop your image here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
              <Button variant="outline" data-testid="button-browse-files">
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
                data-testid="input-file"
              />
            </div>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2" data-testid="upload-progress">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Uploading {selectedFile?.name}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Image Preview */}
          {selectedFile && previewUrl && !uploadMutation.isPending && (
            <div className="space-y-4" data-testid="image-preview">
              <div className="border border-muted rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-lg mb-3"
                  data-testid="img-preview"
                />
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption (optional)</Label>
                  <Input
                    id="caption"
                    placeholder="Add image caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    data-testid="input-caption"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileImage className="h-4 w-4" />
                <span data-testid="text-file-info">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </span>
              </div>
            </div>
          )}

          {/* Success State */}
          {uploadMutation.isSuccess && (
            <div className="flex items-center justify-center p-8 text-green-600" data-testid="upload-success">
              <Check className="h-8 w-8 mr-2" />
              <span>Image uploaded successfully!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} data-testid="button-cancel-upload">
              Cancel
            </Button>
            {selectedFile && !uploadMutation.isPending && !uploadMutation.isSuccess && (
              <Button onClick={handleUpload} data-testid="button-insert-image">
                Insert Image
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
