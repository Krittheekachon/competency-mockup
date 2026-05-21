import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ดึง Path ของโฟลเดอร์ปัจจุบันที่ไฟล์นี้ตั้งอยู่แบบแม่นยำ 100%
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = __dirname; // อ่านไฟล์จากโฟลเดอร์นี้แหละ!
const outputDir = path.join(__dirname, 'html-ready'); // สร้างโฟลเดอร์เซฟแยกไว้ให้

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {
    if (err) return console.error("อ่านโฟลเดอร์ไม่ได้:", err);

    let fileCount = 0;

    files.forEach(file => {
        // ดักจับเฉพาะไฟล์ที่เป็นข้อมูล (.json) และไม่ใช่อ่านตัว package.json ของระบบ
        if (path.extname(file) === '.json' && file !== 'package.json') { 
            try {
                const filePath = path.join(inputDir, file);
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const jsonData = JSON.parse(rawData);

                // สร้างโครงสร้าง HTML สำหรับเปิดโชว์ลูกค้า
                const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${jsonData.title || 'Preview งานลูกค้า'}</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; background: #f8f9fa; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h1 { color: #1a73e8; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-top: 0; }
        .content { font-size: 16px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${jsonData.title || file}</h1>
        <div class="content">
            ${jsonData.content || `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`}
        </div>
    </div>
</body>
</html>`;

                const outputFileName = path.basename(file, '.json') + '.html';
                fs.writeFileSync(path.join(outputDir, outputFileName), htmlContent);
                console.log(`✅ แปลงสำเร็จ: ${outputFileName}`);
                fileCount++;
            } catch (e) {
                console.log(`❌ ข้ามไฟล์ ${file} เนื่องจากไม่ใช่ JSON รูปแบบปกติ หรือไฟล์เสีย`);
            }
        }
    });

    if(fileCount === 0) {
        console.log("⚠️ ไม่พบไฟล์ .json สำหรับนำมาแปลงในโฟลเดอร์นี้เลยครับ (ลองเช็คดูว่าเอาไฟล์มาวางคู่กับ convert.js หรือยังนะ)");
    } else {
        console.log(`\n🎉 เรียบร้อย! รวมทั้งหมด ${fileCount} ไฟล์ ไปดูผลงานในโฟลเดอร์ 'html-ready' ได้เลยครับ!`);
    }
});