const API_BASE_URL = 'https://api.qurani.ai/gw/qh/v1';

export const QURAN_EDITION_ID = 'quran-uthmani';
export const NO_TAFSIR_ID = 'none';

async function requestQurani(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.code >= 400 || payload?.status === 'Error') {
    const message = typeof payload?.data === 'string' ? payload.data : 'تعذر تحميل البيانات من Qurani.ai.';
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

export async function fetchSurahCatalog(signal) {
  const surahs = await requestQurani('/surah/?revelationOrder=false', signal);
  if (!Array.isArray(surahs)) throw new Error('تعذر تحميل قائمة السور.');

  return surahs.map((surah) => ({
    ...surah,
    displayName: String(surah.name || '').replace(/^سورة\s*/, ''),
  }));
}

export async function fetchArabicTafsirEditions(signal) {
  const editions = await requestQurani('/edition?format=text&language=ar&type=tafsir', signal);
  if (!Array.isArray(editions)) return [];
  return editions.filter((edition) => edition?.identifier && edition?.type === 'tafsir');
}

export async function fetchSurahWithTafsir(surahNumber, tafsirId, signal) {
  if (!tafsirId || tafsirId === NO_TAFSIR_ID) {
    const surah = await requestQurani(
      `/surah/${surahNumber}/${QURAN_EDITION_ID}?limit=300&offset=0`,
      signal,
    );
    if (!surah || !Array.isArray(surah.ayahs)) throw new Error('تعذر تحميل آيات السورة.');

    return {
      ...surah,
      ayahs: surah.ayahs.map((ayah) => ({ ...ayah, tafsir: '' })),
    };
  }

  const editions = [QURAN_EDITION_ID, tafsirId]
    .map((editionId) => encodeURIComponent(editionId))
    .join(',');
  const result = await requestQurani(
    `/surah/${surahNumber}/editions/${editions}?limit=300&offset=0`,
    signal,
  );

  if (!Array.isArray(result)) throw new Error('تعذر تحميل آيات السورة.');

  const quranSurah = result.find((surah) => surah?.edition?.identifier === QURAN_EDITION_ID);
  const tafsirSurah = result.find((surah) => surah?.edition?.identifier === tafsirId);
  if (!quranSurah || !Array.isArray(quranSurah.ayahs)) {
    throw new Error('لم تصل آيات السورة من المصدر.');
  }

  const tafsirByAyah = new Map(
    (tafsirSurah?.ayahs || []).map((ayah) => [ayah.numberInSurah, ayah.text]),
  );

  return {
    ...quranSurah,
    ayahs: quranSurah.ayahs.map((ayah) => ({
      ...ayah,
      tafsir: tafsirByAyah.get(ayah.numberInSurah) || '',
    })),
  };
}
