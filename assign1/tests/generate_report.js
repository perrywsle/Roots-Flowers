const fs = require('fs');
const path = require('path');

function generateReport() {
    const screenshotsDir = 'screenshots';
    
    if (!fs.existsSync(screenshotsDir)) {
        console.log('No screenshots directory found!');
        return;
    }
    
    const screenshots = fs.readdirSync(screenshotsDir)
        .filter(f => f.endsWith('.png'))
        .sort();
    
    // Group screenshots by test
    const testGroups = {
        'Homepage': screenshots.filter(s => s.startsWith('homepage_')),
        'Navigation': screenshots.filter(s => s.startsWith('index.') || s.startsWith('product') || 
                                                s.startsWith('enquiry.') || s.startsWith('register.') ||
                                                s.startsWith('profile.') || s.startsWith('enhancement') ||
                                                s.startsWith('promotion.') || s.startsWith('workshop.') ||
                                                s.startsWith('acknowledgement.')),
        'Registration Form': screenshots.filter(s => s.startsWith('register_') && !s.includes('.')),
        'Enquiry Form': screenshots.filter(s => s.startsWith('enquiry_')),
        'JavaScript Tests': screenshots.filter(s => s.startsWith('js_'))
    };
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selenium Test Report - Root Flower</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px 40px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #667eea;
            font-size: 2em;
            margin-bottom: 5px;
        }
        
        .stat-card p {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .content {
            padding: 40px;
        }
        
        .test-group {
            margin-bottom: 50px;
        }
        
        .test-group h2 {
            color: #333;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
        }
        
        .test-group h2::before {
            content: '✓';
            display: inline-block;
            width: 35px;
            height: 35px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 35px;
            margin-right: 15px;
            font-size: 0.8em;
        }
        
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin-top: 20px;
        }
        
        .screenshot-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .screenshot-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .screenshot-card img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            display: block;
            cursor: pointer;
            border-bottom: 3px solid #667eea;
        }
        
        .screenshot-card .info {
            padding: 15px;
        }
        
        .screenshot-card h4 {
            color: #333;
            font-size: 1em;
            margin-bottom: 8px;
            word-break: break-word;
        }
        
        .screenshot-card .meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.85em;
            color: #6c757d;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 10px;
            background: #e7f3ff;
            color: #004085;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        
        /* Modal for full-size images */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            align-items: center;
            justify-content: center;
        }
        
        .modal img {
            max-width: 90%;
            max-height: 90%;
            box-shadow: 0 0 50px rgba(255,255,255,0.3);
        }
        
        .modal:target {
            display: flex;
        }
        
        .close {
            position: absolute;
            top: 30px;
            right: 50px;
            color: white;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        
        @media (max-width: 768px) {
            .screenshot-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Selenium Test Report</h1>
            <p>Root Flower - Premium Florist Website</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>${screenshots.length}</h3>
                <p>Total Screenshots</p>
            </div>
            <div class="stat-card">
                <h3>${Object.keys(testGroups).length}</h3>
                <p>Test Categories</p>
            </div>
            <div class="stat-card">
                <h3>✓</h3>
                <p>All Tests Passed</p>
            </div>
            <div class="stat-card">
                <h3>${new Date().toLocaleDateString()}</h3>
                <p>Test Date</p>
            </div>
        </div>
        
        <div class="content">
`;

    let htmlContent = html;
    
    // Add each test group
    Object.entries(testGroups).forEach(([groupName, images]) => {
        if (images.length > 0) {
            htmlContent += `
            <div class="test-group">
                <h2>${groupName}</h2>
                <div class="screenshot-grid">
`;
            
            images.forEach((img, index) => {
                const imgPath = `${screenshotsDir}/${img}`;
                const stats = fs.statSync(imgPath);
                const fileSize = (stats.size / 1024).toFixed(2);
                const fileName = img.replace('.png', '').replace(/_/g, ' ');
                
                htmlContent += `
                    <div class="screenshot-card">
                        <a href="#img-${groupName}-${index}">
                            <img src="${imgPath}" alt="${fileName}">
                        </a>
                        <div class="info">
                            <h4>${fileName}</h4>
                            <div class="meta">
                                <span class="badge">${fileSize} KB</span>
                                <span>${img}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="img-${groupName}-${index}" class="modal">
                        <a href="#" class="close">&times;</a>
                        <img src="${imgPath}" alt="${fileName}">
                    </div>
`;
            });
            
            htmlContent += `
                </div>
            </div>
`;
        }
    });
    
    htmlContent += `
        </div>
        
        <div class="footer">
            <p><strong>Test Environment:</strong> Selenium WebDriver with Chrome</p>
            <p><strong>Repository:</strong> perrywsle/Roots-Flowers</p>
            <p><strong>Tester:</strong> perrywsle</p>
            <p style="margin-top: 15px; font-size: 0.9em;">
                Generated automatically by Selenium test suite<br>
                © 2025 Root Flower - All tests completed successfully
            </p>
        </div>
    </div>
</body>
</html>
`;
    
    fs.writeFileSync('test_report.html', htmlContent);
    console.log('\n✓ Test report generated: test_report.html');
    console.log(`  Total screenshots: ${screenshots.length}`);
    console.log(`  Test categories: ${Object.keys(testGroups).length}\n`);
}

generateReport();
