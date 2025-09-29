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

// export default function AttendanceScanner() {
//   console.log("Rendering component");
//   const [qrData, setQrData] = useState("");
//   const [attendanceList, setAttendanceList] = useState([]);
//   const [attendanceListFlag, setAttendanceListFlag] = useState(false);


//   // Load attendance list from localStorage on component mount


//   // const markAttendance = async (scanned) => {
//   //   const [lcCode, name, organization] = scanned?.split(" - ") || [];
//   //   if (!lcCode) {
//   //     setError("Invalid QR code format. Expected format: LCCode - Name - Organization");
//   //     return;
//   //   }
//   //   // Check if scanned value exists in your array
//   //   if (attendanceList.findIndex(item => item.id === lcCode) === -1) {
//   //     const newList = [...attendanceList, scanned];
//   //     setAttendanceList(newList);
//   //     localStorage.setItem("attendance_list", JSON.stringify(newList));


//   //   }
//   //   else{
//   //     setError(`Attendance already marked for ${lcCode}`);
//   //     console.log("Scanned value already marked.");
//   //   }
//   // };
//   const updateFireBase = async (scanned) => {
//     // Update Firebase
//       try {
//         const docRef = doc(db, "attendance", scanned.split(" - ")[0]); // Use LC code as doc ID
//         await setDoc(docRef, { 
//           name: scanned,
//           markedAt: new Date()
//         });
//         console.log("Attendance marked for:", scanned);
//       } catch (error) {
//         console.error("Error updating Firebase:", error);
//       }
//   }

//   useEffect(() => {
//     console.log("yo ho useEffect ran");
//     const fetchAttendance = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "attendance"));
//         const records = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         console.log("Fetched attendance records:", records);
//         setAttendanceList(records);
//       } catch (error) {
//         console.error("Error fetching attendance:", error);
//       }
//     };

//     fetchAttendance();
//   }, [attendanceListFlag]);

//   return (
//     <div style={{ textAlign: "center" }}>
//       <h1>🎯 Attendance</h1>

//       <QrReader
//         onResult={(result, error) => {
//           if (!!result) {
//             const scanned = result?.text;
//             // check duplicacy
//             console.log("yo ho list hai", attendanceList);
//             if (attendanceList.findIndex(item => item.name === scanned) === -1){

//               setQrData(scanned);
//               updateFireBase(scanned);
//               setAttendanceListFlag(!attendanceListFlag);
//             }
//             else{
//               console.log("Scanned value already marked.");
//             }

//           }
//           if (!!error) {
//             // console.log("Scanning error:", error);
//           }
//         }}
//         constraints={{ facingMode: "environment" }}
//         style={{ margin: "0 auto" }}
//       />

//       {qrData && (
//         <div style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
//           ✅ Scanned: {qrData}
//         </div>
//       )}

//       {attendanceList.length > 0 && (
//         <div style={{ marginTop: "20px", textAlign: "left", margin: "20px auto" }}>
//           <h3>Marked Attendance:</h3>
//           <ul style={{ listStyleType: "none", padding: 0 }}>
//             {attendanceList.map((item, index) => (
//               <li key={item.id}>{index+1}. {item.name}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
