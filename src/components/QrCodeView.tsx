import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrCodeViewProps = {
  value: string;
};

const QrCodeView = ({ value }: QrCodeViewProps) => {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { margin: 2, width: 220 })
      .then((url: string) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (!dataUrl) {
    return (
      <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-400">
        Generating QR...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <img src={dataUrl} alt="QR ticket" className="h-56 w-56" />
    </div>
  );
};

export default QrCodeView;
