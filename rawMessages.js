const messages = [
    {
        id: 'message#1',
        type: 'text',
        content: 'Тестовое сообщение с тестовой ссылкой https://www.google.com/',
        coords: {
            lat: 51.50851,
            lon: -0.12572,
        },
        timestamp: '28.02.22 19:42',
        pinned: false,
        favorite: false,
    },
    {
        id: 'message#2',
        type: 'image',
        name: 'ocean.png',
        link: 'public/ocean.png',
        coords: {
            lat: 51.50851,
            lon: -0.12572,
        },
        timestamp: '28.02.22 19:42',
        pinned: false,
        favorite: true,
    },
    {
        id: 'message#3',
        type: 'audio',
        name: '00199.mp3',
        link: 'public/00199.mp3',
        coords: {
            lat: 51.50851,
            lon: -0.12572,
        },
        timestamp: '228.02.22 19:42',
        pinned: false,
        favorite: true,
    },
    {
        id: 'message#4',
        type: 'video',
        name: 'Sea - 24216.mp4',
        link: 'public/Sea - 24216.mp4',
        coords: {
            lat: 51.50851,
            lon: -0.12572,
        },
        timestamp: '28.02.22 19:42',
        pinned: false,
        favorite: true,
    },
    {
        id: 'message#5',
        type: 'text',
        content: 'Тестовое сообщение с тестовой ссылкой https://meduza.io/',
        coords: {
            lat: 51.50851,
            lon: -0.12572,
        },
        timestamp: '28.02.22 19:42',
        pinned: false,
        favorite: false,
    },
];

module.exports = messages;