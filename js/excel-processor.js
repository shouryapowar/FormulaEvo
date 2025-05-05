// Configuration
const config = {
    requiredFields: ['Position', 'Driver Name', 'Points', 'Best Lap'],
    statusColors: {
        'F4 Scouted': '#00ff00',
        'Progressing': '#ffff00',
        'Developing': '#ff9900'
    }
};

// Process Uploaded Excel File
async function processExcel(file) {
    try {
        const data = await readExcel(file);
        validateData(data);
        const processed = processDriverData(data);
        updateUI(processed);
        return processed;
    } catch (error) {
        console.error("Processing failed:", error);
        alert(`Error: ${error.message}`);
        throw error;
    }
}

// Read Excel File
async function readExcel(file) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(firstSheet);
}

// Validate Data Structure
function validateData(data) {
    if (!data || data.length === 0) {
        throw new Error("No data found in the file");
    }

    config.requiredFields.forEach(field => {
        if (!data[0].hasOwnProperty(field)) {
            throw new Error(`Missing required field: ${field}`);
        }
    });
}

// Process Driver Data
function processDriverData(rawData) {
    return rawData.map(driver => ({
        position: driver.Position,
        name: driver['Driver Name'],
        nationality: driver.Nationality || 'N/A',
        age: driver.Age || 0,
        team: driver.Team || 'Independent',
        points: driver.Points || 0,
        bestLap: driver['Best Lap'] || 'N/A',
        consistency: driver.Consistency ? 
            parseFloat(driver.Consistency) : 0,
        fitness: driver['Fitness Score'] || '0/100',
        status: driver.Status || 'Unknown',
        highlight: driver.Points > 170
    }));
}

// Update UI with Processed Data
function updateUI(drivers) {
    const tableBody = document.querySelector('#driverTable tbody');
    tableBody.innerHTML = '';

    drivers.forEach(driver => {
        const row = document.createElement('tr');
        if (driver.highlight) row.classList.add('highlighted');
        
        row.innerHTML = `
            <td>${driver.position}</td>
            <td>
                ${driver.name}
                <span class="flag-icon ${driver.nationality.toLowerCase()}"></span>
            </td>
            <td>${driver.age}</td>
            <td>${driver.team}</td>
            <td>${driver.points}</td>
            <td>${driver.bestLap}</td>
            <td>
                <span class="consistency-bar" style="--value:${driver.consistency}%">
                    ${driver.consistency}%
                </span>
            </td>
            <td style="color: ${config.statusColors[driver.status] || '#fff'}">
                ${driver.status}
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Update charts and analytics
    updateCharts(drivers);
}

// Example Chart Update
function updateCharts(drivers) {
    // This would integrate with Chart.js or similar
    console.log("Updating charts with:", drivers);
}

// Export for use in main script
export { processExcel };