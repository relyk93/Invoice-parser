"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import clsx from "clsx";

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
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: false,
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "border-2 border-dashed rounded-2xl px-8 py-14 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-gray-500">Extracting data…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <UploadIcon />
          <p className="font-medium text-gray-700">
            {isDragActive ? "Drop it here" : "Drop your invoice here"}
          </p>
          <p className="text-sm text-gray-400">PDF, JPG, PNG, or WebP — up to 10 MB</p>
          <span className="mt-2 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white">
            Browse files
          </span>
        </div>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-10 w-10 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
