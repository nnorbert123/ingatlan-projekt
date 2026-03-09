-- ====================================
-- INGATLAN WEBOLDAL ADATBÁZIS SÉMA
-- ====================================

-- Adatbázis létrehozása
CREATE DATABASE IF NOT EXISTS ingatlan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE ingatlan_db;

-- ====================================
-- FELHASZNÁLÓK TÁBLA
-- ====================================
CREATE TABLE felhasznalok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nev VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    jelszo VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    profilkep VARCHAR(255) DEFAULT 'default-avatar.jpg',
    szerepkor ENUM('felhasznalo', 'hirdeto', 'admin') DEFAULT 'felhasznalo',
    regisztracio_datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    utolso_belepes TIMESTAMP NULL,
    aktiv BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_szerepkor (szerepkor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- INGATLANOK TÁBLA
-- ====================================
CREATE TABLE ingatlanok (
    id INT AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id INT NOT NULL,
    cim VARCHAR(200) NOT NULL,
    leiras TEXT,
    tipus ENUM('lakas', 'haz', 'telek', 'iroda', 'garázs', 'egyéb') NOT NULL,
    tranzakcio_tipus ENUM('elado', 'kiado') NOT NULL,
    ar DECIMAL(12, 2) NOT NULL,
    penznem ENUM('HUF', 'EUR', 'USD') DEFAULT 'HUF',
    
    -- Lokáció adatok
    orszag VARCHAR(50) DEFAULT 'Magyarország',
    megye VARCHAR(50),
    varos VARCHAR(100) NOT NULL,
    kerulet VARCHAR(50),
    iranyitoszam VARCHAR(10),
    utca VARCHAR(150),
    hazszam VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Ingatlan jellemzők
    alapterulet DECIMAL(8, 2) NOT NULL,
    szobak_szama INT,
    furdok_szama INT,
    emelet INT,
    osszkomfort BOOLEAN DEFAULT FALSE,
    epitesi_ev INT,
    allapot ENUM('uj', 'felujitott', 'felujitando', 'bontas') DEFAULT 'felujitando',
    
    -- Extrák (JSON formátumban)
    extrak JSON,
    
    -- Státusz
    statusz ENUM('aktiv', 'inaktiv', 'elkuldte', 'torolve') DEFAULT 'aktiv',
    kiemelt BOOLEAN DEFAULT FALSE,
    megtekintesek INT DEFAULT 0,
    letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    frissitve TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    INDEX idx_varos (varos),
    INDEX idx_tipus (tipus),
    INDEX idx_tranzakcio (tranzakcio_tipus),
    INDEX idx_ar (ar),
    INDEX idx_statusz (statusz),
    INDEX idx_kiemelt (kiemelt),
    FULLTEXT idx_kereso (cim, leiras, varos, utca)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- KÉPEK TÁBLA
-- ====================================
CREATE TABLE kepek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingatlan_id INT NOT NULL,
    fajlnev VARCHAR(255) NOT NULL,
    fajl_utvonal VARCHAR(500) NOT NULL,
    sorrend INT DEFAULT 0,
    fo_kep BOOLEAN DEFAULT FALSE,
    feltoltve TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ingatlan_id) REFERENCES ingatlanok(id) ON DELETE CASCADE,
    INDEX idx_ingatlan (ingatlan_id),
    INDEX idx_sorrend (sorrend)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- KEDVENCEK TÁBLA
-- ====================================
CREATE TABLE kedvencek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id INT NOT NULL,
    ingatlan_id INT NOT NULL,
    hozzaadva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    FOREIGN KEY (ingatlan_id) REFERENCES ingatlanok(id) ON DELETE CASCADE,
    UNIQUE KEY unique_kedvenc (felhasznalo_id, ingatlan_id),
    INDEX idx_felhasznalo (felhasznalo_id),
    INDEX idx_ingatlan (ingatlan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- ÉRTESÍTÉSEK TÁBLA
-- ====================================
CREATE TABLE ertesitesek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id INT NOT NULL,
    uzenet TEXT NOT NULL,
    tipus ENUM('info', 'siker', 'figyelmezetes', 'hiba') DEFAULT 'info',
    olvasott BOOLEAN DEFAULT FALSE,
    letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    INDEX idx_felhasznalo (felhasznalo_id),
    INDEX idx_olvasott (olvasott)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- MENTETT KERESÉSEK TÁBLA
-- ====================================
CREATE TABLE mentett_keresesek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    felhasznalo_id INT NOT NULL,
    nev VARCHAR(100) NOT NULL,
    szures_parameterek JSON NOT NULL,
    ertesites_aktiv BOOLEAN DEFAULT FALSE,
    letrehozva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    INDEX idx_felhasznalo (felhasznalo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- ÜZENETEK TÁBLA (Felhasználók közötti kommunikáció)
-- ====================================
CREATE TABLE uzenetek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kuldo_id INT NOT NULL,
    fogado_id INT NOT NULL,
    ingatlan_id INT,
    targy VARCHAR(200),
    uzenet TEXT NOT NULL,
    olvasott BOOLEAN DEFAULT FALSE,
    kuldes_ideje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (kuldo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    FOREIGN KEY (fogado_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
    FOREIGN KEY (ingatlan_id) REFERENCES ingatlanok(id) ON DELETE SET NULL,
    INDEX idx_kuldo (kuldo_id),
    INDEX idx_fogado (fogado_id),
    INDEX idx_olvasott (olvasott)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ====================================
-- MINTA ADATOK BESZÚRÁSA
-- ====================================

-- Admin felhasználó (jelszó: admin123)
INSERT INTO felhasznalok (nev, email, jelszo, telefon, szerepkor) VALUES
('Admin Péter', 'admin@ingatlan.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36301234567', 'admin');

-- Hirdetők
INSERT INTO felhasznalok (nev, email, jelszo, telefon, szerepkor) VALUES
('Nagy István', 'nagy.istvan@ingatlan.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36301111111', 'hirdeto'),
('Kovács Anna', 'kovacs.anna@ingatlan.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36302222222', 'hirdeto'),
('Szabó Gábor', 'szabo.gabor@ingatlan.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36303333333', 'hirdeto');

-- Rendes felhasználók
INSERT INTO felhasznalok (nev, email, jelszo, telefon) VALUES
('Tóth Márta', 'toth.marta@email.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36304444444'),
('Kiss Zoltán', 'kiss.zoltan@email.hu', '$2a$10$rZJ8qNWzXdPqGVxbOECbguJQ9h5xKNvUxGdCGEYBPvLBqFqKGc.uq', '+36305555555');

-- Minta ingatlanok
INSERT INTO ingatlanok (felhasznalo_id, cim, leiras, tipus, tranzakcio_tipus, ar, varos, kerulet, iranyitoszam, utca, alapterulet, szobak_szama, furdok_szama, emelet, osszkomfort, epitesi_ev, allapot, kiemelt, extrak) VALUES
(2, 'Panorámás lakás Budán', 'Gyönyörű 3 szobás lakás a Rózsadomb szívében, lenyűgöző kilátással a Dunára. Teljesen felújított, modern berendezéssel. Csendes, zöld környezet, kiváló tömegközlekedés.', 'lakas', 'elado', 85000000, 'Budapest', 'II. kerület', '1024', 'Fő utca', 95.5, 3, 2, 5, TRUE, 2018, 'felujitott', TRUE, '{"parkolas": true, "lift": true, "erkely": true, "legkondicionalas": true}'),
(2, 'Modern családi ház kerttel', 'Tágas, 4 szobás családi ház 600 m² telken, garázzsal és medencével. Kiváló családi környezet, közel iskolákhoz és bevásárlóközpontokhoz.', 'haz', 'elado', 125000000, 'Budapest', 'XII. kerület', '1125', 'Völgy utca', 240, 4, 2, NULL, TRUE, 2015, 'uj', TRUE, '{"parkolas": true, "kerti_tavolo": true, "medence": true, "riaszto": true}'),
(3, 'Belvárosi penthouse', 'Exkluzív penthouse lakás tetőteraszával a belvárosban. 180 m² hasznos alapterület, panorámás kilátás, luxus kivitelezés.', 'lakas', 'elado', 145000000, 'Budapest', 'V. kerület', '1051', 'Szabadság tér', 180, 3, 2, 8, TRUE, 2020, 'uj', TRUE, '{"parkolas": true, "lift": true, "terasz": true, "legkondicionalas": true, "jacuzzi": true}'),
(3, 'Befektetői lakás kiadó', 'Teljesen bútorozott, 2 szobás lakás hosszú távra kiadó. Kitűnő közlekedés, bevásárlóközpont a közelben.', 'lakas', 'kiado', 250000, 'Budapest', 'XIII. kerület', '1133', 'Váci út', 65, 2, 1, 3, TRUE, 2010, 'felujitott', FALSE, '{"parkolas": false, "lift": true, "butorozott": true}'),
(4, 'Építési telek Budaörsön', 'Kiváló fekvésű, 1200 m² építési telek közmű bekötéssel. Csendes, lakóövezeti besorolás.', 'telek', 'elado', 35000000, 'Budaörs', NULL, '2040', 'Templom utca', 1200, NULL, NULL, NULL, FALSE, NULL, NULL, FALSE, '{"kozmu": true, "sik_terulet": true}'),
(4, 'Irodahelyiség a belvárosban', 'Klimatizált, 80 m² irodahelyiség a belváros szívében. Kiváló megközelíthetőség, parkolási lehetőség.', 'iroda', 'kiado', 400000, 'Budapest', 'VI. kerület', '1065', 'Nagymező utca', 80, 3, 1, 2, TRUE, 2005, 'felujitott', FALSE, '{"parkolas": true, "lift": true, "legkondicionalas": true}'),
(2, 'Újépítésű lakás Zugló', 'Új építésű, 2+1 szobás lakás erkéllyel. Energiatakarékos, korszerű megoldások. Átadás: 2025 Q2.', 'lakas', 'elado', 52000000, 'Budapest', 'XIV. kerület', '1142', 'Erzsébet királyné útja', 68, 2, 1, 4, TRUE, 2024, 'uj', TRUE, '{"parkolas": true, "lift": true, "erkely": true, "padlofutes": true}'),
(3, 'Hangulatos öröklakás Pesten', 'Felújított, 1,5 szobás lakás csendes utcában. Ideális fiatal párnak vagy egyedülállónak.', 'lakas', 'elado', 38000000, 'Budapest', 'IX. kerület', '1095', 'Tompa utca', 45, 1, 1, 2, TRUE, 1985, 'felujitott', FALSE, '{"parkolas": false, "lift": false}'),
(2, 'Luxus villa Szentendrén', 'Különleges, mediterrán stílusú villa Duna-parti panorámával. 450 m² lakótér, 2000 m² park.', 'haz', 'elado', 285000000, 'Szentendre', NULL, '2000', 'Duna-part', 450, 6, 4, NULL, TRUE, 2019, 'uj', TRUE, '{"parkolas": true, "medence": true, "szauna": true, "borospince": true, "riaszto": true}'),
(4, 'Garázs bérbeadó', 'Zárt, őrzött garázsban egy férőhely kiadó hosszú távra.', 'garázs', 'kiado', 35000, 'Budapest', 'XI. kerület', '1117', 'Fehérvári út', 15, NULL, NULL, NULL, FALSE, 2000, NULL, FALSE, '{"biztonsagi_kapu": true}');

-- ====================================
-- NÉZETEK (Views) - Gyakori lekérdezésekhez
-- ====================================

-- Aktív ingatlanok képekkel
CREATE VIEW aktiv_ingatlanok_kepekkel AS
SELECT 
    i.*,
    f.nev AS hirdeto_nev,
    f.telefon AS hirdeto_telefon,
    f.email AS hirdeto_email,
    GROUP_CONCAT(k.fajl_utvonal ORDER BY k.sorrend) AS kepek,
    (SELECT fajl_utvonal FROM kepek WHERE ingatlan_id = i.id AND fo_kep = TRUE LIMIT 1) AS fo_kep
FROM ingatlanok i
LEFT JOIN felhasznalok f ON i.felhasznalo_id = f.id
LEFT JOIN kepek k ON i.id = k.ingatlan_id
WHERE i.statusz = 'aktiv'
GROUP BY i.id;

-- Kiemelt ingatlanok
CREATE VIEW kiemelt_ingatlanok AS
SELECT * FROM aktiv_ingatlanok_kepekkel
WHERE kiemelt = TRUE
ORDER BY frissitve DESC;

-- ====================================
-- TÁROLT ELJÁRÁSOK (Stored Procedures)
-- ====================================

DELIMITER //

-- Ingatlan keresése szűrőkkel
CREATE PROCEDURE ingatlan_kereses(
    IN p_tipus VARCHAR(50),
    IN p_tranzakcio VARCHAR(20),
    IN p_varos VARCHAR(100),
    IN p_min_ar DECIMAL(12,2),
    IN p_max_ar DECIMAL(12,2),
    IN p_min_alapterulet DECIMAL(8,2),
    IN p_max_alapterulet DECIMAL(8,2),
    IN p_min_szobak INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM aktiv_ingatlanok_kepekkel
    WHERE 
        (p_tipus IS NULL OR tipus = p_tipus) AND
        (p_tranzakcio IS NULL OR tranzakcio_tipus = p_tranzakcio) AND
        (p_varos IS NULL OR varos LIKE CONCAT('%', p_varos, '%')) AND
        (p_min_ar IS NULL OR ar >= p_min_ar) AND
        (p_max_ar IS NULL OR ar <= p_max_ar) AND
        (p_min_alapterulet IS NULL OR alapterulet >= p_min_alapterulet) AND
        (p_max_alapterulet IS NULL OR alapterulet <= p_max_alapterulet) AND
        (p_min_szobak IS NULL OR szobak_szama >= p_min_szobak)
    ORDER BY kiemelt DESC, frissitve DESC
    LIMIT p_limit OFFSET p_offset;
END //

-- Megtekintés számláló növelése
CREATE PROCEDURE noveld_megtekintes(IN p_ingatlan_id INT)
BEGIN
    UPDATE ingatlanok 
    SET megtekintesek = megtekintesek + 1 
    WHERE id = p_ingatlan_id;
END //

DELIMITER ;

-- ====================================
-- INDEXEK TELJESÍTMÉNY OPTIMALIZÁLÁSHOZ
-- ====================================

-- További összetett indexek
CREATE INDEX idx_varos_tipus_ar ON ingatlanok(varos, tipus, ar);
CREATE INDEX idx_statusz_kiemelt ON ingatlanok(statusz, kiemelt, frissitve);
CREATE INDEX idx_felhasznalo_statusz ON ingatlanok(felhasznalo_id, statusz);

-- ====================================
-- ADATBÁZIS ADATOK EXPORT ÚTMUTATÓ
-- ====================================

-- Az adatbázis exportálása (dump készítése):
-- mysqldump -u root -p ingatlan_db > ingatlan_db_dump.sql

-- Adatbázis importálása:
-- mysql -u root -p ingatlan_db < ingatlan_db_dump.sql
