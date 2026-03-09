-- ====================================
-- INGATLAN MEGTEKINTÉSEK TRACKING TÁBLA
-- ====================================

CREATE TABLE IF NOT EXISTS ingatlan_megtekintesek (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingatlan_id INT NOT NULL,
    ip_cim VARCHAR(45),
    user_agent TEXT,
    felhasznalo_id INT NULL,
    session_id VARCHAR(255),
    megtekintve_datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ingatlan (ingatlan_id),
    INDEX idx_ip (ip_cim),
    INDEX idx_felhasznalo (felhasznalo_id),
    INDEX idx_datum (megtekintve_datum),
    FOREIGN KEY (ingatlan_id) REFERENCES ingatlanok(id) ON DELETE CASCADE,
    FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index a gyors duplicate check-hez
CREATE INDEX idx_view_check ON ingatlan_megtekintesek(ingatlan_id, ip_cim, felhasznalo_id);

-- ====================================
-- MEGTEKINTÉSEK SZÁMA STATISZTIKA VIEW
-- ====================================

CREATE OR REPLACE VIEW ingatlan_statisztikak AS
SELECT 
    i.id,
    i.cim,
    COUNT(DISTINCT im.id) as osszes_megtekintes,
    COUNT(DISTINCT im.ip_cim) as egyedi_latogatok,
    COUNT(DISTINCT DATE(im.megtekintve_datum)) as megtekintett_napok,
    COUNT(DISTINCT CASE WHEN im.megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN im.id END) as heti_megtekintes,
    COUNT(DISTINCT CASE WHEN im.megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN im.id END) as havi_megtekintes,
    COUNT(DISTINCT CASE WHEN im.megtekintve_datum >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN im.id END) as napi_megtekintes
FROM ingatlanok i
LEFT JOIN ingatlan_megtekintesek im ON i.id = im.ingatlan_id
GROUP BY i.id, i.cim;

-- ====================================
-- TISZTÍTÁS - Régi megtekintések törlése (90 napnál régebbiek)
-- ====================================

-- Ez egy esemény ami automatikusan fut minden nap
DELIMITER $$
CREATE EVENT IF NOT EXISTS clean_old_views
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM ingatlan_megtekintesek 
    WHERE megtekintve_datum < DATE_SUB(NOW(), INTERVAL 90 DAY);
END$$
DELIMITER ;

-- Esemény engedélyezése
SET GLOBAL event_scheduler = ON;
