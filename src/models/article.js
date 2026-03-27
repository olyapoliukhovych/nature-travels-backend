import { model, Schema } from 'mongoose';
import { COLLECTIONS } from '../constants/collections.js';

const articleSchema = new Schema(
  {
    img: {
      type: String,
      required: true,
    },
    category: { type: String, required: true, ref: COLLECTIONS.CATEGORY },
    title: { type: String, required: true, trim: true },
    article: { type: String, required: true, trim: true },
    rate: { type: Number, default: 0 },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true,
    },
    date: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Article = model(COLLECTIONS.ARTICLE, articleSchema);

/*
"_id": {
    "$oid": "68498236a100312bea045fe6"
  },
  "img": "https://ftp.goit.study/img/green-tourism/68498236a100312bea045fe6.webp",
  "title": "Національний парк «Деснянсько-Старогутський»: перлина Сумщини",
  "article": "Національний природний парк «Деснянсько-Старогутський» — це мальовничий куточок Сумщини, де збереглися рідкісні види рослин і тварин. Його територія охоплює ліси, болота та долини річки Десни. Туристи можуть пройти екостежками, побачити гнізда чорного лелеки та послухати спів численних пташиних зграй. Парк відомий своєю тишею й атмосферою, що дозволяє повністю відпочити від міської метушні. Для відвідувачів облаштовані місця для кемпінгу, а місцеві гіди проводять пізнавальні екскурсії. Окрім природних багатств, парк має й культурне значення: тут можна побачити старовинні поселення та археологічні пам’ятки. «Деснянсько-Старогутський» — це перлина Полісся, яка відкриває красу й багатство української природи.",
  "category": {
    "$oid": "6966a5cdbc1b90f344c2e0be"
  },
  "rate": 14,
  "ownerId": {
    "$oid": "6881563901add19ee16fd013"
  },
  "date": "2025-09-20"
*/
