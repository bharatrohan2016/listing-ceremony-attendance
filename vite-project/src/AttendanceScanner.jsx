import React, { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { db } from "./utils/firebase";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function AttendanceScanner() {
  const [qrData, setQrData] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("blue");
  const [attendanceList, setAttendanceList] = useState([]);

  // 📡 Realtime listener: Fetch attendance list and auto-update UI
  useEffect(() => {
    const q = query(collection(db, "attendance"), orderBy("markedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceList(data);
    });

    return () => unsubscribe(); // clean up on unmount
  }, []);

  // ✅ Handle scan results
  const handleResult = async (result, error) => {
    if (result) {
      const scannedText = result?.text?.trim();

      // prevent duplicate handling while same QR stays in frame
      if (scannedText && scannedText !== qrData) {
        setQrData(scannedText);
        setMessage("📡 QR detected — checking attendance...");
        setMessageColor("blue");

        try {
          // Use LC code (first part) as doc ID
          const lcCode = scannedText.split(" - ")[0];
          const docRef = doc(db, "attendance", lcCode);

          // ✅ Check if attendance already exists
          const existingDoc = await getDoc(docRef);

          if (existingDoc.exists()) {
            // 🚨 Already marked
            setMessage(`❌ Attendance already marked for: ${scannedText}`);
            setMessageColor("red");
          } else {
            // ✅ Mark attendance now
            await setDoc(docRef, {
              qrString: scannedText,
              markedAt: Timestamp.now(),
            });

            setMessage(`✅ Attendance marked successfully for: ${scannedText}`);
            setMessageColor("green");
          }
        } catch (err) {
          console.error("❌ Error saving attendance:", err);
          setMessage("❌ Failed to save attendance. Check console.");
          setMessageColor("red");
        }
      }
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📋 Event Attendance Scanner</h1>

      {/* 🔍 QR Scanner */}
      <QrReader
        onResult={handleResult}
        constraints={{ facingMode: "environment" }}
        style={{ width: "400px", margin: "0 auto" }}
      />

      {/* ✅ Scanned result */}
      {qrData && (
        <p style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
          ✅ Scanned: <strong>{qrData}</strong>
        </p>
      )}
      {
        error && (
          <div style={{ marginTop: "20px", fontSize: "18px", color: "red" }}>
            ❌ {error}
          </div>
        )
      }

      {/* 📡 Status message */}
      {message && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "16px",
            color: messageColor,
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      {/* 📜 Attendance List */}
      <h2 style={{ marginTop: "40px" }}>📋 Marked Attendance List</h2>
      {attendanceList.length === 0 ? (
        <p style={{ color: "gray" }}>No attendance marked yet.</p>
      ) : (
        <table
          style={{
            margin: "20px auto",
            borderCollapse: "collapse",
            width: "80%",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>#</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                QR String
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Marked At
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((entry, index) => (
              <tr key={entry.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {index + 1}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {entry.qrString}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {entry.markedAt?.toDate
                    ? entry.markedAt.toDate().toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
