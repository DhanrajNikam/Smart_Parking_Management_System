import QRCode from "qrcode.react";

function QRCard({ value, size = 240, title = "Your Entry/Exit QR" }) {
  return (
    <div className="sp-qr-card">
      <div className="sp-qr-title">{title}</div>
      <div className="sp-qr-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <QRCode value={value || ""} size={size} renderAs="svg" includeMargin />
      </div>
    </div>
  );
}


export default QRCard;

