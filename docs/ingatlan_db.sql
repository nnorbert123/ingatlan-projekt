-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 08, 2026 at 05:05 AM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ingatlan_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`ingatlan_user`@`localhost` PROCEDURE `ingatlan_kereses` (IN `p_tipus` VARCHAR(50), IN `p_tranzakcio` VARCHAR(20), IN `p_varos` VARCHAR(100), IN `p_min_ar` DECIMAL(12,2), IN `p_max_ar` DECIMAL(12,2), IN `p_min_alapterulet` DECIMAL(8,2), IN `p_max_alapterulet` DECIMAL(8,2), IN `p_min_szobak` INT, IN `p_limit` INT, IN `p_offset` INT)   BEGIN
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
END$$

CREATE DEFINER=`ingatlan_user`@`localhost` PROCEDURE `noveld_megtekintes` (IN `p_ingatlan_id` INT)   BEGIN
    UPDATE ingatlanok 
    SET megtekintesek = megtekintesek + 1 
    WHERE id = p_ingatlan_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `aktiv_ingatlanok_kepekkel`
-- (See below for the actual view)
--
CREATE TABLE `aktiv_ingatlanok_kepekkel` (
`id` int
,`felhasznalo_id` int
,`cim` varchar(200)
,`leiras` text
,`tipus` enum('lakas','haz','telek','iroda','garÃ¡zs','egyÃ©b')
,`tranzakcio_tipus` enum('elado','kiado')
,`ar` bigint
,`penznem` enum('HUF','EUR','USD')
,`orszag` varchar(50)
,`megye` varchar(50)
,`varos` varchar(100)
,`kerulet` varchar(50)
,`iranyitoszam` varchar(10)
,`utca` varchar(150)
,`hazszam` varchar(20)
,`latitude` decimal(10,8)
,`longitude` decimal(11,8)
,`alapterulet` decimal(8,2)
,`szobak_szama` int
,`furdok_szama` int
,`emelet` int
,`osszkomfort` tinyint(1)
,`epitesi_ev` int
,`allapot` enum('uj','felujitott','felujitando','bontas')
,`extrak` json
,`statusz` enum('aktiv','inaktiv','elkuldte','torolve')
,`kiemelt` tinyint(1)
,`megtekintesek` int
,`letrehozva` timestamp
,`frissitve` timestamp
,`hirdeto_nev` varchar(100)
,`hirdeto_telefon` varchar(20)
,`hirdeto_email` varchar(100)
,`kepek` text
,`fo_kep` varchar(500)
);

-- --------------------------------------------------------

--
-- Table structure for table `ertesitesek`
--

CREATE TABLE `ertesitesek` (
  `id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `uzenet` text COLLATE utf8mb4_hungarian_ci NOT NULL,
  `tipus` enum('info','siker','figyelmezetes','hiba') COLLATE utf8mb4_hungarian_ci DEFAULT 'info',
  `olvasott` tinyint(1) DEFAULT '0',
  `letrehozva` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int NOT NULL,
  `nev` varchar(100) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `jelszo` varchar(255) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `telefon` varchar(20) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `profilkep` varchar(255) COLLATE utf8mb4_hungarian_ci DEFAULT 'default-avatar.jpg',
  `szerepkor` enum('user','admin') COLLATE utf8mb4_hungarian_ci DEFAULT 'user',
  `regisztracio_datum` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `utolso_belepes` timestamp NULL DEFAULT NULL,
  `aktiv` tinyint(1) DEFAULT '1',
  `email_megerositett` tinyint(1) DEFAULT '0',
  `email_token` varchar(255) COLLATE utf8mb4_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `nev`, `email`, `jelszo`, `telefon`, `profilkep`, `szerepkor`, `regisztracio_datum`, `utolso_belepes`, `aktiv`, `email_megerositett`, `email_token`) VALUES
(29, 'Nagy Norbert', 'norbertnagy129@gmail.com', '$2a$10$qOpuFCPZ7/wfr71i84EJd.zu9IQRIITBIi.9tx29Nn8/qy.wkKXKO', '06307431232', '/uploads/profiles/profile-1772889253343-863127473.png', 'admin', '2026-03-05 08:36:14', '2026-04-03 01:29:29', 1, 0, 'f70ed1eef6632906b53abb421f5e1f7aa3116bfe45826a9a33fb659c9a05d068'),
(30, 'Kovács István', 'kovacs3321232.a@gmail.com', '$2a$10$lK98HXUxc2S48tiL/VujQugjxj8isStSLQzK67HB8nn.qoZH8eS32', '06201235423', 'default-avatar.jpg', 'user', '2026-03-05 08:48:25', NULL, 1, 0, '7e27a179ceb4208e211ad58b8fb229135cf140c9dcb85d9d656c2fb3abe2ff19'),
(31, 'Kiss Sándor', 'peldaaaa.2332@gmail.com', '$2a$10$Cdz0SfFY6RdPm/7Yc24qD.toM5Yw8pI3dJq2MiNqxVo8pucOM4C1m', '06301233221', 'default-avatar.jpg', 'user', '2026-03-05 08:55:39', NULL, 1, 0, 'cf4fa60c690a8e43038edefb1076f0bef3c0a61566c9e03fd252ed09eaf1c5ca');

-- --------------------------------------------------------

--
-- Table structure for table `ingatlanok`
--

CREATE TABLE `ingatlanok` (
  `id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `cim` varchar(200) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `leiras` text COLLATE utf8mb4_hungarian_ci,
  `tipus` enum('lakas','haz','telek','iroda','garÃ¡zs','egyÃ©b') COLLATE utf8mb4_hungarian_ci NOT NULL,
  `tranzakcio_tipus` enum('elado','kiado') COLLATE utf8mb4_hungarian_ci NOT NULL,
  `ar` bigint DEFAULT NULL,
  `kepek` text COLLATE utf8mb4_hungarian_ci,
  `penznem` enum('HUF','EUR','USD') COLLATE utf8mb4_hungarian_ci DEFAULT 'HUF',
  `orszag` varchar(50) COLLATE utf8mb4_hungarian_ci DEFAULT 'MagyarorszÃ¡g',
  `megye` varchar(50) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `varos` varchar(100) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `kerulet` varchar(50) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `iranyitoszam` varchar(10) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `utca` varchar(150) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `hazszam` varchar(20) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `alapterulet` decimal(8,2) NOT NULL,
  `szobak_szama` int DEFAULT NULL,
  `furdok_szama` int DEFAULT NULL,
  `emelet` int DEFAULT NULL,
  `osszkomfort` tinyint(1) DEFAULT '0',
  `epitesi_ev` int DEFAULT NULL,
  `allapot` enum('uj','felujitott','felujitando','bontas') COLLATE utf8mb4_hungarian_ci DEFAULT 'felujitando',
  `extrak` json DEFAULT NULL,
  `statusz` enum('aktiv','inaktiv','elkuldte','torolve') COLLATE utf8mb4_hungarian_ci DEFAULT 'aktiv',
  `felfuggesztve_indok` text COLLATE utf8mb4_hungarian_ci,
  `felfuggesztve_datum` datetime DEFAULT NULL,
  `kiemelt` tinyint(1) DEFAULT '0',
  `megtekintesek` int DEFAULT '0',
  `letrehozva` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `frissitve` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lefoglalva` tinyint(1) DEFAULT '0',
  `lefoglalva_datum` datetime DEFAULT NULL,
  `lefoglalva_megjegyzes` varchar(500) COLLATE utf8mb4_hungarian_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `ingatlanok`
--

INSERT INTO `ingatlanok` (`id`, `felhasznalo_id`, `cim`, `leiras`, `tipus`, `tranzakcio_tipus`, `ar`, `kepek`, `penznem`, `orszag`, `megye`, `varos`, `kerulet`, `iranyitoszam`, `utca`, `hazszam`, `latitude`, `longitude`, `alapterulet`, `szobak_szama`, `furdok_szama`, `emelet`, `osszkomfort`, `epitesi_ev`, `allapot`, `extrak`, `statusz`, `felfuggesztve_indok`, `felfuggesztve_datum`, `kiemelt`, `megtekintesek`, `letrehozva`, `frissitve`, `lefoglalva`, `lefoglalva_datum`, `lefoglalva_megjegyzes`) VALUES
(1, 29, 'OASIS Residence', 'OASIS Residence\r\nAz OASIS RESIDENCE a kortárs stílust és az otthonos légkört ötvözi, hogy igazán meghitt életteret teremtsen. A meleg, barátságos belső terek a nyugalom érzetét keltik, ahol minden apró részletet úgy alakítottak ki, hogy a maximális kényelmet szolgálja. A harmónia és a meghittség élménye lehetővé teszi, hogy minden pillanatot élvezhessen ebben a városi oázisban.\r\n\r\nAz épület Budapest egyik kiforrott, nyugodt részén található, ahol a mindennapok békében telnek. A közelben hangulatos parkok és a Duna-part várja a kikapcsolódásra vágyókat, tökéletes helyszínt kínálva reggeli futáshoz vagy esti sétákhoz. Ugyanakkor a kiváló közlekedési kapcsolatoknak köszönhetően a város bármely pontja gyorsan és kényelmesen elérhető.', 'lakas', 'elado', 141350000, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Budapest', 'XIII. kerület', '2312', 'Sólyatér utca ', '15', NULL, NULL, 75.00, 3, 2, 8, 0, 2015, 'uj', NULL, 'aktiv', NULL, NULL, 0, 6, '2026-03-05 08:40:01', '2026-04-08 02:48:05', 0, NULL, NULL),
(2, 29, 'Gyál eladó családi ház 6 szobás', 'Gyál, Iglói utca\r\nJogilag rendezett, CSOK Plusz (3 gyermekre), kombináltan Otthon Start hitelre is megfelelő, letisztult, két generáció együttélésére kifejezetten alkalmas igazi családi OTTHON Gyál frekventált részén\r\nBudapest határától alig pár méterre eladó ez a szép, rendezett telken álló, összközműves, B30-as téglából épített, önálló-, körbejárható, 10 cm-es hőszigeteléssel szigetelt családi ház.\r\n\r\nAz utca igazi kertváros hangulatát idézi, a szomszédok kimondottan kedvesek és segítőkészek.\r\n\r\nA telek Vt-4 lakóövezeti besorolású (kivett lakóház, udvar művelési ágú) – a helyi építési szabályzat alapján 40%-ban beépíthető – szabályos, kerítéssel körbekerített, téglalap alakú, közbenső telek.\r\n\r\nA 677 nm-es folyamatosan karbantartott telken lévő, belső elrendezését tekintve nagyon jó elosztású 2 belső szintes, 145 nm-es nettó fűtött hasznos alapterületű családi házat a tulajdonos építtette 1988-ban.\r\n\r\nMűszaki tartalom:\r\n- 1,5 méter mély, vízszigetelt betonsáv-alap,\r\n- 100%-ban tégla fő- és mellékfalak,\r\n- vasbeton födémszerkezet,\r\n- 2024-ben teljes mértékben cserélt nyeregtető (új gerendákkal, cseréplécekkel, párazáró fóliával, födémszigeteléssel, betoncserép héjazattal.\r\n- a villamoshálózat: réz, 3 fázis (3x16 A) van az ingatlanban, ezen kívül 2 inverteres hűtő-fűtő klíma szolgálja kényelmünket,\r\n- a fűtéséről új zárt égésterű cirkó kazán, párhuzamosítva egy jó állapotú vegyes tüzelésű kazán gondoskodik, radiátoros hőleadással,\r\n- a nyílászárók mindegyike korszerű műanyag, 2 rétegű thermoüveggel,\r\n- külön kiemelném, hogy a családi házban 5 éven belül a tulajdonos valamennyi szanitert és valamennyi hideg-, valamint melegburkolatot magas minőségű burkolatra cseréltette.\r\n\r\nJogi tartalom:\r\n\r\n- két tulajdonosa van,\r\n- az ingatlan teljes mértékben fel van tüntetve a térképmásolaton.\r\n\r\nAz ingatlan sajátosságai:\r\n\r\n• félszuterén szint: világos konyha, étkező és nappali, jól átgondolt és felújított fürdőszoba és mellékhelyiség, valamint 2 önállóan zárható, élhető méretű hálószoba,\r\n• a magasföldszint: szintén világos konyha, nagy étkező, nappali, szintén jól megtervezett és felújított fürdőszoba és mellékhelyiség valamint 2 önállóan zárható szintén élhető méretű hálószoba,\r\n• a két teljes értékű szintet az ingatlanon belül kialakított lépcsőház köti össze, emiatt két generáció együttélésére tökéletesen alkalmas,\r\n• nagy udvara van, igény szerint rengeteg helye lehet kerti játékoknak, kerti hintának, kerti sütőnek,\r\n• az ingatlan energiahatékony, 10 cm-s kőzetgyapot (és természetesen födém-) szigetelést kapott,\r\n• gépjárművel mellékutcából tudunk beállni a telekre egy elektronizált nagy kapun keresztül,\r\n• családi rendezvények nem okozhatnak problémát a parkoláskor, az udvarban is és az utcafronton is egyidejűleg legkevesebb 10 személygépjárművel tudunk parkolni,\r\n• a telken található egy önálló, körbejárható melléképület, fele részben üres (korábban kondicionáló terem volt, melyhez tartozik egy külön mellékhelyiség), fele részben műhely.\r\n\r\nBiztonságunkról kiépített kamerarendszer és riasztó, valamint elektronikusan működtetett kapu gondoskodik.\r\n\r\nAz ingatlan kitűnő elhelyezkedése miatt könnyen megközelíthető tömegközlekedéssel, 4 perc sétára van (270 méter) az 55-ös, a 89E-, a 94-es és a 294-es buszjárat megállója, valamint pár perc sétára a lajosmizsei vasút Gyál Felső megállója.\r\nAutóval alig 7 percre van a Ferihegyi Reptér és Budapestre 25 perc alatt beérni még a reggeli forgalomban is.\r\n\r\nNem érdemes autóba ülni, ha az új tulajdonos épp játszótérre vagy vásárolni szeretne menni, hiszen alig 200 méterre található a gyáli Millenniumi Park, ahol hosszú sétányokon sétálhatunk, ahol lehet gyermekeinkkel focizni, ahol több felújított játszótér is található, ahol kutyafuttató van és a kisebb-nagyobb bevásárlást a 350 méterre lévő Pennyben a hét bármely napján letudhatjuk.\r\n\r\nHa gyermekünk óvodás, szűk negyed órányi sétára (vagy 4 perc autóval) található a Gyáli Tulipán Óvoda, ha iskolás, szintén negyedóra séta a Gyáli Ady Endre Általános Iskola, a Gyáli Sportcsarnok és a gyáli futballpálya, mellette pedig az Ady Center (Spar, dohánybolt, DM, Pepco), a háztól alig 800 méterre van postahivatal, alig 1000 méterre az orvosi- és gyermekorvosi rendelő és gyógyszertár.\r\n\r\nFérfiak kedvéért, legkevesebb 3 barkácsüzlet (a legközelebbi 600 méterre) és munkavédelmi bolt áll rendelkezésünkre a szükséges anyagok beszerzésében.\r\n\r\nÁllok rendelkezésére! Ne habozzon, ha kérdése van, hívjon! Nézze meg még ma!\r\n\r\nLegyen Ön ennek az ingatlannak az új tulajdonosa!', 'haz', 'elado', 42000000, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Gyál', NULL, '1123', ' Iglói utca', '12', NULL, NULL, 177.00, 6, 2, NULL, 0, 2014, 'felujitott', NULL, 'aktiv', NULL, NULL, 0, 6, '2026-03-05 08:44:32', '2026-04-01 12:30:31', 0, NULL, NULL),
(3, 29, 'Vecsés eladó ikerház 4 szobás', 'Eladó Ház, Vecsés 138.000.000 Ft\r\nEladó Új Építésű Sorházi Lakás Vecsésen, Felsőhalom városrészben – Zárt Lakóparkban!\r\nMár csak a középső lakás elérhető ebből az exkluzív, modern sorházi projektből!\r\nA 120 m²-es, belső kétszintes otthon tágas, amerikai konyhás nappalival és három hálószobával rendelkezik, valamint két fürdőszoba biztosítja a kényelmet a család minden tagja számára.\r\nA projekt magas műszaki tartalommal és gondos kivitelezéssel valósul meg, korszerű, energiatakarékos megoldásokkal:\r\nFőbb műszaki jellemzők:\r\n• Stabil, vasbeton sávalap és Porotherm 30 cm-es tégla falazat, 10 cm homlokzati hőszigeteléssel\r\n• Tégla válaszfalak (10 cm) és 20–30 cm fújt födémszigetelés a kiváló hőmegtartás érdekében\r\n• Terrán–Bramac antracit betoncserép fedés, modern megjelenéssel\r\n• 3 rétegű, fehér színű műanyag nyílászárók, kiemelkedő hő- és hangszigeteléssel\r\n• Levegő–víz hőszivattyús rendszer, padlófűtéssel mindkét szinten, fürdőkben törölközőszárítós radiátorral\r\n• Napelem előkészítés a jövőbiztos energiafelhasználás érdekében\r\n• Elektromos, motoros szekcionált garázskapu, a garázsban padlófűtés és elektromos autótöltés előkészítve\r\n• Burkolatok, beltéri ajtók, szaniterek még választhatók, hogy otthona teljesen az Ön ízlését tükrözze\r\n• Elektromos kapu előkészítés, igényes antracit színű kerítés és térkövezett kocsibeálló az ár részét képezik\r\n• Redőnyök beépítve\r\nAz ingatlanhoz tartozó telekterület kb. 300 m2, viacoloros, fedett Tároló\r\nA beruházás már megkezdődött, a várható átadás 2026 III. negyedévében várható.\r\nA szomszédos telkeken referencia házak már megtekinthetők. Társasházi alapító okirat készül.\r\nElhelyezkedés:\r\nVecsés kedvelt, Felsőhalom városrészében, zárt lakóparkban, csendes és rendezett környezetben.\r\nA közelben iskola, óvoda, boltok és tömegközlekedés található – minden adott a kényelmes, családbarát élethez.\r\n\r\nTovábbi információért és megtekintésért keressen bizalommal!\r\nIrodánk díjmentes hitelügyintézést és támogatási tanácsadást biztosít ügyfeleink részére.', 'haz', 'elado', 138000000, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Vecsés', NULL, NULL, 'Fő utca', '16', NULL, NULL, 119.00, 3, 1, NULL, 0, 2022, 'bontas', NULL, 'aktiv', NULL, NULL, 0, 5, '2026-03-05 08:48:01', '2026-04-05 11:47:37', 1, '2026-03-07 14:35:23', NULL),
(4, 30, 'Ingatlan Budapest III. kerület', 'Budapest III. kerület, Csillaghegy Dunához közel eső részén minőségi, felújított családi ház piaci ár alatt eladó\r\nMűszaki paraméterek:\r\n• Külső falak Porotherm 30 K falazóblokk + hőszigetelés + rusztikus téglaburkolat\r\n• Monolit 20 cm vasbeton födémek,\r\n• Belső lépcsők vasbeton, illetve egyedi nyitott - fa lépcsőfokokkal\r\n• Tetőhéjazat hódfarkú tetőcserép,\r\n• Réz és bevonatos alumínium lemezes bádogos szerkezetek,\r\n• Műanyag nyílászárók,\r\n• Gépészeti helység, padló és radiátoros fűtés\r\n• Inverteres hűtő-fűtő klímaberendezések\r\n• Minőségi burkolatok és szaniterek, belső ajtók\r\n• Riasztó rendszer\r\n• Kamera rendszer\r\n• Minden szobában UTP kábel a tv-nek, internetnek\r\n• Garázs automata kapuval + 2 felszíni beálló\r\n• Automata kertkapu\r\nHELYISÉGEK:\r\nszint helyiség méret m2\r\n1. emelet Közlekedő 13,57\r\n1. emelet Szoba 15,98\r\n1. emelet Szoba 17,18\r\n1. emelet Szoba 20,49\r\n1. emelet Gardrob 4\r\n1. emelet Fürdőszoba 8,18\r\n1. emelet WC 1,59\r\n1. emelet Erkély 3,19\r\nFöldszint Nappali szoba 28,63\r\nFöldszint Étkező 23,57\r\nFöldszint Konyha 10,62\r\nFöldszint Kamra 1,81\r\nFöldszint WC 0,8\r\nFöldszint Közlekedő 7,22\r\nFöldszint Terasz 14,95\r\nAlagsor Garázs 20,06\r\nAlagsor Pihenő szoba 27,34\r\nAlagsor Fürdőszoba 15,42\r\nAlagsor Zuhanyzó 4\r\nAlagsor Szauna 2,59\r\nAlagsor Raktár 4,59\r\nAlagsor Kazán 4,66\r\nAlagsor Közlekedő 15,11\r\nAlagsor Gépkocsi lehajtó 25,3\r\nösszes bruttó terület 290,85', 'lakas', 'elado', 299000000, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Budapest', 'III', NULL, NULL, NULL, NULL, NULL, 252.00, 5, 3, NULL, 0, 2012, 'felujitando', NULL, 'aktiv', NULL, NULL, 0, 5, '2026-03-05 08:50:46', '2026-04-07 10:44:53', 0, NULL, NULL),
(5, 30, 'Veresegyház eladó sorház 4 szobás', 'Veresegyház, Csonkás\r\nRezsibarát, 140 m² lakótér, elő és hátsókerttel – azonnal költözhető otthon Veresegyházon – 114,9 M Ft\r\n\r\nVeresegyház egyik csendes, zöld utcájában eladó egy 140 m²-es, kiváló állapotú, rendkívül alacsony fenntartási költségű sorházi otthon.\r\n\r\nAz ingatlan 1997-ben épült, folyamatosan karbantartott, műszakilag és esztétikailag is hibátlan állapotú. Ide csak költözni kell.\r\n\r\nAmi kiemeli a kínálatból:\r\nElőkert és hátsókert tökéletes gyereknek, kutyának, családi grillezéshez\r\n3 fázisú áram\r\nPadlófűtés + kondenzációs cirkó\r\nHűtő-fűtő klíma\r\nKülső hőszigetelés\r\nMűanyag, hőszigetelt nyílászárók\r\nRendkívül alacsony rezsiköltség – a korszerű műszaki megoldásoknak és a szigetelésnek köszönhetően a fenntartása kimondottan kedvező\r\n\r\nÖnálló helyrajzi számmal rendelkező családi ház.\r\nTehermentes ingatlan\r\nGarázs plussz kültéren akár 3 autó parkolási lehetősége\r\n\r\nGyalog elérhető:\r\n– közért\r\n– iskola, óvoda\r\n– orvosi rendelő\r\n- Üzletház\r\n– piac\r\n– tavak\r\n– buszmegállók helyi, és távolsági ,vonatállomás\r\n\r\nCsendes, rendezett utca, barátságos lakókörnyezet.\r\nIgény esetén a berendezés megegyezés tárgyát képezi.\r\nTulajdonostól eladó.\r\nIrányár: 114.900.000 Ft', 'lakas', 'elado', 114999997, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Veresegyház', NULL, NULL, NULL, NULL, NULL, NULL, 140.00, 3, 1, NULL, 0, NULL, 'felujitando', NULL, 'aktiv', NULL, NULL, 0, 4, '2026-03-05 08:52:32', '2026-04-01 11:59:27', 0, NULL, NULL),
(6, 30, 'Budapest XVIII. kerület eladó családi ház 4 szobás', '18. kerület, Pestszentlőrinc – Bókay-telep\r\n\r\nÚJ ÉPÍTÉSŰ, FÖLDSZINTES, ÖNÁLLÓ CSALÁDI HÁZ ELADÓ GARÁZZSAL, 640 m²-ES TELKEN – KÖZVETLENÜL BERUHÁZÓTÓL\r\n\r\nA 18. kerület egyik legkedveltebb, csendes, családiházas részén, Bókay-telepen kínálunk eladásra egy új építésű, földszintes, önálló családi házat, saját garázzsal és telekkel.\r\n\r\nA környék igazi zöld oázis, mégis minden fontos szolgáltatás – iskola, óvoda, orvosi rendelő, posta, bevásárlási lehetőségek – néhány percen belül elérhető.\r\n\r\nA ház már szinte teljesen elkészült, jelenleg csak a burkolatok kiválasztása van hátra, így az új tulajdonos akár rövid időn belül birtokba veheti, és saját ízlése szerint fejezzük be a végső simításokat.\r\n\r\nBurkolatok 15.000,- Ft/m2 áron választhatóak.\r\n\r\nFőbb adatok, elrendezés:\r\n\r\nKözel 40 m²-es nappali – konyha – étkező, hatalmas üvegfelületekkel\r\n\r\nSzülői háló saját, külön fürdőszobával\r\n\r\nKét nagy, külön nyíló hálószoba\r\n\r\nMásodik fürdőszoba káddal, zuhanyzóval, dupla mosdóval és WC-vel\r\n\r\nKülön Wc\r\n\r\nMini háztartási helyiség\r\n\r\n30 m²-es terasz\r\n\r\nTágas garázs kerti tárolóval\r\n\r\nA 640 m²-es, önálló telek teljes intimitást és szabadságot biztosít. A kert ideális pihenésre, kertészkedésre, családi összejövetelekre, de elfér rajta akár hinta, trambulin, medence vagy veteményes is.\r\n\r\nModern technológia, prémium kivitelezés:\r\n\r\nA ház kiemelkedően energiahatékony és hosszú távon is fenntartható otthon:\r\n\r\nHőszivattyús fűtés és hűtés (H-tarifával)\r\n\r\nHővisszanyerős szellőztetőrendszer a kitűnő levegőminőségért és extra energiavisszanyerésért\r\n\r\nOkosotthon rendszer, amely bárhonnan vezérelhető (fűtés, hűtés, stb.)\r\n\r\nPrémium INTERNORM nyílászárók motoros SCHLOTTERER zsalúziával\r\n\r\nKözponti klímatizálás minden helyiségben\r\n\r\nHőszivattyús melegvíz-tároló\r\n\r\n3 fázis, 3×25A\r\n\r\nEmelt szintű műszaki tartalom:\r\n\r\n50 cm széles vasbeton sávalapozás\r\n\r\n15 cm EPS 100 padlószigetelés\r\n\r\nYtong 30 cm főfalak\r\n\r\n15 cm grafit-system hőszigetelő rendszer\r\n\r\n40 cm födémszigetelés kőzetgyapottal\r\n\r\nBramac antracit beton sík tetőfedés\r\n\r\nMindez garantálja a kiemelkedő hő- és hangszigetelést, az alacsony rezsit, és a hosszú távú értékállóságot.\r\n\r\nKörnyezet és közlekedés:\r\n\r\nA Bókay-telep az egyik legkeresettebb része Pestszentlőrincnek – nyugodt, zöld, családbarát, de mégis remekül megközelíthető:\r\n\r\nBuszok: 36, 93, 93A, 236, 236A\r\n\r\n50-es villamos néhány perc sétára\r\n\r\nA belváros és a repülőtér is gyorsan elérhető\r\n\r\nA közelben bölcsőde, óvoda, iskola, orvosi rendelő, posta, önkormányzat, játszótér és bevásárlási lehetőség is található, így a mindennapi élet minden kényelme adott.\r\n\r\nÖsszegzés:\r\n\r\nEz a földszintes, modern családi ház tökéletes választás:\r\n\r\ncsaládoknak, akik szeretnének biztonságos, zöld környezetben élni,\r\n\r\npároknak, akik új, energiatakarékos otthont keresnek,\r\n\r\nbefektetőknek, akik értékálló ingatlant vásárolnának kiemelt lokációban.\r\n\r\n- Az ingatlan jelenlegi állapota lehetővé teszi, hogy a burkolatok és szaniterek még az új tulajdonos ízlése szerint kerüljenek kiválasztásra.\r\n\r\n- Közvetlenül beruházótól eladó!\r\nTovábbi információért, műszaki leírásért és megtekintésért kérem, keressen bizalommal.', 'lakas', 'elado', 180000000, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Budapest ', 'XVIII', NULL, NULL, NULL, NULL, NULL, 130.00, 4, 2, 2, 0, NULL, 'felujitando', NULL, 'aktiv', NULL, NULL, 0, 8, '2026-03-05 08:54:50', '2026-04-05 11:51:16', 0, NULL, NULL),
(7, 31, 'Délegyháza eladó családi ház 5 szobás', '\r\nTágas, igényes otthon eladó nagy kerttel Budapestre költözés miatt. – 139 millió Ft\r\n\r\nFőbb jellemzők:\r\n\r\nAz eladásra kínált, gondosan megtervezett ház tágas belső terekkel és gyönyörű, parkosított kerttel rendelkezik. A Leylandi Ciprus végigfut a kerítés mentén, maximális intimitást biztosítva, míg az automata locsolórendszer a fúrt kútból gondoskodik a növények egészséges növekedéséről.\r\n\r\nA két oldalon is teraszos ház egyik nagy előnye a hátsó, árnyékos terasz, amely tökéletes helyszíne a reggeli kávézásnak vagy egy délutáni pihenésnek.\r\n\r\nA kert igazi különlegesség: vasúti talpfákból épített magas ágyások, körte- és barackfák, míg a ház melletti területen meggyfa, szilvafa, fügebokor, ribizli bokor és látványos pampafüvek várják az új tulajdonost. A kerti eszközök tárolására egy praktikus kis ház is rendelkezésre áll, amelyet nemrég frissen lelakkoztunk, valamint a ház oldalán fedett tárolórész biztosít extra helyet.\r\n\r\nA ház belső kialakítása is lenyűgöző:\r\n\r\n3 kényelmes hálószoba.\r\n\r\nDolgozószoba – ideális otthoni munkavégzéshez, a zavartalan hálózatot a Telekom optikai kábeles vezeték nélküli internet hozzáférése biztosítja.\r\n\r\nTágas gardróbszoba.\r\n\r\nModern fürdőszoba káddal, illetve külön vendégfürdő zuhanyzóval.\r\n\r\nNagy nappali egyedi, extra méretű kanapéval.\r\n\r\nMosókonyha szárítóval és vízlágyító rendszerrel, amely selymessé varázsolja a vizet.\r\n\r\nSpájz.\r\n\r\nLedes hangulatvilágítás a hálószobákban és nappaliban – a meghitt estéket garantálja.\r\n\r\nA kocsibeálló két jármű számára is bőven elegendő helyet kínál. A kapu távirányítós, Ditec motorral rendelkezik.\r\n\r\nEz a ház nem csupán lakóhely, hanem egy igazi élettér, ahol minden részlet a kényelmet és az életminőséget szolgálja.\r\n\r\nPer, tehermentes, a saját ingatlanom.\r\n\r\nÁr: 139 millió forint.\r\n\r\nNe maradjon le erről a kivételes lehetőségről – jöjjön el, és győződjön meg róla személyesen!', 'lakas', 'elado', 138999998, NULL, 'HUF', 'MagyarorszÃ¡g', NULL, 'Délegyháza', NULL, NULL, NULL, NULL, NULL, NULL, 150.00, 5, 2, NULL, 1, 2013, 'uj', NULL, 'aktiv', NULL, NULL, 0, 2, '2026-03-05 08:57:49', '2026-04-06 23:49:17', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ingatlan_megtekintesek`
--

CREATE TABLE `ingatlan_megtekintesek` (
  `id` int NOT NULL,
  `ingatlan_id` int NOT NULL,
  `ip_cim` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `felhasznalo_id` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `megtekintve_datum` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ingatlan_megtekintesek`
--

INSERT INTO `ingatlan_megtekintesek` (`id`, `ingatlan_id`, `ip_cim`, `user_agent`, `felhasznalo_id`, `session_id`, `megtekintve_datum`) VALUES
(28, 1, '195.199.156.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', NULL, 'GFaUBvzClE5q6x7Pd03tEReAQby_juSu', '2026-03-05 08:40:06'),
(29, 2, '195.199.156.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', NULL, 'DltY9GaY4zHcDL4OElxnut8nCx9wrueG', '2026-03-05 08:44:38'),
(30, 3, '195.199.156.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', NULL, 'v4giqj0WJIas1xTS8OM4ok5JROu_RhqK', '2026-03-05 08:48:04'),
(31, 4, '195.199.156.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'lfTQYKczPYPmfectYEqIdQUfTMhQAOyL', '2026-03-05 08:52:03'),
(32, 6, '195.199.156.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0', NULL, 'jd1xLl9JRu-0iLSK2jjsfcp6zjfnXs11', '2026-03-05 08:54:55'),
(33, 5, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'aTvjgNktt-MnBzmS36jEVSyOeSpf1aei', '2026-03-05 12:49:36'),
(34, 6, '66.249.68.71', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.132 Mobile Safari/537.36 (compatible; GoogleOther)', NULL, 'HCj86LIKbkjKO4wB2bfYfRooOJsn9lL4', '2026-03-05 19:44:19'),
(35, 6, '66.249.68.64', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.7559.132 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', NULL, 'WXi9m892BCKPb0KS_Mb42C8VJT0MbwXm', '2026-03-05 21:39:38'),
(36, 7, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'psn82joOcFSK2OB_QUSxrsXkgA8ZZbnU', '2026-03-07 12:34:48'),
(37, 1, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'JwJ8s8i5zH25YoIcIf5L6901QqzjLp5P', '2026-03-07 12:48:20'),
(38, 3, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'LyQein7ZKAB3_CsD2HaisKAXhAxjjAoD', '2026-03-07 13:16:21'),
(40, 2, '62.201.90.230', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/550.0.0.28.106;FBBV/890844927;FBDV/iPhone15,4;FBMD/iPhone;FBSN/iOS;FBSV/26.3;FBSS/3;FBCR/;FBID/phone;FBLC/en_GB;FBOP/80]', NULL, '9TlcbBpXuftGlur8P8RLnejf-7iW-m4P', '2026-03-07 16:25:19'),
(42, 3, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'hJ-IqL0rUSkNO_WuI603IprreDgD_t6a', '2026-03-08 18:59:57'),
(43, 2, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'yqUVGnRdK9fBqN7vc03pGRcOP66PxJaO', '2026-03-08 19:01:32'),
(44, 6, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'lw-7-JD5lV5rxjvxtnvORv1oXaVSefmF', '2026-03-08 19:02:18'),
(45, 1, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, '-YxIJg2PMxPbu7Rj_GVNaA_87GHvj9cu', '2026-03-08 19:04:21'),
(46, 2, '57.129.4.123', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36', NULL, 'hKZzPatbyOKnkTyl5TwZaRvFytMs7jC1', '2026-03-09 15:38:10'),
(47, 3, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'fTEDvIcSsSA1uMZ2_htgKhcmBO35T52Q', '2026-03-09 21:17:12'),
(48, 2, '66.249.68.71', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.116 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', NULL, 'SMd4vbb73fXce7ZTDa-EK-vhY5Qf5q3q', '2026-03-11 17:05:32'),
(49, 5, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', NULL, 'fkawXjScJiQlAVmRVaAGeom3TXqVLYTD', '2026-03-12 06:52:54'),
(50, 1, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', NULL, '6p1V9h2T-kk1erhMFF8PpFDajw3eUhNm', '2026-03-12 07:00:21'),
(51, 3, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', NULL, 'nikbe1KQ1OGKQ9V95G7iYD4dboli79Ff', '2026-03-12 07:00:41'),
(52, 3, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', NULL, '0dG4md46UEX-Y02VWV0sknKFpBPT0bs3', '2026-03-13 14:38:26'),
(53, 1, '62.201.90.230', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', NULL, 'vdar18FzYH4cNT3E1FevF8qOICE4PwiV', '2026-03-13 16:13:46'),
(54, 4, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, '2a4AieixEhu-K83PNIhAh1eOqwrXaHQ3', '2026-03-17 07:29:57'),
(55, 1, '84.225.187.53', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.159 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'LddLQ0AQIuLwRi_4Wivm_6rmtC1yHSrv', '2026-03-18 07:04:10'),
(56, 4, '84.225.187.53', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.159 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'DTaKgTdPrRlL2wUf_BGsHZAOv52m-bC9', '2026-03-18 07:05:06'),
(57, 1, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', NULL, '2MIvVB2EmDSy4ph39VeL28Udr9vUtX2B', '2026-03-18 07:33:31'),
(58, 2, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', NULL, 'ZHkYB-3TnxugBoQitG2VnpG-T3QkT18e', '2026-03-18 07:52:53'),
(59, 6, '84.225.182.218', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.162 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'b-nCgMQcyow2jy9mLcST6S-vO9bcmQxj', '2026-03-20 07:46:18'),
(60, 5, '84.225.182.218', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.162 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'OOGu4nxVjQqSyr7f6fixB6Rz1tptIRk7', '2026-03-20 07:46:26'),
(61, 3, '84.225.182.218', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.162 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'ebsz6cX5xR944mOcpv7h5Vp-JT0x3iLb', '2026-03-20 07:47:01'),
(62, 4, '84.225.182.218', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.162 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, '31VuyRjZCexz1tnBz43BfSsli437fMKm', '2026-03-20 07:47:25'),
(63, 1, '84.225.182.218', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/145.0.7632.162 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/552.0.0.44.65;]', NULL, 'byXeV7Kn5D1fUk1tcRYOzh89wx9TgNyw', '2026-03-20 07:47:36'),
(64, 1, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', NULL, 'BOtr4dEgMy63ARq1bcncFMEzc1sq0XhX', '2026-03-20 09:27:35'),
(65, 3, '195.199.205.41', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', NULL, 'Z4LPQdt5GRv2hanHrTcG2PakVlfIZKJ4', '2026-03-20 09:48:16'),
(66, 5, '17.241.219.31', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, 'BxKlZgefoNguK9XjLd5MtsJQKQSxtPNl', '2026-04-01 11:59:27'),
(67, 2, '17.241.75.47', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, 'Y61fDj5VswY01v60E_PuASoaeT4KGwW2', '2026-04-01 12:30:31'),
(68, 6, '66.249.77.100', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.7680.164 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', NULL, 'BffhS_JECDmr5OfRMAwQBhepsf1o0I2X', '2026-04-02 07:48:57'),
(69, 6, '66.249.77.97', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.7680.164 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', NULL, 'tQmLLVJsesKfbhJJpbm8Hmzrm7gvcCF_', '2026-04-02 07:49:00'),
(70, 3, '17.241.227.119', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, '8eGFMT9XSCsDs-RKQkUGxqJ9IQ_DntXT', '2026-04-05 11:47:37'),
(71, 6, '17.22.245.42', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, 'xVNgPMIt7raAgnFPCpOnNEX4JG4NFe8I', '2026-04-05 11:51:16'),
(72, 7, '17.241.75.130', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, 'p1lCb0COR7SGdp6PDWV5jcj-51mOU5xv', '2026-04-06 23:49:17'),
(73, 4, '17.22.253.139', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)', NULL, 'i5mcjxNGGUfNwN7h-LJBtS7zAB5kXlS-', '2026-04-07 10:44:53'),
(74, 5, '62.201.90.230', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1', NULL, 'tIeaPLmOV7vu9wv1IJ93boxU7LxW6OmZ', '2026-04-07 21:32:37'),
(75, 1, '40.77.167.27', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', NULL, 'GiLT5vg4zo9d1bcT57uTa5Y_dLJWJSHc', '2026-04-08 02:48:05');

-- --------------------------------------------------------

--
-- Stand-in structure for view `ingatlan_statisztikak`
-- (See below for the actual view)
--
CREATE TABLE `ingatlan_statisztikak` (
`id` int
,`cim` varchar(200)
,`osszes_megtekintes` bigint
,`egyedi_latogatok` bigint
,`megtekintett_napok` bigint
,`heti_megtekintes` bigint
,`havi_megtekintes` bigint
,`napi_megtekintes` bigint
);

-- --------------------------------------------------------

--
-- Table structure for table `kedvencek`
--

CREATE TABLE `kedvencek` (
  `id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `ingatlan_id` int NOT NULL,
  `hozzaadva` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `kedvencek`
--

INSERT INTO `kedvencek` (`id`, `felhasznalo_id`, `ingatlan_id`, `hozzaadva`) VALUES
(9, 31, 1, '2026-03-05 08:57:56'),
(11, 29, 3, '2026-03-07 13:16:47'),
(12, 29, 1, '2026-03-07 14:03:02'),
(15, 29, 5, '2026-04-07 21:32:39');

-- --------------------------------------------------------

--
-- Table structure for table `kepek`
--

CREATE TABLE `kepek` (
  `id` int NOT NULL,
  `ingatlan_id` int NOT NULL,
  `fajlnev` varchar(255) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `fajl_utvonal` varchar(500) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `sorrend` int DEFAULT '0',
  `fo_kep` tinyint(1) DEFAULT '0',
  `feltoltve` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Dumping data for table `kepek`
--

INSERT INTO `kepek` (`id`, `ingatlan_id`, `fajlnev`, `fajl_utvonal`, `sorrend`, `fo_kep`, `feltoltve`) VALUES
(67, 1, 'ingatlan-1772700001685-511472155.webp', '/uploads/properties/ingatlan-1772700001685-511472155.webp', 0, 1, '2026-03-05 08:40:01'),
(68, 1, 'ingatlan-1772700001688-599206133.webp', '/uploads/properties/ingatlan-1772700001688-599206133.webp', 1, 0, '2026-03-05 08:40:01'),
(69, 1, 'ingatlan-1772700001696-29744757.webp', '/uploads/properties/ingatlan-1772700001696-29744757.webp', 2, 0, '2026-03-05 08:40:01'),
(70, 1, 'ingatlan-1772700001726-391489980.webp', '/uploads/properties/ingatlan-1772700001726-391489980.webp', 3, 0, '2026-03-05 08:40:01'),
(71, 1, 'ingatlan-1772700001735-544359912.webp', '/uploads/properties/ingatlan-1772700001735-544359912.webp', 4, 0, '2026-03-05 08:40:01'),
(72, 1, 'ingatlan-1772700001742-546729850.webp', '/uploads/properties/ingatlan-1772700001742-546729850.webp', 5, 0, '2026-03-05 08:40:01'),
(73, 1, 'ingatlan-1772700001753-744165628.webp', '/uploads/properties/ingatlan-1772700001753-744165628.webp', 6, 0, '2026-03-05 08:40:01'),
(74, 1, 'ingatlan-1772700001758-13607170.webp', '/uploads/properties/ingatlan-1772700001758-13607170.webp', 7, 0, '2026-03-05 08:40:01'),
(75, 2, 'ingatlan-1772700272384-205266961.webp', '/uploads/properties/ingatlan-1772700272384-205266961.webp', 0, 1, '2026-03-05 08:44:32'),
(76, 2, 'ingatlan-1772700272390-274817800.webp', '/uploads/properties/ingatlan-1772700272390-274817800.webp', 1, 0, '2026-03-05 08:44:32'),
(77, 2, 'ingatlan-1772700272402-184525176.webp', '/uploads/properties/ingatlan-1772700272402-184525176.webp', 2, 0, '2026-03-05 08:44:32'),
(78, 2, 'ingatlan-1772700272416-722727873.webp', '/uploads/properties/ingatlan-1772700272416-722727873.webp', 3, 0, '2026-03-05 08:44:32'),
(79, 2, 'ingatlan-1772700272421-561724675.webp', '/uploads/properties/ingatlan-1772700272421-561724675.webp', 4, 0, '2026-03-05 08:44:32'),
(80, 2, 'ingatlan-1772700272423-802172897.webp', '/uploads/properties/ingatlan-1772700272423-802172897.webp', 5, 0, '2026-03-05 08:44:32'),
(81, 2, 'ingatlan-1772700272426-181453875.webp', '/uploads/properties/ingatlan-1772700272426-181453875.webp', 6, 0, '2026-03-05 08:44:32'),
(82, 2, 'ingatlan-1772700272430-75448863.webp', '/uploads/properties/ingatlan-1772700272430-75448863.webp', 7, 0, '2026-03-05 08:44:32'),
(83, 3, 'ingatlan-1772700481385-873629997.webp', '/uploads/properties/ingatlan-1772700481385-873629997.webp', 0, 1, '2026-03-05 08:48:01'),
(84, 3, 'ingatlan-1772700481388-155380296.webp', '/uploads/properties/ingatlan-1772700481388-155380296.webp', 1, 0, '2026-03-05 08:48:01'),
(85, 3, 'ingatlan-1772700481395-531058252.webp', '/uploads/properties/ingatlan-1772700481395-531058252.webp', 2, 0, '2026-03-05 08:48:01'),
(86, 3, 'ingatlan-1772700481405-62656485.webp', '/uploads/properties/ingatlan-1772700481405-62656485.webp', 3, 0, '2026-03-05 08:48:01'),
(87, 3, 'ingatlan-1772700481412-414603232.webp', '/uploads/properties/ingatlan-1772700481412-414603232.webp', 4, 0, '2026-03-05 08:48:01'),
(88, 3, 'ingatlan-1772700481425-562178607.webp', '/uploads/properties/ingatlan-1772700481425-562178607.webp', 5, 0, '2026-03-05 08:48:01'),
(89, 3, 'ingatlan-1772700481428-405875028.webp', '/uploads/properties/ingatlan-1772700481428-405875028.webp', 6, 0, '2026-03-05 08:48:01'),
(90, 3, 'ingatlan-1772700481432-553604412.webp', '/uploads/properties/ingatlan-1772700481432-553604412.webp', 7, 0, '2026-03-05 08:48:01'),
(91, 3, 'ingatlan-1772700481434-350401008.webp', '/uploads/properties/ingatlan-1772700481434-350401008.webp', 8, 0, '2026-03-05 08:48:01'),
(92, 3, 'ingatlan-1772700481435-128964657.webp', '/uploads/properties/ingatlan-1772700481435-128964657.webp', 9, 0, '2026-03-05 08:48:01'),
(93, 4, 'ingatlan-1772700646319-832799044.webp', '/uploads/properties/ingatlan-1772700646319-832799044.webp', 0, 1, '2026-03-05 08:50:46'),
(94, 4, 'ingatlan-1772700646321-581407616.webp', '/uploads/properties/ingatlan-1772700646321-581407616.webp', 1, 0, '2026-03-05 08:50:46'),
(95, 4, 'ingatlan-1772700646324-274745349.webp', '/uploads/properties/ingatlan-1772700646324-274745349.webp', 2, 0, '2026-03-05 08:50:46'),
(96, 4, 'ingatlan-1772700646329-653691227.webp', '/uploads/properties/ingatlan-1772700646329-653691227.webp', 3, 0, '2026-03-05 08:50:46'),
(97, 4, 'ingatlan-1772700646336-365501730.webp', '/uploads/properties/ingatlan-1772700646336-365501730.webp', 4, 0, '2026-03-05 08:50:46'),
(98, 4, 'ingatlan-1772700646344-168983676.webp', '/uploads/properties/ingatlan-1772700646344-168983676.webp', 5, 0, '2026-03-05 08:50:46'),
(99, 4, 'ingatlan-1772700646345-545310729.webp', '/uploads/properties/ingatlan-1772700646345-545310729.webp', 6, 0, '2026-03-05 08:50:46'),
(100, 4, 'ingatlan-1772700646346-772436566.webp', '/uploads/properties/ingatlan-1772700646346-772436566.webp', 7, 0, '2026-03-05 08:50:46'),
(101, 4, 'ingatlan-1772700646347-279507045.webp', '/uploads/properties/ingatlan-1772700646347-279507045.webp', 8, 0, '2026-03-05 08:50:46'),
(102, 4, 'ingatlan-1772700646351-100542737.webp', '/uploads/properties/ingatlan-1772700646351-100542737.webp', 9, 0, '2026-03-05 08:50:46'),
(103, 5, 'ingatlan-1772700752673-642546228.webp', '/uploads/properties/ingatlan-1772700752673-642546228.webp', 0, 1, '2026-03-05 08:52:32'),
(104, 5, 'ingatlan-1772700752675-584846858.webp', '/uploads/properties/ingatlan-1772700752675-584846858.webp', 1, 0, '2026-03-05 08:52:32'),
(105, 5, 'ingatlan-1772700752677-458067330.webp', '/uploads/properties/ingatlan-1772700752677-458067330.webp', 2, 0, '2026-03-05 08:52:32'),
(106, 5, 'ingatlan-1772700752683-854854120.webp', '/uploads/properties/ingatlan-1772700752683-854854120.webp', 3, 0, '2026-03-05 08:52:32'),
(107, 5, 'ingatlan-1772700752704-20437444.webp', '/uploads/properties/ingatlan-1772700752704-20437444.webp', 4, 0, '2026-03-05 08:52:32'),
(108, 5, 'ingatlan-1772700752711-724162865.webp', '/uploads/properties/ingatlan-1772700752711-724162865.webp', 5, 0, '2026-03-05 08:52:32'),
(109, 5, 'ingatlan-1772700752713-290577526.webp', '/uploads/properties/ingatlan-1772700752713-290577526.webp', 6, 0, '2026-03-05 08:52:32'),
(110, 5, 'ingatlan-1772700752715-272923078.webp', '/uploads/properties/ingatlan-1772700752715-272923078.webp', 7, 0, '2026-03-05 08:52:32'),
(111, 5, 'ingatlan-1772700752716-206772832.webp', '/uploads/properties/ingatlan-1772700752716-206772832.webp', 8, 0, '2026-03-05 08:52:32'),
(112, 6, 'ingatlan-1772700890888-316343730.webp', '/uploads/properties/ingatlan-1772700890888-316343730.webp', 0, 1, '2026-03-05 08:54:50'),
(113, 6, 'ingatlan-1772700890890-980787614.webp', '/uploads/properties/ingatlan-1772700890890-980787614.webp', 1, 0, '2026-03-05 08:54:50'),
(114, 6, 'ingatlan-1772700890893-198847604.webp', '/uploads/properties/ingatlan-1772700890893-198847604.webp', 2, 0, '2026-03-05 08:54:50'),
(115, 6, 'ingatlan-1772700890897-883279702.webp', '/uploads/properties/ingatlan-1772700890897-883279702.webp', 3, 0, '2026-03-05 08:54:50'),
(116, 6, 'ingatlan-1772700890903-652443465.webp', '/uploads/properties/ingatlan-1772700890903-652443465.webp', 4, 0, '2026-03-05 08:54:50'),
(117, 6, 'ingatlan-1772700890907-527271481.webp', '/uploads/properties/ingatlan-1772700890907-527271481.webp', 5, 0, '2026-03-05 08:54:50'),
(118, 6, 'ingatlan-1772700890913-21236079.webp', '/uploads/properties/ingatlan-1772700890913-21236079.webp', 6, 0, '2026-03-05 08:54:50'),
(119, 6, 'ingatlan-1772700890918-669793625.webp', '/uploads/properties/ingatlan-1772700890918-669793625.webp', 7, 0, '2026-03-05 08:54:50'),
(120, 7, 'ingatlan-1772701069631-751723661.webp', '/uploads/properties/ingatlan-1772701069631-751723661.webp', 0, 1, '2026-03-05 08:57:49'),
(121, 7, 'ingatlan-1772701069635-452479241.webp', '/uploads/properties/ingatlan-1772701069635-452479241.webp', 1, 0, '2026-03-05 08:57:49'),
(122, 7, 'ingatlan-1772701069637-462888568.webp', '/uploads/properties/ingatlan-1772701069637-462888568.webp', 2, 0, '2026-03-05 08:57:49'),
(123, 7, 'ingatlan-1772701069644-925368698.webp', '/uploads/properties/ingatlan-1772701069644-925368698.webp', 3, 0, '2026-03-05 08:57:49'),
(124, 7, 'ingatlan-1772701069651-283584296.webp', '/uploads/properties/ingatlan-1772701069651-283584296.webp', 4, 0, '2026-03-05 08:57:49'),
(125, 7, 'ingatlan-1772701069654-826706678.webp', '/uploads/properties/ingatlan-1772701069654-826706678.webp', 5, 0, '2026-03-05 08:57:49'),
(126, 7, 'ingatlan-1772701069659-251038057.webp', '/uploads/properties/ingatlan-1772701069659-251038057.webp', 6, 0, '2026-03-05 08:57:49'),
(127, 7, 'ingatlan-1772701069668-516978871.webp', '/uploads/properties/ingatlan-1772701069668-516978871.webp', 7, 0, '2026-03-05 08:57:49');

-- --------------------------------------------------------

--
-- Stand-in structure for view `kiemelt_ingatlanok`
-- (See below for the actual view)
--
CREATE TABLE `kiemelt_ingatlanok` (
`id` int
,`felhasznalo_id` int
,`cim` varchar(200)
,`leiras` text
,`tipus` enum('lakas','haz','telek','iroda','garÃ¡zs','egyÃ©b')
,`tranzakcio_tipus` enum('elado','kiado')
,`ar` bigint
,`penznem` enum('HUF','EUR','USD')
,`orszag` varchar(50)
,`megye` varchar(50)
,`varos` varchar(100)
,`kerulet` varchar(50)
,`iranyitoszam` varchar(10)
,`utca` varchar(150)
,`hazszam` varchar(20)
,`latitude` decimal(10,8)
,`longitude` decimal(11,8)
,`alapterulet` decimal(8,2)
,`szobak_szama` int
,`furdok_szama` int
,`emelet` int
,`osszkomfort` tinyint(1)
,`epitesi_ev` int
,`allapot` enum('uj','felujitott','felujitando','bontas')
,`extrak` json
,`statusz` enum('aktiv','inaktiv','elkuldte','torolve')
,`kiemelt` tinyint(1)
,`megtekintesek` int
,`letrehozva` timestamp
,`frissitve` timestamp
,`hirdeto_nev` varchar(100)
,`hirdeto_telefon` varchar(20)
,`hirdeto_email` varchar(100)
,`kepek` text
,`fo_kep` varchar(500)
);

-- --------------------------------------------------------

--
-- Table structure for table `mentett_keresesek`
--

CREATE TABLE `mentett_keresesek` (
  `id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `nev` varchar(100) COLLATE utf8mb4_hungarian_ci NOT NULL,
  `szures_parameterek` json NOT NULL,
  `ertesites_aktiv` tinyint(1) DEFAULT '0',
  `letrehozva` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL,
  `felhasznalo_id` int NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `uzenetek`
--

CREATE TABLE `uzenetek` (
  `id` int NOT NULL,
  `kuldo_id` int NOT NULL,
  `fogado_id` int NOT NULL,
  `ingatlan_id` int DEFAULT NULL,
  `targy` varchar(200) COLLATE utf8mb4_hungarian_ci DEFAULT NULL,
  `uzenet` text COLLATE utf8mb4_hungarian_ci NOT NULL,
  `olvasott` tinyint(1) DEFAULT '0',
  `kuldes_ideje` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `torolt_kuldo` tinyint(1) DEFAULT '0',
  `torolt_fogado` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ertesitesek`
--
ALTER TABLE `ertesitesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`),
  ADD KEY `idx_olvasott` (`olvasott`);

--
-- Indexes for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_szerepkor` (`szerepkor`);

--
-- Indexes for table `ingatlanok`
--
ALTER TABLE `ingatlanok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_varos` (`varos`),
  ADD KEY `idx_tipus` (`tipus`),
  ADD KEY `idx_tranzakcio` (`tranzakcio_tipus`),
  ADD KEY `idx_ar` (`ar`),
  ADD KEY `idx_statusz` (`statusz`),
  ADD KEY `idx_kiemelt` (`kiemelt`),
  ADD KEY `idx_varos_tipus_ar` (`varos`,`tipus`,`ar`),
  ADD KEY `idx_statusz_kiemelt` (`statusz`,`kiemelt`,`frissitve`),
  ADD KEY `idx_felhasznalo_statusz` (`felhasznalo_id`,`statusz`),
  ADD KEY `idx_lefoglalva` (`lefoglalva`);
ALTER TABLE `ingatlanok` ADD FULLTEXT KEY `idx_kereso` (`cim`,`leiras`,`varos`,`utca`);

--
-- Indexes for table `ingatlan_megtekintesek`
--
ALTER TABLE `ingatlan_megtekintesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ingatlan` (`ingatlan_id`),
  ADD KEY `idx_ip` (`ip_cim`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`),
  ADD KEY `idx_datum` (`megtekintve_datum`),
  ADD KEY `idx_view_check` (`ingatlan_id`,`ip_cim`,`felhasznalo_id`);

--
-- Indexes for table `kedvencek`
--
ALTER TABLE `kedvencek`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_kedvenc` (`felhasznalo_id`,`ingatlan_id`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`),
  ADD KEY `idx_ingatlan` (`ingatlan_id`);

--
-- Indexes for table `kepek`
--
ALTER TABLE `kepek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ingatlan` (`ingatlan_id`),
  ADD KEY `idx_sorrend` (`sorrend`);

--
-- Indexes for table `mentett_keresesek`
--
ALTER TABLE `mentett_keresesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_felhasznalo` (`felhasznalo_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_expires` (`expires_at`);

--
-- Indexes for table `uzenetek`
--
ALTER TABLE `uzenetek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingatlan_id` (`ingatlan_id`),
  ADD KEY `idx_kuldo` (`kuldo_id`),
  ADD KEY `idx_fogado` (`fogado_id`),
  ADD KEY `idx_olvasott` (`olvasott`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ertesitesek`
--
ALTER TABLE `ertesitesek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `ingatlanok`
--
ALTER TABLE `ingatlanok`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ingatlan_megtekintesek`
--
ALTER TABLE `ingatlan_megtekintesek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `kedvencek`
--
ALTER TABLE `kedvencek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `kepek`
--
ALTER TABLE `kepek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `mentett_keresesek`
--
ALTER TABLE `mentett_keresesek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `uzenetek`
--
ALTER TABLE `uzenetek`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

-- --------------------------------------------------------

--
-- Structure for view `aktiv_ingatlanok_kepekkel`
--
DROP TABLE IF EXISTS `aktiv_ingatlanok_kepekkel`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ingatlan_user`@`localhost` SQL SECURITY DEFINER VIEW `aktiv_ingatlanok_kepekkel`  AS SELECT `i`.`id` AS `id`, `i`.`felhasznalo_id` AS `felhasznalo_id`, `i`.`cim` AS `cim`, `i`.`leiras` AS `leiras`, `i`.`tipus` AS `tipus`, `i`.`tranzakcio_tipus` AS `tranzakcio_tipus`, `i`.`ar` AS `ar`, `i`.`penznem` AS `penznem`, `i`.`orszag` AS `orszag`, `i`.`megye` AS `megye`, `i`.`varos` AS `varos`, `i`.`kerulet` AS `kerulet`, `i`.`iranyitoszam` AS `iranyitoszam`, `i`.`utca` AS `utca`, `i`.`hazszam` AS `hazszam`, `i`.`latitude` AS `latitude`, `i`.`longitude` AS `longitude`, `i`.`alapterulet` AS `alapterulet`, `i`.`szobak_szama` AS `szobak_szama`, `i`.`furdok_szama` AS `furdok_szama`, `i`.`emelet` AS `emelet`, `i`.`osszkomfort` AS `osszkomfort`, `i`.`epitesi_ev` AS `epitesi_ev`, `i`.`allapot` AS `allapot`, `i`.`extrak` AS `extrak`, `i`.`statusz` AS `statusz`, `i`.`kiemelt` AS `kiemelt`, `i`.`megtekintesek` AS `megtekintesek`, `i`.`letrehozva` AS `letrehozva`, `i`.`frissitve` AS `frissitve`, `f`.`nev` AS `hirdeto_nev`, `f`.`telefon` AS `hirdeto_telefon`, `f`.`email` AS `hirdeto_email`, group_concat(`k`.`fajl_utvonal` order by `k`.`sorrend` ASC separator ',') AS `kepek`, (select `kepek`.`fajl_utvonal` from `kepek` where ((`kepek`.`ingatlan_id` = `i`.`id`) and (`kepek`.`fo_kep` = true)) limit 1) AS `fo_kep` FROM ((`ingatlanok` `i` left join `felhasznalok` `f` on((`i`.`felhasznalo_id` = `f`.`id`))) left join `kepek` `k` on((`i`.`id` = `k`.`ingatlan_id`))) WHERE (`i`.`statusz` = 'aktiv') GROUP BY `i`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `ingatlan_statisztikak`
--
DROP TABLE IF EXISTS `ingatlan_statisztikak`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ingatlan_user`@`localhost` SQL SECURITY DEFINER VIEW `ingatlan_statisztikak`  AS SELECT `i`.`id` AS `id`, `i`.`cim` AS `cim`, count(distinct `im`.`id`) AS `osszes_megtekintes`, count(distinct `im`.`ip_cim`) AS `egyedi_latogatok`, count(distinct cast(`im`.`megtekintve_datum` as date)) AS `megtekintett_napok`, count(distinct (case when (`im`.`megtekintve_datum` >= (now() - interval 7 day)) then `im`.`id` end)) AS `heti_megtekintes`, count(distinct (case when (`im`.`megtekintve_datum` >= (now() - interval 30 day)) then `im`.`id` end)) AS `havi_megtekintes`, count(distinct (case when (`im`.`megtekintve_datum` >= (now() - interval 1 day)) then `im`.`id` end)) AS `napi_megtekintes` FROM (`ingatlanok` `i` left join `ingatlan_megtekintesek` `im` on((`i`.`id` = `im`.`ingatlan_id`))) GROUP BY `i`.`id`, `i`.`cim` ;

-- --------------------------------------------------------

--
-- Structure for view `kiemelt_ingatlanok`
--
DROP TABLE IF EXISTS `kiemelt_ingatlanok`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ingatlan_user`@`localhost` SQL SECURITY DEFINER VIEW `kiemelt_ingatlanok`  AS SELECT `aktiv_ingatlanok_kepekkel`.`id` AS `id`, `aktiv_ingatlanok_kepekkel`.`felhasznalo_id` AS `felhasznalo_id`, `aktiv_ingatlanok_kepekkel`.`cim` AS `cim`, `aktiv_ingatlanok_kepekkel`.`leiras` AS `leiras`, `aktiv_ingatlanok_kepekkel`.`tipus` AS `tipus`, `aktiv_ingatlanok_kepekkel`.`tranzakcio_tipus` AS `tranzakcio_tipus`, `aktiv_ingatlanok_kepekkel`.`ar` AS `ar`, `aktiv_ingatlanok_kepekkel`.`penznem` AS `penznem`, `aktiv_ingatlanok_kepekkel`.`orszag` AS `orszag`, `aktiv_ingatlanok_kepekkel`.`megye` AS `megye`, `aktiv_ingatlanok_kepekkel`.`varos` AS `varos`, `aktiv_ingatlanok_kepekkel`.`kerulet` AS `kerulet`, `aktiv_ingatlanok_kepekkel`.`iranyitoszam` AS `iranyitoszam`, `aktiv_ingatlanok_kepekkel`.`utca` AS `utca`, `aktiv_ingatlanok_kepekkel`.`hazszam` AS `hazszam`, `aktiv_ingatlanok_kepekkel`.`latitude` AS `latitude`, `aktiv_ingatlanok_kepekkel`.`longitude` AS `longitude`, `aktiv_ingatlanok_kepekkel`.`alapterulet` AS `alapterulet`, `aktiv_ingatlanok_kepekkel`.`szobak_szama` AS `szobak_szama`, `aktiv_ingatlanok_kepekkel`.`furdok_szama` AS `furdok_szama`, `aktiv_ingatlanok_kepekkel`.`emelet` AS `emelet`, `aktiv_ingatlanok_kepekkel`.`osszkomfort` AS `osszkomfort`, `aktiv_ingatlanok_kepekkel`.`epitesi_ev` AS `epitesi_ev`, `aktiv_ingatlanok_kepekkel`.`allapot` AS `allapot`, `aktiv_ingatlanok_kepekkel`.`extrak` AS `extrak`, `aktiv_ingatlanok_kepekkel`.`statusz` AS `statusz`, `aktiv_ingatlanok_kepekkel`.`kiemelt` AS `kiemelt`, `aktiv_ingatlanok_kepekkel`.`megtekintesek` AS `megtekintesek`, `aktiv_ingatlanok_kepekkel`.`letrehozva` AS `letrehozva`, `aktiv_ingatlanok_kepekkel`.`frissitve` AS `frissitve`, `aktiv_ingatlanok_kepekkel`.`hirdeto_nev` AS `hirdeto_nev`, `aktiv_ingatlanok_kepekkel`.`hirdeto_telefon` AS `hirdeto_telefon`, `aktiv_ingatlanok_kepekkel`.`hirdeto_email` AS `hirdeto_email`, `aktiv_ingatlanok_kepekkel`.`kepek` AS `kepek`, `aktiv_ingatlanok_kepekkel`.`fo_kep` AS `fo_kep` FROM `aktiv_ingatlanok_kepekkel` WHERE (`aktiv_ingatlanok_kepekkel`.`kiemelt` = true) ORDER BY `aktiv_ingatlanok_kepekkel`.`frissitve` DESC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ertesitesek`
--
ALTER TABLE `ertesitesek`
  ADD CONSTRAINT `ertesitesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ingatlanok`
--
ALTER TABLE `ingatlanok`
  ADD CONSTRAINT `ingatlanok_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ingatlan_megtekintesek`
--
ALTER TABLE `ingatlan_megtekintesek`
  ADD CONSTRAINT `ingatlan_megtekintesek_ibfk_1` FOREIGN KEY (`ingatlan_id`) REFERENCES `ingatlanok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ingatlan_megtekintesek_ibfk_2` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `kedvencek`
--
ALTER TABLE `kedvencek`
  ADD CONSTRAINT `kedvencek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `kedvencek_ibfk_2` FOREIGN KEY (`ingatlan_id`) REFERENCES `ingatlanok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kepek`
--
ALTER TABLE `kepek`
  ADD CONSTRAINT `kepek_ibfk_1` FOREIGN KEY (`ingatlan_id`) REFERENCES `ingatlanok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mentett_keresesek`
--
ALTER TABLE `mentett_keresesek`
  ADD CONSTRAINT `mentett_keresesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `uzenetek`
--
ALTER TABLE `uzenetek`
  ADD CONSTRAINT `uzenetek_ibfk_1` FOREIGN KEY (`kuldo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `uzenetek_ibfk_2` FOREIGN KEY (`fogado_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `uzenetek_ibfk_3` FOREIGN KEY (`ingatlan_id`) REFERENCES `ingatlanok` (`id`) ON DELETE SET NULL;

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`ingatlan_user`@`localhost` EVENT `clean_old_views` ON SCHEDULE EVERY 1 DAY STARTS '2026-02-21 03:28:23' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    DELETE FROM ingatlan_megtekintesek 
    WHERE megtekintve_datum < DATE_SUB(NOW(), INTERVAL 90 DAY);
END$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
