import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function AttendanceScanner() {
  const [qrData, setQrData] = useState("");

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🎯 Attendance</h1>

      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            localStorage.setItem("attendance list",)
            setQrData(result?.text); // ✅ result.text gives you the scanned string
          }
          if (!!error) {
            console.log("Scanning error:", error);
          }
        }}
        constraints={{
          facingMode: "environment", // Use back camera on mobile
        }}
        style={{ width: "300px", margin: "0 auto" }}
      />

      {qrData && (
        <div style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
          ✅ Scanned: {qrData}
        </div>
      )}
    </div>
  );
}
