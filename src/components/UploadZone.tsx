"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
  loading: boolean;
}

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export default function UploadZone({ onFile, loading }: Props) {
  const onDrop = useCallback((accepted: File[]) => { if (accepted[0]) onFile(accepted[0]); }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, multiple: false, disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        borderRadius: 20,
        border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--border)"}`,
        padding: "40px 24px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: isDragActive ? "var(--accent-light)" : "var(--bg)",
        transition: "all 0.2s ease",
        transform: isDragActive ? "scale(1.01)" : "scale(1)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", margin: 0 }}>Extracting data…</p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>Claude AI is reading your invoice</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-light)", border: "1.5px solid var(--accent-mid)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <div>
            <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", margin: 0 }}>
              {isDragActive ? "Drop it!" : "Drop your invoice here"}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>PDF, JPG, PNG or WebP · max 10 MB</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 240 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button
            type="button"
            style={{ padding: "10px 28px", borderRadius: 999, fontWeight: 700, fontSize: 14, color: "#fff", background: "var(--accent)", border: "none", cursor: "pointer", boxShadow: "var(--btn-shadow)" }}
          >
            Browse files
          </button>
        </div>
      )}
    </div>
  );
}
