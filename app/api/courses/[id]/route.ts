'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileUp, File, Loader, Check, AlertCircle } from 'lucide-react';

interface UploadedDocument {
  id: number;
  filename: string;
  course_name: string;
  file_type: string;
  summary: string;
  created_at: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch courses
        const coursesRes = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const coursesData = await coursesRes.json();
        setCourses(coursesData.courses);

        // Fetch documents
        const docsRes = await fetch('/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const docsData = await docsRes.json();
        setDocuments(docsData.documents);
      } catch (error) {
        console.error('Error loading page:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setUploadStatus({ status: 'idle', message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !selectedCourse) {
      setUploadStatus({
        status: 'error',
        message: 'Please select a file and course',
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ status: 'uploading', message: 'Uploading file...' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', selectedCourse);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      setUploadStatus({
        status: 'processing',
        message: 'Processing with AI... This may take a moment.',
      });

      const data = await res.json();

      // Poll for processing completion
      let processed = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!processed && attempts < maxAttempts) {
        const checkRes = await fetch(`/api/documents/${data.document.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const checkData = await checkRes.json();

        if (checkData.document.summary) {
          processed = true;
          setUploadStatus({
            status: 'success',
            message: 'File uploaded and processed successfully!',
          });
          setDocuments([checkData.document, ...documents]);
          setFile(null);
          setSelectedCourse('');
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }
      }

      if (!processed) {
        setUploadStatus({
          status: 'success',
          message: 'File uploaded! AI processing in background.',
        });
      }
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-neutral-900">
          Upload Study Materials
        </h1>
        <p className="text-neutral-600 mt-2">
          Upload PDFs, notes, or slides. AI will extract content and generate study resources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-6">
            <h2 className="text-2xl font-display font-bold">Upload File</h2>

            {/* Course Selection */}
            <div className="form-group">
              <label className="label">Select Course *</label>
              {courses.length > 0 ? (
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-medium mb-2">No courses yet</p>
                  <p className="mb-3">Create a course first before uploading files.</p>
                  <Link
                    href="/dashboard/courses"
                    className="text-warning-700 font-medium hover:underline"
                  >
                    Go to Courses →
                  </Link>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label className="label">Upload File *</label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md,.docx,.pptx"
                  className="hidden"
                  id="file-input"
                  disabled={!selectedCourse}
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <FileUp className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                  <p className="font-medium text-neutral-900 mb-1">
                    Drag and drop or click to select
                  </p>
                  <p className="text-sm text-neutral-600">
                    Supports: PDF, TXT, MD, DOCX, PPTX
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-3">
                  <File className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{file.name}</p>
                    <p className="text-sm text-neutral-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {uploadStatus.status !== 'idle' && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  uploadStatus.status === 'success'
                    ? 'bg-success-50 border border-success-200'
                    : uploadStatus.status === 'error'
                    ? 'bg-danger-50 border border-danger-200'
                    : 'bg-primary-50 border border-primary-200'
                }`}
              >
                {uploadStatus.status === 'success' && (
                  <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                )}
                {uploadStatus.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                )}
                {(uploadStatus.status === 'uploading' ||
                  uploadStatus.status === 'processing') && (
                  <Loader className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      uploadStatus.status === 'success'
                        ? 'text-success-700'
                        : uploadStatus.status === 'error'
                        ? 'text-danger-700'
                        : 'text-primary-700'
                    }`}
                  >
                    {uploadStatus.message}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || !selectedCourse || uploading}
              className="button button-primary w-full"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5" />
                  Upload & Process
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Uploads */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-6">
            Recent Uploads
          </h2>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/dashboard/courses/${doc.course_name}`}
                  className="p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <File className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {doc.course_name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <FileUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No uploads yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}