const http = require('http');
const fs = require('fs');

// Отримуємо порт з аргументів (або використовуємо 3000 за замовчуванням)
const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
    // Перевіряємо, чи це POST-запит на маршрут /upload
    if (req.method === 'POST' && req.url === '/upload') {
        // Створюємо Writable Stream для запису у файл upload.txt
        const writeStream = fs.createWriteStream('upload.txt');

        // Перенаправляємо вхідний потік даних (тіло запиту) у файл
        req.pipe(writeStream);

        // Коли запис успішно завершено, повертаємо статус 200
        writeStream.on('finish', () => {
            res.statusCode = 200;
            res.end('File uploaded successfully\n');
        });

        // Обробка помилок запису
        writeStream.on('error', (err) => {
            console.error('Помилка запису файлу:', err);
            res.statusCode = 500;
            res.end('Internal Server Error\n');
        });

    } else {
        // Для будь-яких інших маршрутів або методів повертаємо 404
        res.statusCode = 404;
        res.end('Not Found\n');
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});