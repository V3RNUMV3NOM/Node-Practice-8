const http = require('http');
const fs = require('fs');
const url = require('url');
const { Transform, pipeline } = require('stream');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Перевіряємо метод та маршрут /upper
    if (req.method === 'GET' && parsedUrl.pathname === '/upper') {
        const fileName = parsedUrl.searchParams.get('fileName');

        // Якщо fileName відсутній — 400
        if (!fileName) {
            res.statusCode = 400;
            return res.end('Bad Request: fileName is missing');
        }

        // Перевіряємо, чи файл існує і чи це дійсно файл
        fs.stat(fileName, (err, stats) => {
            if (err || !stats.isFile()) {
                res.statusCode = 400;
                return res.end('Bad Request: file does not exist');
            }

            res.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8'
            });

            // 1. Створюємо стрім для читання
            const readStream = fs.createReadStream(fileName);

            // 2. Створюємо стрім для трансформації (переведення у верхній регістр)
            const upperCaseTransform = new Transform({
                transform(chunk, encoding, callback) {
                    // Перетворюємо буфер у рядок, робимо великі літери і передаємо далі
                    this.push(chunk.toString().toUpperCase());
                    callback(); // Сигналізуємо, що обробку цього шматка завершено
                }
            });

            // 3. З'єднуємо все разом: Читання -> Трансформація -> Відповідь клієнту
            pipeline(readStream, upperCaseTransform, res, (err) => {
                if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
                    console.error('Помилка стрімінгу:', err);
                }
            });
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});