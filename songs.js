const SONG_LIST = [
  {
    id: 'song1',
    title: 'キラキラ星',
    subtitle: '練習ステージ',
    image: 'images/song1.svg',
    notes: [
      { key: '1', time: 0.5 }, { key: '1', time: 1.25 }, { key: '5', time: 2.0 }, { key: '5', time: 2.75 },
      { key: '6', time: 3.5 }, { key: '6', time: 4.25 }, { key: '5', time: 5.0 },
      { key: '4', time: 6.0 }, { key: '4', time: 6.75 }, { key: '3', time: 7.5 }, { key: '3', time: 8.25 },
      { key: '2', time: 9.0 }, { key: '2', time: 9.75 }, { key: '1', time: 10.5 }
    ]
  },
  {
    id: 'song2',
    title: 'メリーさんのひつじ',
    subtitle: 'ステージ 2',
    image: 'images/song2.svg',
    notes: [
      { key: '3', time: 0.5 }, { key: '2', time: 1.25 }, { key: '1', time: 2.0 },
      { key: '2', time: 2.75 }, { key: '3', time: 3.5 }, { key: '3', time: 4.25 },
      { key: '3', time: 5.0 }, { key: '2', time: 6.0 }, { key: '2', time: 6.75 },
      { key: '2', time: 7.5 }, { key: '3', time: 8.25 }, { key: '5', time: 9.0 },
      { key: '5', time: 10.0 }, { key: '3', time: 11.0 }
    ]
  },
  {
    id: 'song3',
    title: 'ふるさと',
    subtitle: 'ステージ 3',
    image: 'images/song3.svg',
    notes: [
      { key: '1', time: 0.5 }, { key: '1', time: 1.25 }, { key: '5', time: 2.0 }, { key: '5', time: 2.75 },
      { key: '6', time: 3.5 }, { key: '6', time: 4.25 }, { key: '5', time: 5.0 },
      { key: '4', time: 6.0 }, { key: '4', time: 6.75 }, { key: '3', time: 7.5 }, { key: '3', time: 8.25 },
      { key: '2', time: 9.0 }, { key: '2', time: 9.75 }, { key: '1', time: 10.5 }, { key: '1', time: 11.75 },
      { key: '2', time: 12.5 }, { key: '3', time: 13.25 }, { key: '1', time: 14.0 }
    ]
  },
  {
    id: 'song4',
    title: 'ちょうちょう',
    subtitle: 'ステージ 4',
    image: 'images/song4.svg',
    notes: [
      { key: '5', time: 0.5 },  { key: '3', time: 1.25 }, { key: '3', time: 2.0 },
      { key: '4', time: 2.75 }, { key: '2', time: 3.5 },  { key: '2', time: 4.25 },
      { key: '1', time: 5.0 },  { key: '2', time: 5.75 }, { key: '3', time: 6.5 },
      { key: '4', time: 7.25 }, { key: '5', time: 8.0 },  { key: '5', time: 8.75 },
      { key: '5', time: 9.5 },  { key: '5', time: 10.5 }, { key: '3', time: 11.25 },
      { key: '3', time: 12.0 }
    ]
  },
  {
    id: 'song5',
    title: 'かえるの合唱',
    subtitle: 'ステージ 5',
    image: 'images/song5.svg',
    notes: [
      { key: '1', time: 0.5 },  { key: '2', time: 1.25 }, { key: '3', time: 2.0 },
      { key: '1', time: 2.75 }, { key: '1', time: 3.75 }, { key: '2', time: 4.5 },
      { key: '3', time: 5.25 }, { key: '1', time: 6.0 },  { key: '3', time: 7.0 },
      { key: '4', time: 7.75 }, { key: '5', time: 8.5 },  { key: '3', time: 9.5 },
      { key: '4', time: 10.25 },{ key: '5', time: 11.0 }, { key: '5', time: 12.0 },
      { key: '6', time: 12.5 }, { key: '5', time: 13.0 }, { key: '4', time: 13.5 },
      { key: '3', time: 14.0 }, { key: '1', time: 14.75 }
    ]
  },
  {
    id: 'song6',
    title: 'ジングルベル',
    subtitle: 'ステージ 6',
    image: 'images/song6.svg',
    notes: [
      { key: '3', time: 0.5 },   { key: '3', time: 1.0 },   { key: '3', time: 1.75 },
      { key: '3', time: 2.75 },  { key: '3', time: 3.25 },  { key: '3', time: 4.0 },
      { key: '3', time: 5.0 },   { key: '5', time: 5.5 },   { key: '1', time: 6.0 },
      { key: '2', time: 6.5 },   { key: '3', time: 7.25 },
      { key: '4', time: 8.5 },   { key: '4', time: 9.0 },   { key: '4', time: 9.5 },
      { key: '4', time: 10.0 },  { key: '4', time: 10.75 }, { key: '3', time: 11.25 },
      { key: '3', time: 11.75 }, { key: '3', time: 12.25 },
      { key: '5', time: 13.0 },  { key: '5', time: 13.5 },  { key: '4', time: 14.0 },
      { key: '2', time: 14.5 },  { key: '1', time: 15.25 }
    ]
  },
  {
    id: 'song7',
    title: '歓喜の歌',
    subtitle: 'ステージ 7',
    image: 'images/song7.svg',
    notes: [
      { key: '3', time: 0.5 },   { key: '3', time: 1.25 },  { key: '4', time: 2.0 },
      { key: '5', time: 2.75 },  { key: '5', time: 3.5 },   { key: '4', time: 4.25 },
      { key: '3', time: 5.0 },   { key: '2', time: 5.75 },  { key: '1', time: 6.5 },
      { key: '1', time: 7.25 },  { key: '2', time: 8.0 },   { key: '3', time: 8.75 },
      { key: '3', time: 9.5 },   { key: '2', time: 10.5 },  { key: '2', time: 11.25 }
    ]
  },
  {
    id: 'song8',
    title: '夢をかなえてドラえもん',
    subtitle: 'ステージ 8（メロディは仮）',
    image: 'images/song8.svg',
    notes: [
      { key: '1', time: 0.5 },   { key: '3', time: 1.0 },   { key: '5', time: 1.5 },
      { key: '3', time: 2.0 },   { key: '5', time: 2.5 },   { key: '6', time: 3.0 },
      { key: '5', time: 3.5 },   { key: '3', time: 4.0 },
      { key: '4', time: 4.75 },  { key: '4', time: 5.25 },  { key: '3', time: 5.75 },
      { key: '2', time: 6.25 },  { key: '1', time: 6.75 },
      { key: '3', time: 7.5 },   { key: '5', time: 8.0 },   { key: '6', time: 8.5 },
      { key: '5', time: 9.0 },   { key: '4', time: 9.5 },   { key: '3', time: 10.0 },
      { key: '2', time: 10.5 },  { key: '1', time: 11.25 }
    ]
  },
  {
    id: 'song9',
    title: 'ドラゴンクエスト 序曲',
    subtitle: 'ステージ 9（メロディは仮）',
    image: 'images/song9.svg',
    notes: [
      { key: '5', time: 0.5 },   { key: '8', time: 1.5 },   { key: '7', time: 2.25 },
      { key: '6', time: 2.75 },  { key: '8', time: 3.5 },   { key: '7', time: 4.25 },
      { key: '6', time: 4.75 },  { key: '5', time: 5.5 },
      { key: '6', time: 6.0 },   { key: '7', time: 6.5 },   { key: '8', time: 7.0 },
      { key: '5', time: 8.0 },   { key: '6', time: 8.5 },   { key: '7', time: 9.0 },
      { key: '8', time: 9.75 },  { key: '7', time: 10.5 },  { key: '5', time: 11.25 },
      { key: '3', time: 12.25 }, { key: '5', time: 12.75 }, { key: '1', time: 13.5 },
      { key: '8', time: 14.25 }
    ]
  }
];
