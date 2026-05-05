const http = require('http');
const fs = require('fs');
const url = require('url');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Перевіряємо метод та правильний маршрут
    if (req.method === 'GET' && parsedUrl.pathname === '/missing-file') {
        const fileName = parsedUrl.searchParams.get('fileName');

        // Якщо параметр fileName відсутній, повертаємо 400
        if (!fileName) {
            res.statusCode = 400;
            return res.end('Bad Request: fileName parameter is required\n');
        }

        // Створюємо стрім (навіть якщо файлу немає)
        const readStream = fs.createReadStream(fileName);

        // Перехоплюємо помилку стріму, без цього обробника сервер просто впаде з помилкою Unhandled 'error' event
        readStream.on('error', (err) => {
            console.error('Перехоплено помилку стріму:', err.message);
            
            // Повертаємо 500 та безпечне повідомлення, не розкриваючи деталей помилки клієнту
            if (!res.headersSent) {
                res.statusCode = 500;
                res.end('Internal Server Error: Could not stream the requested file\n');
            }
        });

        // Направляємо потік у відповідь
        readStream.pipe(res);

    } else {
        // Для інших маршрутів повертаємо 404
        res.statusCode = 404;
        res.end('Not Found\n');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});