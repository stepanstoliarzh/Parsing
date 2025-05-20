-- Удаление старых таблиц
DROP TABLE IF EXISTS spot_categories;
DROP TABLE IF EXISTS spot_address;
DROP TABLE IF EXISTS spots;

-- Создание основной таблицы spots
CREATE TABLE spots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы адресов
CREATE TABLE spot_address (
  spot_id INTEGER NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  country VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  city VARCHAR(100),
  district VARCHAR(100),
  street VARCHAR(100),
  full_address TEXT NOT NULL,
  PRIMARY KEY (spot_id)
);

-- Создание таблицы категорий
CREATE TABLE spot_categories (
  spot_id INTEGER NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  PRIMARY KEY (spot_id, category)
);

-- Таблица графика работы
CREATE TABLE spot_schedule (
  id SERIAL PRIMARY KEY,
  spot_id INTEGER NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  weekday VARCHAR(3) NOT NULL CHECK (weekday IN ('mon','tue','wed','thu','fri','sat','sun')),
  time_label TEXT NOT NULL -- Пример: '11:00–20:00' или 'Выходной'
);

-- Индексы
CREATE INDEX idx_spots_coords ON spots(lat, lon);
CREATE INDEX idx_spot_categories ON spot_categories(category);
CREATE INDEX idx_spot_address_country ON spot_address(country);
CREATE INDEX idx_spot_address_city ON spot_address(city);