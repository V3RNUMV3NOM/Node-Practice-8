const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// Отримуємо порт з аргументів командного рядка
const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    // Парсимо URL для отримання query-параметрів
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Перевіряємо метод та шлях
    if (req.method === 'GET' && parsedUrl.pathname === '/file') {
    const fileName = parsedUrl.searchParams.get('fileName');

        // Якщо параметр fileName відсутній, повертаємо 400
        if (!fileName) {
            res.statusCode = 400;
            return res.end('Bad Request: fileName is missing');
        }

        // Формуємо повний шлях до файлу в поточній директорії
        const filePath = path.join(process.cwd(), fileName);
        
        // Створюємо readable stream
        const readStream = fs.createReadStream(filePath);

        // Подія 'open' гарантує, що файл існує і готовий до читання
        readStream.on('open', () => {
            res.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            // Перенаправляємо потік у відповідь
            readStream.pipe(res);
        });

        // Обробка помилок (наприклад, якщо файлу не існує)
        readStream.on('error', (err) => {
            if (err.code === 'ENOENT') {
                // Файл не знайдено — повертаємо 400
                res.statusCode = 400;
                res.end('Bad Request: file does not exist');
            } else {
                // Інші можливі помилки сервера
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        });
    } else {
        // Обробка інших маршрутів
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});