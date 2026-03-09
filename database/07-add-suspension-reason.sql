-- ====================================
-- FELFÜGGESZTÉSI INDOK MEZŐ HOZZÁADÁSA
-- ====================================

ALTER TABLE ingatlanok 
ADD COLUMN IF NOT EXISTS felfuggesztve_indok TEXT NULL AFTER statusz,
ADD COLUMN IF NOT EXISTS felfuggesztve_datum DATETIME NULL AFTER felfuggesztve_indok;

