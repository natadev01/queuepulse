import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

type QrScannerProps = {
  onDecode: (text: string) => void;
  paused?: boolean;
  preferRear?: boolean;
};

const QrScanner = ({
  onDecode,
  paused = false,
  preferRear = true,
}: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    let cancelled = false;

    const stopStream = () => {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      try {
        setError(null);
        if (controlsRef.current || cancelled) return;
        let deviceId: string | undefined;
        if (preferRear) {
          const devices = await BrowserQRCodeReader.listVideoInputDevices();
          const isMobile = /Android|iPhone|iPad|iPod/i.test(
            navigator.userAgent,
          );
          if (devices.length > 1 && isMobile) {
            const rear = devices.find((device) =>
              /back|rear|environment/i.test(device.label),
            );
            deviceId = rear?.deviceId ?? devices[devices.length - 1].deviceId;
          }
        }

        controlsRef.current = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current ?? undefined,
          (result, err) => {
            if (result) {
              onDecode(result.getText());
            } else if (err) {
              // ignore NotFoundException spam
            }
          },
        );
        if (cancelled) {
          controlsRef.current?.stop();
          controlsRef.current = null;
          stopStream();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to access the camera.";
        if (!cancelled && !message.includes("play() request was interrupted")) {
          setError("Unable to access the camera. Check permissions.");
        }
      }
    };

    if (!paused) {
      start();
    } else {
      controlsRef.current?.stop();
      controlsRef.current = null;
      stopStream();
    }

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      stopStream();
    };
  }, [onDecode, paused, preferRear]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        controlsRef.current?.stop();
        controlsRef.current = null;
        const stream = videoRef.current?.srcObject as MediaStream | null;
        stream?.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    const handleUnload = () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
      <video
        ref={videoRef}
        className="h-72 w-full object-cover"
        muted
        playsInline
        autoPlay
      />
    </div>
  );
};

export default QrScanner;
