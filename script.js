document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('getMyIP').addEventListener('click', getUserIP);
document.getElementById('clearResult').addEventListener('click', clearResult);
document.getElementById('reportWrongIP').addEventListener('click', handleWrongIP);

const token = 'ae901708396ae6'; // Your IPinfo token
let lastIP = null; // To store the last used IP
let correctIP = null; // To store the corrected IP

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No image selected.');
        return;
    }
    
    extractIPFromExif(file);
}

function extractIPFromExif(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            EXIF.getData(image, function() {
                const exifData = EXIF.getAllTags(this);
                const ip = extractIPFromExifData(exifData);
                if (ip) {
                    lastIP = ip;
                    getGeoLocation(ip);
                } else {
                    displayResult('No IP address found in the EXIF data. Click "Get My IP Location" to get your IP address.', true);
                }
            });
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function extractIPFromExifData(exifData) {
    const ipRegex = /(\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    for (const key in exifData) {
        if (typeof exifData[key] === 'string') {
            const match = exifData[key].match(ipRegex);
            if (match) {
                return match[0];
            }
        }
    }
    return null;
}

function getGeoLocation(ip) {
    if (!ip) {
        displayResult('Unable to retrieve IP address.');
        return;
    }
    
    fetch(`https://ipinfo.io/${ip}/json?token=${token}`)
        .then(response => response.json())
        .then(data => {
            const locationInfo = `
                <h2>Location Information:</h2>
                <p>IP: ${data.ip || 'N/A'}</p>
                <p>Hostname: ${data.hostname || 'N/A'}</p>
                <p>City: ${data.city || 'N/A'}</p>
                <p>Region: ${data.region || 'N/A'}</p>
                <p>Country: ${data.country || 'N/A'}</p>
                <p>Location: ${data.loc ? data.loc.split(',').map(coord => coord || 'N/A').join(', ') : 'N/A'}</p>
                <p>Organization: ${data.org || 'N/A'}</p>
                <p>Postal: ${data.postal || 'N/A'}</p>
                <p>Timezone: ${data.timezone || 'N/A'}</p>
            `;
            displayResult(locationInfo, false);
        })
        .catch(error => {
            console.error('Error fetching geo-location:', error);
            displayResult('Error fetching location information.');
        });
}

function getUserIP() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            correctIP = data.ip; // Store the correct IP
            getGeoLocation(data.ip);
        })
        .catch(error => {
            console.error('Error fetching user IP:', error);
            displayResult('Error fetching user IP.');
        });
}

function handleWrongIP() {
    if (!lastIP) {
        displayResult('No IP to report.');
        return;
    }
    
    // Logic to refine or update IP extraction can be complex. This is a placeholder.
    displayResult('Reporting incorrect IP. Adjustments will be made to improve accuracy.');
    // Implement any logic to fine-tune or correct the extraction process here.
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('fileInput').value = ''; // Clear file input
    document.getElementById('reportWrongIP').style.display = 'none'; // Hide "No IP?" button
}

function displayResult(message, showGetMyIP = false) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>${message}</p>`;
    if (showGetMyIP) {
        document.getElementById('getMyIP').style.display = 'block'; // Show "Get My IP Location" button
        document.getElementById('reportWrongIP').style.display = 'block'; // Show "No IP?" button
    } else {
        document.getElementById('getMyIP').style.display = 'none'; // Hide button
        document.getElementById('reportWrongIP').style.display = 'none'; // Hide "No IP?" button
    }
}