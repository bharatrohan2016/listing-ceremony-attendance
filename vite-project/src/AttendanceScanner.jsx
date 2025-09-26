import React, { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { db } from "./utils/firebase";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export default function AttendanceScanner() {
  const [qrData, setQrData] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [error, setError] = useState(null);

  const [flag, setFlag] = useState(false);

  // Load attendance list from localStorage on component mount


  const markAttendance = async (scanned) => {
    const [lcCode, name, organization] = scanned?.split(" - ") || [];

    console.log(lcCode);
    if (!lcCode) {
      setError("Invalid QR code format. Expected format: LCCode - Name - Organization");
      return;
    }

    setFlag(!flag);

    // Check if scanned value exists in your array
    if (attendanceList.findIndex(item => item.id === lcCode) === -1) {

      const newList = [...attendanceList, scanned];
      setQrData(scanned);
      // setAttendanceList(newList);
      localStorage.setItem("attendance_list", JSON.stringify(newList));

      // Update Firebase
      try {
        const docRef = doc(db, "attendance", scanned.split(" - ")[0]); // Use LC code as doc ID
        await setDoc(docRef, { 
          name: scanned,
          markedAt: new Date()
        });
        console.log("Attendance marked for:", scanned);
      } catch (error) {
        console.error("Error updating Firebase:", error);
      }
    }
    else{
      setError(`Attendance already marked for ${lcCode}`);
      console.log("Scanned value already marked.");
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        const records = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched attendance records:", records);
        setAttendanceList(records);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [flag]);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>🎯 Attendance</h1>

      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            const scanned = result?.text;
            markAttendance(scanned);
          }
          if (!!error) {
            // console.log("Scanning error:", error);
          }
        }}
        constraints={{ facingMode: "environment" }}
        style={{ margin: "0 auto" }}
      />

      {qrData && (
        <div style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
          ✅ Scanned: {qrData}
        </div>
      )}
      {
        error && (
          <div style={{ marginTop: "20px", fontSize: "18px", color: "red" }}>
            ❌ {error}
          </div>
        )
      }

      {attendanceList.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "left", margin: "20px auto" }}>
          <h3>Marked Attendance:</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {attendanceList.map((item, index) => (
              <li key={item.id}>{index+1}. {item.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
