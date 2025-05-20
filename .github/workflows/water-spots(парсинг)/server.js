// Импорт и конфигурация
require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');
const _ = require('lodash');
const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const app = express();
const TIME_API_KEY = process.env.YANDEX_TIME_API_KEY;
const MAIN_API_KEY = process.env.YANDEX_API_KEY;

app.use(cors());
app.use(express.json());

// Конфигурация видов спорта
const SPORT_CATEGORIES = {
  /*swimming: {
      searchTerms: [
      'спортивный бассейн москва',
      'бассейн фитнес центр',
      'школа плавания',
      'водноспортивный комплекс',
      'центр плавания',
      'олимпийский бассейн',
      'плавательный центр',
      'спортивный бассейн',
      'центр плавания',
      'фитнес бассейн',
      'школа плавания',
      'водный комплекс',
      'плавательный центр',
      'бассейн с дорожками',
      'открытый бассейн',
      'бассейн олимпийский',
      'бассейн с тренером'
      ],
    subcategories: ['swimming', 'water_polo', 'synchronized_swimming', 'aqua_aerobics', 'diving'],
    emoji: '🏊',
    qualityFilters: {
      required: ['бассейн для плавания', 'водный комплекс', 'школа плавания', 'плавательный', 'бассейн', 'Дайвинг', 'бассейн', 'плаван', 'водный комплекс', 'центр', 'школа', 'спорткомплекс', 'олимпийский'],
      recommended: ['оборудован', 'раздевалка', 'личный тренер', 'Спортивный комплекс', 'Спортивная школа', 'Спортивный клуб, секция', 'Школа плавания', 'Фитнес-клуб', 'Товары для подводного плавания', 'погружение', 'гидрокостюм', 'спортивное объединение'],
      minRating: 3.6
    },
    examples: ['Буревестник Москва', 'Чайка Москва', 'Акватория Зил', 'ФОК Северное Тушино', 'Московский спорткомплекс Олимпийский']
  },*/
  paddle_sports: {
    searchTerms: [
      'каякинг',
      'сапсерфинг',
      'гребля на каноэ',
      'рафт клуб',
      'гребля на байдарок',
      'сап-клуб',
      'прокат сапов',
      'станция сап серфинга',
      'гребная база',
      'байдарочный клуб',
      'рафтинг клуб',
      'сап прокат',
      'маршрут на байдарке',
      'школа сап серфинга',
      'гребной центр',
      'сплав на байдарках', 
      'каяк тур', 
      'маршруты для сапборда',
      'каяк кемпинг', 
      'аренда каяков', 
      'туры на байдарках',
      'сплав по рекам', 
      'каяк станция', 
      'сап экскурсии',
      'гребной спорт', 
      'походы на каяках', 
      'каяк парк',
      'водные маршруты', 
      'каяк прокат у воды', 
      'сап походы',
      'покататься на сапе',
      'туры на сапбордах',
      'водные экскурсии на сапах',
      'аренда сапборда с веслом',
      'обучение сапсерфингу',
      'сап с инструктором',
      'сап тур на рассвете',
      'сап центр',
      'сап маршруты у воды',
      'клуб по сапсерфингу',
      'сплавы на воде',
      'байдарочный маршрут',
      'тур выходного дня на сапе',
      'школа гребли на каяках',
      'аренда водного оборудования',
      'поход с байдарками',
      'гребной клуб у реки',
      'гидросап станция',
      'река для сап прогулок',
      'учебный тур на байдарке',
      'водные туры на каяках',
      'водная станция сап',
      'сап с видами на природу',
      'водный маршрут с байдарками',
      'школа водной гребли',
      'сап лагерь',
      'водный поход по реке',
      'сап сплав для начинающих',
      'байдарки выходного дня',
      'сап доска на прокат',
      'водный маршрут выходного дня',
      'тур на сапах с ночёвкой',
      'поход на каяках с палатками',
      'экскурсия на байдарках с гидом',
      'сплав по природным маршрутам',
      'активный отдых на воде',
      'водные походы для новичков',
      'сап-кемпинг с ночёвкой'
    ],
    subcategories: ['kayaking', 'sup', 'canoe', 'rowing', 'rafting'],
    emoji: '🛶',
    qualityFilters: {
      required: ['каяк', 'сапсерфинг', 'рафт', 'байдарка', 'паддл', 'станция', 'прокат', 'прокат каяков', 'сап-борд', 'сап-доски', 'сап борд', 'сап доски', 'водные прогулки', 'рафтигнг', 'лодочная станция', 'водная база', 'Гребная база', 'Центр гребли на байдарках и каноэ', 'Центр гребли на байдарках', 'Центр гребли на каноэ', 'База Гребли', 'водные прогулки', 'рафтинг' ],
      recommended: ['маршрут', 'инструктор', 'снаряжение', 'аренда', 'Пункт проката', 'квадромаршруты', 'Спортивная база'],
    },
    examples: ['Бугазская коса', 'Река Белая', 'Ладожские шхеры']
  },
  sailing: {
    searchTerms: [
      'парусный спорт', 
      'виндсерфинг',
      'кайтсерфинг',
      'яхтинг',
      'яхт клуб',
      'парусный клуб',
      'виндсерфинг школа',
      'марина для яхт',
      'парусная школа',
      'клуб кайтсерфинга',
      'причал парусных яхт',
      'яхтенная стоянка',
      'яхтенная школа',
      'виндсерф станция',
      'аренда парусника', 
      'обучение яхтингу', 
      'парусные гонки',
      'круизы на яхте', 
      'школа виндсерфинга', 
      'кайт станция',
      'яхтенная база', 
      'пристань для яхт', 
      'парусные экскурсии',
      'морские прогулки под парусом', 
      'аренда катамарана',
      'рейсы на паруснике', 
      'бухты для яхтинга', 
      'марины черноморья',
      'яхтинг с капитаном',
      'морская прогулка на катамаране',
      'яхт школа на берегу',
      'школа парусного спорта для детей',
      'парусная школа для начинающих',
      'яхта на прокат с капитаном',
      'обучение в яхтенном центре',
      'парусный туризм на юге',
      'яхт-круизы по черному морю',
      'яхтинг выходного дня',
      'виндсерфинг на море',
      'обучение парусному спорту',
      'морская прогулка под парусом',
      'виндсерфинг прокат',
      'катамаран аренда',
      'яхта для праздника',
      'яхт экскурсии',
      'яхт тур с ночевкой',
      'яхтенная практика',
      'центр парусного обучения',
      'яхт школа в Сочи',
      'яхтенное плавание',
      'школа мореплавания',
      'клуб виндсерфинга',
      'аренда лодок под парусом',
      'виндсерфинг уроки',
      'яхта на день',
      'парусная прогулка с фото',
      'яхт школа на озере',
      'яхта для фотосессии',
      'яхта в аренду с шкипером',
      'яхтенные маршруты на выходные',
      'обучение парусному спорту для взрослых',
      'яхтинг по черноморскому побережью',
      'море и паруса тур',
      'яхтинг с проживанием',
      'прогулка под парусом с фото',
      'яхтинг и обучение на борту'
    ],
    subcategories: ['sailing', 'windsurfing', 'kitesurfing', 'yachting'],
    emoji: '⛵',
    qualityFilters: {
      required: ['яхт', 'марина', 'парус', 'виндсерф', 'кайт', 'виндсерфинг', 'кайтсерфинг', 'Кайт станция', 'кайт станция', 'винд станция', 'Винд станция', 'Яхт-клуб', 'яхт-клуб', 'аренда катеров', 'аренда лодок', 'аренда яхт', 'Аренда парусной яхты'],
      recommended: ['аренда', 'обучение', 'инструктор', 'спортииавня база', 'водная база', 'лодочная станция'],
    },
    examples: ['Марина Сочи', 'Бухта Песчаная', 'Онежское озеро']
  },
  motor_sports: {
    searchTerms: [
      'водные лыжи',
      'вейкбординг',
      'аквабайк',
      'парасейлинг',
      'вейк парк',
      'прокат аквабайков',
      'станция водных лыж',
      'водно-моторный клуб',
      'вейкборд станция',
      'прокат катеров',
      'трасса для вейка',
      'аквабайк клуб',
      'клуб водных лыж',
      'мотобот центр',
      'вейк парк на воде', 
      'катание на гидроциклах', 
      'аренда вейкборда',
      'водно-моторные виды спорта', 
      'дрифт на гидроциклах',
      'аквабайк прокат', 
      'водные аттракционы', 
      'буксировка на воде',
      'флайборд клуб', 
      'водные скутеры', 
      'мотосерфинг',
      'акваскипер', 
      'водные мотоциклы', 
      'экстремальные водные развлечения',
      'гидроцикл напрокат',
      'покататься на аквабайке',
      'станция вейкбординга',
      'аренда флайборда и гидроцикла',
      'водные лыжи с инструктором',
      'прокат водной техники',
      'экстремальные водные развлечения',
      'аренда лодок и катеров',
      'прокат катера с капитаном',
      'станция флайборда',
      'катание за катером',
      'аквабайк на море',
      'катание по волнам',
      'флайборд на прокат',
      'станция водных видов спорта',
      'школа вейксерфинга',
      'аренда скоростного катера',
      'покататься на скутере по воде',
      'прокат вейкборда с трассой',
      'мотосерфинг на волнах',
      'катание на флайборде',
      'катера для прогулок',
      'аренда экстремальной техники',
      'станция мотосерфинга',
      'взять гидроцикл в аренду',
      'доска для вейка прокат',
      'аквабайк обучение',
      'гидроцикл с инструктором',
      'аренда вейк парка',
      'доска вейкборд аренда',
      'гидроцикл экскурсия',
      'прокат вейкборда и обучение',
      'водный спорт с мотором',
      'экстремальные водные туры',
      'водное сафари на гидроциклах',
      'катание на вейке с тренером'

    ],
    subcategories: ['water_skiing', 'wakeboarding', 'aquabike', 'parasailing'],
    emoji: '🛥️',
    qualityFilters: {
      required: ['вейк', 'аквабайк', 'водные лыжи', 'парасейл', 'база', 'станция', 'трасса', 'прокат', 'вейкбординг', 'водные лыжи', 'аквабайк', 'парасейлинг', 'Вейк-клуб', 'прокат водных лыж', 'прокат электровелосипеда на воде', 'вейкборд', 'вейк за катером', 'вейксерфинг', 'вейксерфинг за катером', 'вейкбординг за катером', 'вейксёрф', 'вейксерф', 'вейк-клуб', 'серфинг', 'аренда гидроцикла', 'гидроцикл', 'аквабайк', 'гидроциклы', 'водная техника', 'аренда аквабайка', 'прокат гидроциклов', 'аренда катера', 'прокат катера', 'парасейлинг'],
      recommended: ['оборудован', 'инструктор', 'парк', 'аренда', 'пункт проката', 'водная техника', 'спортивная база', 'водные прогулки', 'лодочная станция', 'водная база', 'Аэроклуб', 'Водная техника', 'вездеходы', 'квадроциклы', 'аэроклуб', 'полет на парашюте', 'яхт-клуб', 'водыне прогулки'],
    },
    examples: ['Вейк-парк Дон', 'Аквабайк клуб Геленджик']
  }
};

// Инициализация приложения
const port = process.env.PORT || 3000;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const getOrganizationDetails = async (orgName) => {
  try {
    const response = await axios.get('https://search-maps.yandex.ru/v1/', {
      params: {
        text: orgName,
        lang: 'ru_RU',
        type: 'biz',
        apikey: TIME_API_KEY, // Используем переменную напрямую
        results: 1
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'YourApp/1.0'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.features) {
      console.log('Некорректный ответ от API Яндекса');
      return null;
    }

    const features = response.data.features;
    if (features.length > 0) {
      const companyMeta = features[0].properties.CompanyMetaData;
      const hours = companyMeta?.Hours?.Availabilities;
      const opening_hours = {
        mon: 'Расписание не указано',
        tue: 'Расписание не указано',
        wed: 'Расписание не указано',
        thu: 'Расписание не указано',
        fri: 'Расписание не указано',
        sat: 'Расписание не указано',
        sun: 'Расписание не указано'
      };
      if (hours) {
        hours.forEach(entry => {
          if (entry.Days) {
            entry.Days.forEach(day => {
              const d = day.toLowerCase();
              if (entry.Intervals?.length > 0) {
                opening_hours[d] = `${entry.Intervals[0].from}-${entry.Intervals[0].to}`;
              } else {
                opening_hours[d] = 'Выходной';
              }
            });
          }
        });
      }
      return opening_hours;
    }
    return null;
  } catch (err) {
    console.error('Ошибка получения расписания:', err.response?.data || err.message);
    return null;
  }
};

const prepareSpotData = async (feature, sportType, config) => {
  try {
    const properties = feature.properties;
    const geometry = feature.geometry;
    const name = properties.name || 'Без названия';
    const rating = parseFloat(properties.CompanyMetaData?.Features?.rating || 4.0);
    const description = properties.description || '';
    const address = properties.CompanyMetaData?.address_details || {};

    const requiredMatches = config.qualityFilters.required.filter(term => name.toLowerCase().includes(term));
    const recommendedMatches = config.qualityFilters.recommended.filter(term => name.toLowerCase().includes(term));

    return {
  name,
  lat: parseFloat(geometry.coordinates[1]),
  lon: parseFloat(geometry.coordinates[0]),
  rating,
  address: {
    country: address.Components.find(c => c.kind === 'country')?.name || '1',
    region: address.Components.find(c => c.kind === 'province')?.name || '1',
    city: address.Components.find(c => c.kind === 'locality')?.name ||
          address.Components.find(c => c.kind === 'area')?.name ||
          address.Components.find(c => c.kind === 'province')?.name || '1',
    district: address.Components.find(c => c.kind === 'district')?.name || '1',
    full_address: description || '1'
  },
  categories: [sportType, ...config.subcategories],
  qualityScore: requiredMatches.length > 0 ? (recommendedMatches.length > 1 ? 2 : 1) : 1,
  opening_hours: await getOrganizationDetails(name) || {
    mon: '1', tue: '1', wed: '1', thu: '1', fri: '1', sat: '1', sun: '1'
  }
};
  } catch (error) {
    console.error('Geocoder error:', error.message);
    return null;
  }
};

// Поиск через Геокодер (только Россия)
const searchWithGeocoder = async (query, sportType) => {
  try {
    const config = SPORT_CATEGORIES[sportType];

    const response = await axios.get('https://search-maps.yandex.ru/v1/', {
      params: {
        text: query,
        type: 'biz',
        lang: 'ru_RU',
        results: 50,
        apikey: MAIN_API_KEY // используй основной ключ API
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WaterSportSearchBot/1.0'
      },
      timeout: 7000
    });

    const features = response.data.features;

    const spotPromises = features.map(async (feature) => {
      const properties = feature.properties;
      const geometry = feature.geometry;
      const name = properties.name || query;
      const description = properties.description || '';
      const lowerName = name.toLowerCase();
      const lowerDesc = description.toLowerCase();

      const BLACKLIST = [
        'пруд', 'река', 'озеро', 'перевал', 'урочище', 'жилой комплекс',
        'улица', 'село', 'поселок', 'гаражи', 'ферма', 'днп', 'гаражный кооператив'
      ];

      const WHITELIST = [
        'яхт', 'парус', 'сап', 'катер', 'рафт', 'гребная база', 'клуб', 'лодочная станция',
        'станция', 'прокат', 'аренда', 'аквабайк', 'вейк', 'водные лыжи', 'мотоспорт'
      ];

      // Фильтрация по ключевым словам
      if (BLACKLIST.some(term => lowerName.includes(term) || lowerDesc.includes(term))) {
        return null;
      }

      if (!WHITELIST.some(term => lowerName.includes(term) || lowerDesc.includes(term))) {
        return null;
      }

      const requiredMatches = config.qualityFilters.required.filter(term =>
        lowerName.includes(term) || lowerDesc.includes(term)
      );

      const recommendedMatches = config.qualityFilters.recommended.filter(term =>
        lowerName.includes(term) || lowerDesc.includes(term)
      );

      const passesSoftFilter = requiredMatches.length > 0 ||
        recommendedMatches.length >= 2 ||
        lowerName.length >= 10;

      if (!passesSoftFilter) {
        console.log(`⚠️ Пропущено по фильтру: ${name}`);
        return null;
      }

      const address = properties.CompanyMetaData?.address_details || {};
      const rating = parseFloat(properties.CompanyMetaData?.Features?.rating || 4.0);
      const opening_hours = await getOrganizationDetails(name);

      return {
        name,
        lat: parseFloat(geometry.coordinates[1]),
        lon: parseFloat(geometry.coordinates[0]),
        rating,
        address: {
          country: address.Components?.find(c => c.kind === 'country')?.name || '1',
          region: address.Components?.find(c => c.kind === 'province')?.name || '1',
          city: address.Components?.find(c => c.kind === 'locality')?.name ||
                address.Components?.find(c => c.kind === 'area')?.name ||
                address.Components?.find(c => c.kind === 'province')?.name || '1',
          district: address.Components?.find(c => c.kind === 'district')?.name || '1',
          full_address: properties.description || '1'
        },
        categories: [sportType, ...config.subcategories],
        qualityScore: requiredMatches.length > 0 ? (recommendedMatches.length > 1 ? 2 : 1) : 1,
        opening_hours: opening_hours || {
          mon: '1', tue: '1', wed: '1', thu: '1', fri: '1', sat: '1', sun: '1'
        }
      };
    });

    const spots = (await Promise.all(spotPromises))
      .filter(s => s !== null)
      .sort((a, b) => b.qualityScore - a.qualityScore);

    console.log(`🔎 Найдено ${spots.length} организаций для "${query}" через Search API`);
    return spots;

  } catch (error) {
    console.error('❌ Ошибка поиска по организациям:', error.message);
    return [];
  }
};


//Сохранение спотов в базу данных
const saveSpots = async (spots) => {
  const client = await pool.connect();
    
  // Черный список - точные совпадения (чувствительные к регистру)
    const HARD_BLACKLIST = [
      'Клуб'
    ];
    
    const SOFT_BLACKLIST = [
      'разведения рыбы', 'гаэс', 'пруд', 'река', 'озеро', 'отстойник',
      'технич', 'водоём', 'ферма', 'перевал', 'ущелье', 'хребет',
      'район', 'урочище', 'остров', 'квартал', 'местное название',
      'исторический', 'бассеин фер', 'центральный', 'школа', 'гидроэлектростанция',
      'центр', 'центральная', 'поселок', 'гора', 'база отдыха', 'промышленная база', 'остановочный пункт', 'дачное некоммерческое партнёрство',
      'проспект клуб', 'загородный клуб', 'территория спортивный клуб', 'пмс', 'днп', 'территория',
      'спортивный клуб', 'загородный', 'проспект', 'остановочный', 'промышленная'
    ];
  
    const WHITELIST = [
      'станция', 'база', 'клуб', 'яхт', 'лодочная станция', 'парус', 'сап',
      'виндсерф', 'винд', 'гребная база', 'центр плавания', 'школа плавания',
      'аквабайк', 'вейк', 'водный комплекс', 'спорткомплекс', 'аренда яхт',
      'катера', 'инструктор', 'флотилия', 'причал', 'прокат', 'лагерь', 'обучение',
      'яхтенная школа', 'сап-клуб', 'гребной клуб', 'прокат сапов', 'станция сапсерфинга',
      'яхт-центр', 'фитнес-бассейн', 'серф-клуб', 'спортивная база', 'водная станция', 'спортивный центр', 'яхтенный клуб'
    ];

    const WATER_TERMS = [
      'водн', 'яхт', 'парус', 'катер', 'лодк', 'греб', 'байдар', 'каяк', 
      'сап', 'рафт', 'серф', 'аква', 'плав', 'море', 'речн', 'озер',
      'гидро', 'вейк', 'сноркл', 'дайв', 'рыб', 'водо', 'причал', 'марин'
    ];
  
    try {
      await client.query('BEGIN');
  
      for (const spot of spots) {
        const spotName = spot.name;
        const lowerSpotName = spotName.toLowerCase();
  
        // 1. Жесткая проверка на точные совпадения с черным списком
        if (HARD_BLACKLIST.includes(spotName)) {
          console.log(`⛔ Пропущено (точное совпадение с черным списком): ${spotName}`);
          continue;
        }
  
        // 2. Проверка на "просто Клуб" (одно слово)
        if (spotName.trim() === 'Клуб') {
          console.log(`⛔ Пропущено (просто "Клуб"): ${spotName}`);
          continue;
        }
  
        // 3. Проверка на частичные совпадения с черным списком
        const isSoftBlacklisted = SOFT_BLACKLIST.some(term => 
          lowerSpotName.includes(term.toLowerCase())
        );
        
        if (isSoftBlacklisted) {
          console.log(`⛔ Пропущено (частичное совпадение с черным списком): ${spotName}`);
          continue;
        }
  
        // 4. Новая улучшенная проверка для яхт-клубов
        const isYachtClub = /яхт[-\s]?клуб/i.test(spotName);
      
        if (isYachtClub) {
          // Разрешаем все вариации написания яхт-клубов
          console.log(`✅ Разрешён яхт-клуб: ${spotName}`);
        } 
        // 5. Проверка для обычных клубов (должны содержать водные термины)
        else if (/клуб/i.test(spotName)) {
        const hasWaterTerms = WATER_TERMS.some(term => 
          lowerSpotName.includes(term.toLowerCase())
        );
        
        if (!hasWaterTerms) {
          console.log(`⛔ Пропущено (клуб без водных терминов): ${spotName}`);
          continue;
        }
      }

      // Проверка существования по названию и координатам
      const existing = await client.query(
        `SELECT id FROM spots 
         WHERE (name = $1 OR (lat BETWEEN $2-0.01 AND $2+0.01 
         AND lon BETWEEN $3-0.01 AND $3+0.01))
         LIMIT 1`,
        [spot.name, spot.lat, spot.lon]
      );

      if (existing.rows.length > 0) {
        console.log(`♻ Дубликат: ${spot.name}`);
        continue;
      }

      // Вставка новой записи
      const res = await client.query(
        `INSERT INTO spots (name, lat, lon, rating, quality_score, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [spot.name, spot.lat, spot.lon, spot.rating, spot.qualityScore]
      );

      // Получаем ID вставленной записи
      const spotId = res.rows[0].id;

      // Сохранение адреса
      await client.query(
        `INSERT INTO spot_address 
         (spot_id, country, region, city, district, full_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          spotId,
          spot.address.country,
          spot.address.region,
          spot.address.city,
          spot.address.district,
          spot.address.full_address
        ]
      );

      // Сохранение категорий
      for (const category of _.uniq(spot.categories)) {
        await client.query(
          `INSERT INTO spot_categories (spot_id, category) VALUES ($1, $2)`,
          [spotId, category]
        );
      }

      // Сохранение расписания
      if (spot.opening_hours) {
        for (const [day, label] of Object.entries(spot.opening_hours)) {
          await client.query(
            `INSERT INTO spot_schedule (spot_id, weekday, time_label)
             VALUES ($1, $2, $3)`,
            [spotId, day, label]
          );
        }
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('DB error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};
  
// Основной процесс обновления
const refreshAllSports = async () => {
  try {
    console.log('🔄 Начало обновления качественных спотов...');
    
    for (const [sportType, config] of Object.entries(SPORT_CATEGORIES)) {
      console.log(`\n🔍 Поиск лучших мест для: ${sportType} (${config.emoji})`);
      
      // Сначала ищем по конкретным примерам
      for (const example of config.examples) {
        const spots = await searchWithGeocoder(example, sportType);
        if (spots.length) {
          await saveSpots(spots);
          console.log(`⭐ Найдено премиум: ${spots.length} для "${example}"`);
        }
      }
      
      // Затем общий поиск
      for (const query of config.searchTerms) {
        const spots = await searchWithGeocoder(query, sportType);
        if (spots.length) {
          await saveSpots(spots);
          console.log(`✅ Найдено: ${spots.length} для "${query}"`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка 1 сек
      }
    }
    
    console.log('\n🎉 Все споты обновлены!');
  } catch (err) {
    console.error('❌ Ошибка при обновлении спотов:', err);
  }
};

// API Endpoints
app.get('/spots/all', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        s.id, s.name, s.lat, s.lon,
        TO_CHAR(s.created_at, 'DD.MM.YYYY HH24:MI') AS created_at,
        COALESCE(sa.country, '1') AS country,
        COALESCE(sa.region, '1') AS region,
        COALESCE(sa.city, '1') AS city,
        COALESCE(sa.district, '1') AS district,
        COALESCE(sa.street, '1') AS street,
        COALESCE(sa.full_address, '1') AS full_address,
        COALESCE(
          (SELECT JSONB_AGG(sc.category) 
           FROM spot_categories sc 
           WHERE sc.spot_id = s.id),
          '[]'::JSONB
        ) AS categories
      FROM spots s
      JOIN spot_address sa ON s.id = sa.spot_id
      ORDER BY s.created_at DESC
    `);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/spots/by-region', async (req, res) => {
  try {
    const { region } = req.query;
    const { rows } = await pool.query(`
      SELECT 
        s.id, s.name, s.lat, s.lon,
        sa.city, sa.region,
        array_agg(sc.category) as categories
      FROM spots s
      JOIN spot_address sa ON s.id = sa.spot_id
      LEFT JOIN spot_categories sc ON s.id = sc.spot_id
      WHERE sa.region = $1
      GROUP BY s.id, sa.city, sa.region
    `, [region]);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Запуск сервера
const startServer = async () => {
  try {
    // Проверка подключения к БД
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL подключен');
    
    // Первое обновление данных
    await refreshAllSports();
    
    // Планировщик ежедневного обновления
    schedule.scheduleJob('0 6 * * *', () => {
      console.log('\n⏰ Ежедневное обновление данных...');
      refreshAllSports();
    });

    app.listen(port, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Ошибка запуска:', err);
    process.exit(1);
  }
};

startServer();