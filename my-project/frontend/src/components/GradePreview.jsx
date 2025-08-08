import React, { useState } from "react";
import axios from "axios";

function GradePreview() {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [topper, setTopper] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/upload/trainee",
        form
      );
      const dataWithGrades = res.data.students.map((student) => ({
        ...student,
        WI: "",
        CO: "",
        S5: "",
        PROD: "",
        DS: "",
        finalGrade: "",
      }));
      setStudents(dataWithGrades);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const computeFinal = (s) => {
    const toNum = (val) => Number(val) || 0;
    const written = (toNum(s.WI) + toNum(s.CO) + toNum(s.S5)) / 3;
    const perf = (toNum(s.PROD) + toNum(s.DS)) / 2;
    const final = (written * 0.3 + perf * 0.7).toFixed(2);
    return isNaN(final) ? "" : final;
  };

  const handleGradeChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;

    // Auto-compute final grade
    updated[index].finalGrade = computeFinal(updated[index]);

    setStudents(updated);

    // Find top performer
    const valid = updated.filter((s) => s.finalGrade);
    if (valid.length > 0) {
      const top = valid.reduce((a, b) =>
        Number(a.finalGrade) > Number(b.finalGrade) ? a : b
      );
      setTopper(top);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Upload Trainee Excel File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        className="ml-2 bg-blue-500 text-white px-4 py-1 rounded"
        onClick={handleUpload}
      >
        Upload
      </button>

      {topper && (
        <div className="mt-4 p-2 bg-yellow-200 rounded shadow">
          🏆 Top Performer:{" "}
          <strong>
            {topper.last_name}, {topper.first_name}
          </strong>{" "}
          – Final Grade: {topper.finalGrade}
        </div>
      )}

      {students.length > 0 && (
        <>
          <table className="mt-4 w-full border text-sm">
            // ...existing code...
            <thead>
              <tr className="bg-gray-200">
                <th>Name</th>
                <th>Strand</th>
                <th>Department</th>
                <th>School</th>
                <th>Batch</th>
                <th>Date</th>
                {/* 11 grade columns */}
                <th>1G</th>
                <th>2G</th>
                <th>3G</th>
                <th>4G</th>
                <th>5G</th>
                <th>6G</th>
                <th>7G</th>
                <th>8G</th>
                <th>9G</th>
                <th>10G</th>
                <th>11G</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="text-center">
                  <td>
                    {s.last_name}, {s.first_name} {s.middle_name}
                  </td>
                  <td>{s.strand}</td>
                  <td>{s.department}</td>
                  <td>{s.school}</td>
                  <td>{s.batch}</td>
                  <td>{s.date_of_immersion}</td>
                  {/* 11 number inputs with ids 1G to 11G and values s.1G to s.11G */}
                  {[...Array(11)].map((_, idx) => (
                    <td key={idx}>
                      <input
                        type="number"
                        id={`${idx + 1}G`}
                        value={s[`${idx + 1}G`] || ""}
                        onChange={(e) =>
                          handleGradeChange(i, `${idx + 1}G`, e.target.value)
                        }
                        className="w-14 text-center bg-blue-100"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              // ...existing code...
            </tbody>
          </table>

          {/* ADDED: Generate Excel Button */}
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              try {
                const res = await axios.post(
                  "http://localhost:5000/api/generate/excel",
                  { students },
                  { responseType: "blob" }
                );

                const blob = new Blob([res.data], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "IMMERSION-GENERATED.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert("Upload failed");
              }
            }}
          >
            Generate Excel Report
          </button>
        </>
      )}
    </div>
  );
}

export default GradePreview;
