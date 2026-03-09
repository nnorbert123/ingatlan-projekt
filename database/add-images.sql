-- ====================================
-- KÉPEK HOZZÁADÁSA AZ INGATLANOKHOZ
-- ====================================

USE ingatlan_db;

-- Törölj minden létező képet (ha van)
DELETE FROM kepek;

-- Ingatlan 1 - Panorámás lakás Budán
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(1, 'lakas-buda-1.jpg', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 0, TRUE),
(1, 'lakas-buda-2.jpg', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1, FALSE),
(1, 'lakas-buda-3.jpg', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 2, FALSE);

-- Ingatlan 2 - Modern családi ház kerttel
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(2, 'csaladi-haz-1.jpg', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 0, TRUE),
(2, 'csaladi-haz-2.jpg', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 1, FALSE),
(2, 'csaladi-haz-3.jpg', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2, FALSE);

-- Ingatlan 3 - Belvárosi penthouse
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(3, 'penthouse-1.jpg', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 0, TRUE),
(3, 'penthouse-2.jpg', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1, FALSE),
(3, 'penthouse-3.jpg', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 2, FALSE);

-- Ingatlan 4 - Befektetői lakás kiadó
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(4, 'kiado-lakas-1.jpg', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, TRUE),
(4, 'kiado-lakas-2.jpg', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 1, FALSE);

-- Ingatlan 5 - Építési telek Budaörsön
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(5, 'telek-1.jpg', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 0, TRUE),
(5, 'telek-2.jpg', 'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800', 1, FALSE);

-- Ingatlan 6 - Irodahelyiség a belvárosban
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(6, 'iroda-1.jpg', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 0, TRUE),
(6, 'iroda-2.jpg', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', 1, FALSE);

-- Ingatlan 7 - Újépítésű lakás Zugló
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(7, 'uj-lakas-1.jpg', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 0, TRUE),
(7, 'uj-lakas-2.jpg', 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 1, FALSE);

-- Ingatlan 8 - Hangulatos öröklakás Pesten
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(8, 'oroklakas-1.jpg', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 0, TRUE),
(8, 'oroklakas-2.jpg', 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 1, FALSE);

-- Ingatlan 9 - Luxus villa Szentendrén
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(9, 'villa-1.jpg', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 0, TRUE),
(9, 'villa-2.jpg', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 1, FALSE),
(9, 'villa-3.jpg', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 2, FALSE),
(9, 'villa-4.jpg', 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800', 3, FALSE);

-- Ingatlan 10 - Garázs bérbeadó
INSERT INTO kepek (ingatlan_id, fajlnev, fajl_utvonal, sorrend, fo_kep) VALUES
(10, 'garazs-1.jpg', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 0, TRUE);

-- Ellenőrzés
SELECT i.id, i.cim, COUNT(k.id) as kepek_szama
FROM ingatlanok i
LEFT JOIN kepek k ON i.id = k.ingatlan_id
GROUP BY i.id
ORDER BY i.id;
