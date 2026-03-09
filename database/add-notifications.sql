-- Teszt értesítések hozzáadása
-- Először ellenőrizd hogy van-e admin user (id=1)

-- Értesítés 1: Üzenet érkezett
INSERT INTO ertesitesek (felhasznalo_id, tipus, cim, uzenet, olvasott, letrehozva)
VALUES (1, 'new_message', 'Új üzenet érkezett', 'Kovács János üzenetet küldött neked az Irodahelyiség hirdetéseddel kapcsolatban.', FALSE, NOW());

-- Értesítés 2: Kedvencekhez adták
INSERT INTO ertesitesek (felhasznalo_id, tipus, cim, uzenet, olvasott, letrehozva)
VALUES (1, 'favorite', 'Hirdetésed kedvencnek jelölték', 'A Modern családi ház hirdetésedet egy felhasználó kedvencnek jelölte.', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Értesítés 3: Hirdetés státusz változás
INSERT INTO ertesitesek (felhasznalo_id, tipus, cim, uzenet, olvasott, letrehozva)
VALUES (1, 'property_status', 'Hirdetés státusza megváltozott', 'A Belvárosi penthouse hirdetésed státusza aktívra változott.', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Értesítés 4: Rendszer értesítés
INSERT INTO ertesitesek (felhasznalo_id, tipus, cim, uzenet, olvasott, letrehozva)
VALUES (1, 'system', 'Rendszer karbantartás', 'Holnap éjjel 02:00-04:00 között tervezett karbantartás lesz. Az oldal rövid ideig nem lesz elérhető.', FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- Értesítés 5: Új megtekintés
INSERT INTO ertesitesek (felhasznalo_id, tipus, cim, uzenet, olvasott, letrehozva)
VALUES (1, 'property_view', '🎉 Népszerű hirdetés!', 'A Luxus villa Szentendrén hirdetésed elérte a 100 megtekintést!', FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY));
