/*
 * i18n.js — Français (défaut), English, Taqbaylit (graphie latine).
 * Corrections en taqbaylit bienvenues via PR.
 */
window.I18N = {
  fr: {
    title: "Tramage Atelier — générateur de tramage / halftone",
    tagline: "Tramage classique pour l'impression, 100 % dans le navigateur",
    language: "Langue",
    canvasLabel: "Aperçu du tramage",
    loadImage: "Charger une image",
    sample: "Image d'essai",
    dropHint: "Glissez une image ici (PNG, JPEG, WebP)",
    privacy: "Rien n'est envoyé : tout le calcul se fait sur votre appareil.",
    presets: "Préréglages",
    settings: "Réglages",
    pattern: "Motif",
    pat_dots: "Points (ronds)",
    pat_squares: "Carrés",
    pat_lines: "Lignes (angle)",
    pat_lines_h: "Lignes horizontales",
    pat_diamonds: "Losanges",
    cellSize: "Taille de cellule (LPI)",
    angle: "Angle de trame",
    contrast: "Contraste",
    bias: "Seuil (biais)",
    invert: "Inverser (négatif)",
    ink: "Couleur d'encre",
    paper: "Couleur du papier",
    duotone: "Duotone (2e encre)",
    ink2: "Deuxième encre",
    exportPng: "Exporter PNG",
    exportSvg: "Exporter SVG",
    exportJson: "Exporter JSON",
    importJson: "Importer JSON",
    reset: "Réinitialiser",
    footer: "Logiciel libre sous licence MIT.",
    source: "Code source",
    exported: "Fichier exporté : ",
    rendering: "Rendu en cours…",
    imported: "Réglages importés.",
    importError: "Fichier JSON illisible.",
    loaded: "Image chargée.",
    loadError: "Impossible de lire cette image.",
    p_affiche: "Affiche vintage",
    p_journal: "Journal",
    p_serigraphie: "Sérigraphie",
    p_comics: "Comics",
    p_packaging: "Packaging",
    p_nb: "Noir & blanc",
    p_cyanotype: "Cyanotype",
    p_neon: "Néon",
    p_poster: "Poster pop",
    p_offset: "Offset classique"
  },
  en: {
    title: "Tramage Atelier — halftone / tramage generator",
    tagline: "Classic print halftone, 100% in your browser",
    language: "Language",
    canvasLabel: "Halftone preview",
    loadImage: "Load an image",
    sample: "Sample image",
    dropHint: "Drop an image here (PNG, JPEG, WebP)",
    privacy: "Nothing is uploaded: everything runs on your device.",
    presets: "Presets",
    settings: "Settings",
    pattern: "Pattern",
    pat_dots: "Dots (round)",
    pat_squares: "Squares",
    pat_lines: "Lines (angled)",
    pat_lines_h: "Horizontal lines",
    pat_diamonds: "Diamonds",
    cellSize: "Cell size (LPI feel)",
    angle: "Screen angle",
    contrast: "Contrast",
    bias: "Threshold bias",
    invert: "Invert (negative)",
    ink: "Ink colour",
    paper: "Paper colour",
    duotone: "Duotone (2nd ink)",
    ink2: "Second ink",
    exportPng: "Export PNG",
    exportSvg: "Export SVG",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    reset: "Reset",
    footer: "Free software under the MIT licence.",
    source: "Source code",
    exported: "Exported: ",
    rendering: "Rendering…",
    imported: "Settings imported.",
    importError: "Unreadable JSON file.",
    loaded: "Image loaded.",
    loadError: "Could not read this image.",
    p_affiche: "Vintage poster",
    p_journal: "Newspaper",
    p_serigraphie: "Screen print",
    p_comics: "Comics",
    p_packaging: "Packaging",
    p_nb: "Black & white",
    p_cyanotype: "Cyanotype",
    p_neon: "Neon",
    p_poster: "Pop poster",
    p_offset: "Classic offset"
  },
  kab: {
    title: "Tramage Atelier — amsuddes n utramage / halftone",
    tagline: "Atramage n usiggez aqbur, deg yiminig kan",
    language: "Tutlayt",
    canvasLabel: "Taskant n utramage",
    loadImage: "Sali-d tugna",
    sample: "Tugna n ukayad",
    dropHint: "Zuɣer tugna ɣer da (PNG, JPEG, WebP)",
    privacy: "Ulac ayen yettwaznen : kullec yettwaxdam deg yibenk-ik.",
    presets: "Iɣewwaren",
    settings: "Iɣewwaren",
    pattern: "Talɣa",
    pat_dots: "Tiqiḍin (timdewerrin)",
    pat_squares: "Imkuẓen",
    pat_lines: "Izirigen (tiɣmert)",
    pat_lines_h: "Izirigen s teḥri",
    pat_diamonds: "Ilemẓiyen",
    cellSize: "Tiddi n texxamt (LPI)",
    angle: "Tiɣmert n utrama",
    contrast: "Amgarad",
    bias: "Anedya n umeẓlu",
    invert: "Tti (aneggaru)",
    ink: "Ini n tira",
    paper: "Ini n lkaɣeḍ",
    duotone: "Sin n yiniten",
    ink2: "Tira tis snat",
    exportPng: "Sifeḍ PNG",
    exportSvg: "Sifeḍ SVG",
    exportJson: "Sifeḍ JSON",
    importJson: "Kter JSON",
    reset: "Ales awennez",
    footer: "Aseɣẓan ilelli s turagt MIT.",
    source: "Tangalt taɣbalut",
    exported: "Afaylu yettwasifeḍ : ",
    rendering: "Asmel iteddu…",
    imported: "Iɣewwaren ttwaketren.",
    importError: "Afaylu JSON ur yettwaɣara ara.",
    loaded: "Tugna tettwali.",
    loadError: "Ur yezmir ara ad iɣer tugna-a.",
    p_affiche: "Affiche taqburt",
    p_journal: "Aɣmis",
    p_serigraphie: "Asiggez s uẓeṭṭa",
    p_comics: "Comics",
    p_packaging: "Akemmus",
    p_nb: "Aberkan & amellal",
    p_cyanotype: "Cyanotype",
    p_neon: "Niyun",
    p_poster: "Poster pop",
    p_offset: "Offset aqbur"
  }
};

window.applyI18n = function (lang) {
  var dict = window.I18N[lang] || window.I18N.fr;
  document.documentElement.lang = lang === 'kab' ? 'kab' : lang;
  if (dict.title) document.title = dict.title;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-aria');
    if (dict[key] != null) el.setAttribute('aria-label', dict[key]);
  });
  document.querySelectorAll('[data-i18n-option]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-option');
    if (dict[key] != null) el.textContent = dict[key];
  });
  return dict;
};

window.t = function (key, lang) {
  var dict = window.I18N[lang || document.documentElement.lang] || window.I18N.fr;
  return dict[key] != null ? dict[key] : (window.I18N.fr[key] || key);
};
