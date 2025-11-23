'use client';

import { useEffect, useRef, useState } from 'react';

interface CKEditorWrapperProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

// 서버 이미지 업로드 어댑터 (S3)
class ServerUploadAdapter {
  private loader: any;
  private xhr: XMLHttpRequest | null = null;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        })
    );
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:18080/admin/api/v1';
    xhr.open('POST', `${apiBaseUrl}/upload/image`, true);

    // 토큰이 있다면 추가
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.responseType = 'json';
  }

  _initListeners(resolve: any, reject: any, file: File) {
    const xhr = this.xhr!;
    const loader = this.loader;
    const genericErrorText = `파일 업로드 실패: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;

      if (!response || response.error || !response.success) {
        return reject(
          response && response.error && response.error.message
            ? response.error.message
            : genericErrorText
        );
      }

      // 서버에서 반환된 이미지 URL
      resolve({
        default: response.data.imageUrl || response.data.url,
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  async _sendRequest(file: File) {
    // 이미지를 380px로 리사이징
    const resizedFile = await this._resizeImage(file, 380);
    const data = new FormData();
    data.append('image', resizedFile);

    this.xhr!.send(data);
  }

  async _resizeImage(file: File, maxWidth: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 비율 유지하면서 리사이징
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type }));
              } else {
                reject(new Error('이미지 리사이징 실패'));
              }
            },
            file.type,
            0.85 // 85% 품질
          );
        };
        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  }
}

export default function CKEditorWrapper({ value, onChange, placeholder }: CKEditorWrapperProps) {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    const loadEditor = async () => {
      try {
        // CKEditor 5 동적 import
        const { CKEditor } = await import('@ckeditor/ckeditor5-react');
        const {
          ClassicEditor,
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Heading,
          Link,
          List,
          Image,
          ImageToolbar,
          ImageUpload,
          Table,
          BlockQuote,
          Undo,
          Indent,
          IndentBlock,
          Font
        } = await import('ckeditor5');

        editorRef.current = {
          CKEditor,
          ClassicEditor,
          config: {
            licenseKey: 'GPL', // GPL 라이선스 키 (오픈소스 프로젝트용)
            plugins: [
              Essentials,
              Bold,
              Italic,
              Paragraph,
              Heading,
              Link,
              List,
              Image,
              ImageToolbar,
              ImageUpload,
              Table,
              BlockQuote,
              Undo,
              Indent,
              IndentBlock,
              Font
            ],
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'link',
              '|',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'imageUpload',
              'insertTable',
              '|',
              'outdent',
              'indent',
              '|',
              'blockQuote',
              '|',
              'undo',
              'redo'
            ]
          }
        };

        setEditorLoaded(true);
      } catch (error) {
        console.error('CKEditor 로드 실패:', error);
      }
    };

    loadEditor();
  }, []);

  if (!editorLoaded || !editorRef.current) {
    return (
      <div className="border border-gray-300 rounded p-4 text-gray-500">
        에디터를 로딩 중...
      </div>
    );
  }

  const { CKEditor, ClassicEditor, config } = editorRef.current;

  return (
    <>
      <div style={{ maxWidth: '440px' }}>
        <CKEditor
          editor={ClassicEditor}
          data={value}
          config={config}
          onReady={(editor: any) => {
            // 서버 업로드 어댑터 등록
            editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
              return new ServerUploadAdapter(loader);
            };
          }}
          onChange={(event: any, editor: any) => {
            const data = editor.getData();
            onChange(data);
          }}
        />
      </div>
      <style jsx global>{`
        .ck-editor__editable {
          min-height: 650px;
          max-height: 650px;
          max-width: 440px;
          overflow-y: auto;
        }
        .ck.ck-editor__main > .ck-editor__editable {
          background-color: white;
          max-width: 440px;
        }
        .ck-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 0 8px 0;
        }
        .ck-content p {
          margin: 0 0 8px 0;
        }
        .ck-content p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
}
