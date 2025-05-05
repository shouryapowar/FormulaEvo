document.getElementById('excelUpload').addEventListener('change', handleUpload);

async function handleUpload(e) {
  const file = e.target.files[0];
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  // Process first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  updateDriverStandings(jsonData);
}

function updateDriverStandings(data) {
  console.log("Processed driver data:", data);
  // In a real app, you would:
  // 1. Validate data
  // 2. Send to server
  // 3. Update UI
  alert(`Successfully processed ${data.length} driver records`);
}