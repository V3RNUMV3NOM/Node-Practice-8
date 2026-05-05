const http = require('http');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/count') {
        let bytes = 0;
        let chunks = 0;

        // Подія 'data' спрацьовує щоразу, коли приходить новий шматочок даних
        req.on('data', (chunk) => {
            bytes += chunk.length; // Додаємо розмір поточного шматка в байтах
            chunks++;              // Збільшуємо лічильник шматків
        });

        // Подія 'end' спрацьовує, коли весь потік даних успішно прочитано
        req.on('end', () => {
            // Формуємо об'єкт із результатами
            const result = {
                bytes: bytes,
                chunks: chunks
            };

            // Встановлюємо правильний заголовок і відправляємо JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });

        // Обробка можливих помилок потоку
        req.on('error', (err) => {
            console.error('Помилка читання потоку:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        });

    } else {
        // Якщо маршрут або метод не збігаються, повертаємо 404
        res.statusCode = 404;
        res.end('Not Found\n');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});