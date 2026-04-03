# Kanji Detail Fix - TODO

## Status: [IN PROGRESS] ✅

### 1. [TODO] Create TODO.md
   - [x] Done: Track progress here

### 2. [TODO] Fix KanjiModal field mappings
   - Update `src/components/kanji/KanjiModal/index.tsx`:
     * meaning_vi → meaningVi
     * character → kanji  
     * jlpt_level → jlpt
     * radicals[] → display as joined list
     * related_vocabulary → vocabulary_examples
     * Remove/hide unsupported: frequency, category, kanji_analysis, structure

### 3. [TODO] Add safe rendering & helpers
   - Fallbacks: || 'Chưa có'
   - Helper function for consistent field access

### 4. [TODO] Test implementation
   - Navigate to `/kanji/一`
   - Open Modal → verify no undefined
   - Check all rows display correctly

### 5. [TODO] Update TODO & Complete
   - Mark steps done
   - attempt_completion

**Current Step: 2/5**
