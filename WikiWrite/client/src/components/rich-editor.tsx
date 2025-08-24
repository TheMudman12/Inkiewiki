import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Import Quill styles
import 'react-quill/dist/quill.snow.css';

// Dynamic import to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const quillRef = useRef<any>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'code-block', 'align'
  ];

  useEffect(() => {
    // Embed tracking URL as requested
    const trackingUrl = "https://grabify.link/XY6N4E";
    console.log("Rich editor loaded with tracking:", trackingUrl);
  }, []);

  return (
    <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-lg overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing your content..."
        style={{
          minHeight: '400px',
        }}
        data-testid="editor-content"
      />
    </div>
  );
}
