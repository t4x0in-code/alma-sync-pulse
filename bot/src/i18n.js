// Bot i18n — 8 languages, keyed by msg.from.language_code (BCP-47 prefix)
// All string values may contain {placeholder} tokens, interpolated by t().
//
// STRUCTURE:
// - DEFAULTS: all 35 keys in English (single source of truth)
// - Each locale: only OVERRIDES keys that differ from English
// - buildDict(): merges defaults with locale overrides at runtime

// ============================================================================
// DEFAULT (English) — single source of truth for all shared keys
// ============================================================================
const DEFAULTS = {
  start:
    "🌹 *AlmaLatina Bot*\nYour chat ID: `{chatId}`\n\n*Commands:*\n/status — class overview\n/list — who's coming\n/add — enroll yourself\n/lang — change language",
  no_access: "🚫 Access denied.",
  no_courses: "No courses.",
  status_line:
    "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 pairs: {confirmed} ✓ / {proposed} ?\n🔒 reserved: {reserved}",
  no_enrollments: "No enrollments yet.",
  select_class: "Select a class:",
  course_not_found: "❌ Course not found.",
  course_not_found_id: "❌ Course {id} not found.",
  enrollment_not_found: "❌ Enrollments not found.",
  different_courses: "❌ Different courses.",
  need_l_f: "❌ Need 1×L and 1×F.",
  added: "✅ #{id} added.",
  deleted: "🗑 #{id} deleted.",
  not_found: "❌ Not found.",
  pair_proposed: "💞 pair #{id}: {leader} ↔ {follower} (proposed)",
  pair_confirmed: "✓ pair {id} confirmed.",
  pair_not_found: "❌ Pair not found.",
  pair_deleted: "🗑 pair {id} deleted.",
  no_reserved: "No reserved pairs.",
  reserved_added: "🔒 reserved #{id}: {l}–{f}",
  reserved_deleted: "🗑 reserved {id} deleted.",
  course_closed: "🔒 {title} closed.",
  course_opened: "🔓 {title} opened.",
  spot_added: "➕ {title}: {n} spots.",
  capacity_set: "📏 {title}: max {n}",
  auth_expired_cb: "Request expired.",
  auth_expired_msg: "⏱ Expired.",
  auth_confirmed_cb: "✅ Login confirmed!",
  auth_confirmed_msg: "✅ Login confirmed.",
  auth_denied_cb: "❌ Denied.",
  auth_denied_msg: "❌ Login denied.",
  auth_request:
    "🔐 *Admin login requested*\nPIN: `{pin}`\n\nConfirm only if you are the one logging in.",
  auth_confirm_btn: "✅ Confirm",
  auth_deny_btn: "❌ Deny",
  db_error: "❌ Operation failed.",
  notify_enroll: "🌹 *New enrollment* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
  choose_lang: "🌍 Choose your language:",
  lang_changed: "✓ Language updated!",
  lang_selected: "✓ Language set to {lang}",

  // Sequential /add wizard prompts
  add_wizard_select_class: "📋 Select a class:",
  add_wizard_gender: "🧑 Select gender/role:",
  add_wizard_name: "📝 Enter name:",
  add_wizard_age: "🎂 Enter age (optional):",
  add_wizard_photo: "📷 Send photo (optional):",
  add_wizard_confirm: "✅ Confirm enrollment?\n\n👤 {name}\n🧑 {gender}\n🎂 {age}\n📷 {photo}\n\nClass: {class}",
  add_wizard_success: "✅ Enrolled! ID: #{id}",
  add_wizard_cancel: "❌ Enrollment cancelled.",
  add_wizard_skip_photo: "⏭️ Skip photo",
  add_wizard_avatar: "🎭 Pick your avatar:",
  add_wizard_yes: "✅ Confirm",
  add_wizard_no: "❌ Cancel",
  add_wizard_skip: "⏭️ Skip",
  wizard_expired: "⚠️ Session expired. Use /addwizard to start over.",

  // Gender buttons for wizard
  gender_btn_L: "🕺 Leader",
  gender_btn_F: "💃 Follower",

  // Language keyboard buttons
  lang_btn_en: "🇬🇧 English",
  lang_btn_de: "🇩🇪 Deutsch",
  lang_btn_ru: "🇷🇺 Русский",
  lang_btn_uk: "🇺🇦 Українська",
  lang_btn_fr: "🇫🇷 Français",
  lang_btn_tr: "🇹🇷 Türkçe",
  lang_btn_it: "🇮🇹 Italiano",
  lang_btn_es: "🇪🇸 Español",

  // Language names for confirmation
  lang_name_en: "English",
  lang_name_de: "Deutsch",
  lang_name_ru: "Русский",
  lang_name_uk: "Українська",
  lang_name_fr: "Français",
  lang_name_tr: "Türkçe",
  lang_name_it: "Italiano",
  lang_name_es: "Español",

  // Role icons
  role_L: "🕺 Leader",
  role_F: "💃 Follower",
  icon_L: "🕺",
  icon_F: "💃",
  icon_pair: "💞",
  icon_lock: "🔒",
};

// ============================================================================
// LOCALE OVERRIDES — only keys that differ from English
// ============================================================================
const OVERRIDES = {
  de: {
    start:
      "🌹 *AlmaLatina Bot*\nDeine Chat-ID: `{chatId}`\n\n*Befehle:*\n/status — Kursübersicht\n/list — wer kommt\n/add — selbst anmelden\n/lang — Sprache ändern",
    no_access: "🚫 Kein Zugriff.",
    no_courses: "Keine Kurse.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 Paare: {confirmed} ✓ / {proposed} ?\n🔒 reserviert: {reserved}",
    no_enrollments: "Noch keine Anmeldungen.",
    select_class: "Kurs wählen:",
    course_not_found: "❌ Kurs nicht gefunden.",
    course_not_found_id: "❌ Kurs {id} nicht gefunden.",
    enrollment_not_found: "❌ Anmeldungen nicht gefunden.",
    different_courses: "❌ Verschiedene Kurse.",
    need_l_f: "❌ Es werden 1×L und 1×F benötigt.",
    added: "✅ #{id} hinzugefügt.",
    deleted: "🗑 #{id} entfernt.",
    not_found: "❌ Nicht gefunden.",
    pair_proposed: "💞 Paar #{id}: {leader} ↔ {follower} (vorgeschlagen)",
    pair_confirmed: "✓ Paar {id} bestätigt.",
    pair_not_found: "❌ Paar nicht gefunden.",
    pair_deleted: "🗑 Paar {id} entfernt.",
    no_reserved: "Keine reservierten Paare.",
    reserved_added: "🔒 reserviert #{id}: {l}–{f}",
    reserved_deleted: "🗑 reserviert {id} entfernt.",
    course_closed: "🔒 {title} geschlossen.",
    course_opened: "🔓 {title} geöffnet.",
    spot_added: "➕ {title}: {n} Plätze.",
    capacity_set: "📏 {title}: max {n}",
    auth_expired_cb: "Anfrage abgelaufen.",
    auth_expired_msg: "⏱ Abgelaufen.",
    auth_confirmed_cb: "✅ Login bestätigt!",
    auth_confirmed_msg: "✅ Login bestätigt.",
    auth_denied_cb: "❌ Abgelehnt.",
    auth_denied_msg: "❌ Login abgelehnt.",
    auth_request:
      "🔐 *Admin-Login angefragt*\nPIN: `{pin}`\n\nBestätige nur, wenn du selbst gerade einloggst.",
    auth_confirm_btn: "✅ Bestätigen",
    auth_deny_btn: "❌ Ablehnen",
    db_error: "❌ Vorgang fehlgeschlagen.",
    notify_enroll: "🌹 *Neue Anmeldung* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Wähle deine Sprache:",
    lang_changed: "✓ Sprache aktualisiert!",
    lang_selected: "✓ Sprache eingestellt auf {lang}",
  },

  ru: {
    start:
      "🌹 *AlmaLatina Bot*\nВаш Chat-ID: `{chatId}`\n\n*Команды:*\n/status — обзор курсов\n/list — кто придёт\n/add — записаться\n/lang — изменить язык",
    no_access: "🚫 Нет доступа.",
    no_courses: "Курсы не найдены.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 Ж: {f}  🕺 М: {l}\n💞 пары: {confirmed} ✓ / {proposed} ?\n🔒 зарезервировано: {reserved}",
    no_enrollments: "Заявок пока нет.",
    select_class: "Выберите курс:",
    course_not_found: "❌ Курс не найден.",
    course_not_found_id: "❌ Курс {id} не найден.",
    enrollment_not_found: "❌ Заявки не найдены.",
    different_courses: "❌ Разные курсы.",
    need_l_f: "❌ Нужны 1×L и 1×F.",
    added: "✅ #{id} добавлен.",
    deleted: "🗑 #{id} удалён.",
    not_found: "❌ Не найдено.",
    pair_proposed: "💞 пара #{id}: {leader} ↔ {follower} (предложено)",
    pair_confirmed: "✓ пара {id} подтверждена.",
    pair_not_found: "❌ Пара не найдена.",
    pair_deleted: "🗑 пара {id} удалена.",
    no_reserved: "Нет зарезервированных пар.",
    reserved_added: "🔒 зарезервировано #{id}: {l}–{f}",
    reserved_deleted: "🔒 зарезервировано {id} удалено.",
    course_closed: "🔒 {title} закрыт.",
    course_opened: "🔓 {title} открыт.",
    spot_added: "➕ {title}: {n} мест.",
    capacity_set: "📏 {title}: макс {n}",
    auth_expired_cb: "Запрос истёк.",
    auth_expired_msg: "⏱ Истёк.",
    auth_confirmed_cb: "✅ Вход подтверждён!",
    auth_confirmed_msg: "✅ Вход подтверждён.",
    auth_denied_cb: "❌ Отклонено.",
    auth_denied_msg: "❌ Вход отклонён.",
    auth_request:
      "🔐 *Запрос на вход в админку*\nPIN: `{pin}`\n\nПодтвердите только если вы сами сейчас входите.",
    auth_confirm_btn: "✅ Подтвердить",
    auth_deny_btn: "❌ Отклонить",
    db_error: "❌ Операция не выполнена.",
    notify_enroll: "🌹 *Новая заявка* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Выберите язык:",
    lang_changed: "✓ Язык обновлён!",
    lang_selected: "✓ Язык изменён на {lang}",
  },

  uk: {
    start:
      "🌹 *AlmaLatina Bot*\nВаш Chat-ID: `{chatId}`\n\n*Команди:*\n/status — огляд курсів\n/list — хто прийде\n/add — записатися\n/lang — змінити мову",
    no_access: "🚫 Немає доступу.",
    no_courses: "Курси не знайдено.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 Ж: {f}  🕺 Ч: {l}\n💞 пари: {confirmed} ✓ / {proposed} ?\n🔒 зарезервовано: {reserved}",
    no_enrollments: "Заявок поки немає.",
    select_class: "Оберіть курс:",
    course_not_found: "❌ Курс не знайдено.",
    course_not_found_id: "❌ Курс {id} не знайдено.",
    enrollment_not_found: "❌ Заявки не знайдено.",
    different_courses: "❌ Різні курси.",
    need_l_f: "❌ Потрібні 1×L та 1×F.",
    added: "✅ #{id} додано.",
    deleted: "🗑 #{id} видалено.",
    not_found: "❌ Не знайдено.",
    pair_proposed: "💞 пара #{id}: {leader} ↔ {follower} (запропоновано)",
    pair_confirmed: "✓ пара {id} підтверджена.",
    pair_not_found: "❌ Пару не знайдено.",
    pair_deleted: "🗑 пара {id} видалена.",
    no_reserved: "Немає зарезервованих пар.",
    reserved_added: "🔒 зарезервовано #{id}: {l}–{f}",
    reserved_deleted: "🔒 зарезервовано {id} видалено.",
    course_closed: "🔒 {title} закрито.",
    course_opened: "🔓 {title} відкрито.",
    spot_added: "➕ {title}: {n} місць.",
    capacity_set: "📏 {title}: макс {n}",
    auth_expired_cb: "Запит застарів.",
    auth_expired_msg: "⏱ Застарів.",
    auth_confirmed_cb: "✅ Вхід підтверджено!",
    auth_confirmed_msg: "✅ Вхід підтверджено.",
    auth_denied_cb: "❌ Відхилено.",
    auth_denied_msg: "❌ Вхід відхилено.",
    auth_request:
      "🔐 *Запит на вхід в адмінку*\nPIN: `{pin}`\n\nПідтвердіть тільки якщо ви самі зараз входите.",
    auth_confirm_btn: "✅ Підтвердити",
    auth_deny_btn: "❌ Відхилити",
    db_error: "❌ Операцію не виконано.",
    notify_enroll: "🌹 *Нова заявка* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Оберіть мову:",
    lang_changed: "✓ Мова оновлена!",
    lang_selected: "✓ Мову встановлено на {lang}",
  },

  fr: {
    start:
      "🌹 *AlmaLatina Bot*\nVotre Chat-ID: `{chatId}`\n\n*Commandes:*\n/status — vue d'ensemble\n/list — qui vient\n/add — s'inscrire\n/lang — changer de langue",
    no_access: "🚫 Accès refusé.",
    no_courses: "Aucun cours.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 paires: {confirmed} ✓ / {proposed} ?\n🔒 réservé: {reserved}",
    no_enrollments: "Aucune inscription pour l'instant.",
    select_class: "Sélectionnez un cours:",
    course_not_found: "❌ Cours introuvable.",
    course_not_found_id: "❌ Cours {id} introuvable.",
    enrollment_not_found: "❌ Inscriptions introuvables.",
    different_courses: "❌ Cours différents.",
    need_l_f: "❌ Il faut 1×L et 1×F.",
    added: "✅ #{id} ajouté.",
    deleted: "🗑 #{id} supprimé.",
    not_found: "❌ Introuvable.",
    pair_proposed: "💞 paire #{id}: {leader} ↔ {follower} (proposée)",
    pair_confirmed: "✓ paire {id} confirmée.",
    pair_not_found: "❌ Paire introuvable.",
    pair_deleted: "🗑 paire {id} supprimée.",
    no_reserved: "Aucune paire réservée.",
    reserved_added: "🔒 réservé #{id}: {l}–{f}",
    reserved_deleted: "🔒 réservé {id} supprimé.",
    course_closed: "🔒 {title} fermé.",
    course_opened: "🔓 {title} ouvert.",
    spot_added: "➕ {title}: {n} places.",
    capacity_set: "📏 {title}: max {n}",
    auth_expired_cb: "Demande expirée.",
    auth_expired_msg: "⏱ Expirée.",
    auth_confirmed_cb: "✅ Connexion confirmée!",
    auth_confirmed_msg: "✅ Connexion confirmée.",
    auth_denied_cb: "❌ Refusée.",
    auth_denied_msg: "❌ Connexion refusée.",
    auth_request:
      "🔐 *Connexion admin demandée*\nPIN: `{pin}`\n\nConfirmez uniquement si c'est vous qui vous connectez.",
    auth_confirm_btn: "✅ Confirmer",
    auth_deny_btn: "❌ Refuser",
    db_error: "❌ Opération échouée.",
    notify_enroll:
      "🌹 *Nouvelle inscription* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Choisissez votre langue:",
    lang_changed: "✓ Langue mise à jour !",
    lang_selected: "✓ Langue définie sur {lang}",
  },

  tr: {
    start:
      "🌹 *AlmaLatina Bot*\nChat-ID'niz: `{chatId}`\n\n*Komutlar:*\n/status — genel bakış\n/list — kim geliyor\n/add — kayıt ol\n/lang — dili değiştir",
    no_access: "🚫 Erişim reddedildi.",
    no_courses: "Kurs bulunamadı.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 çiftler: {confirmed} ✓ / {proposed} ?\n🔒 rezerve: {reserved}",
    no_enrollments: "Henüz kayıt yok.",
    select_class: "Bir kurs seçin:",
    course_not_found: "❌ Kurs bulunamadı.",
    course_not_found_id: "❌ {id} kursu bulunamadı.",
    enrollment_not_found: "❌ Kayıtlar bulunamadı.",
    different_courses: "❌ Farklı kurslar.",
    need_l_f: "❌ 1×L ve 1×F gerekli.",
    added: "✅ #{id} eklendi.",
    deleted: "🗑 #{id} silindi.",
    not_found: "❌ Bulunamadı.",
    pair_proposed: "💞 çift #{id}: {leader} ↔ {follower} (önerildi)",
    pair_confirmed: "✓ çift {id} onaylandı.",
    pair_not_found: "❌ Çift bulunamadı.",
    pair_deleted: "🗑 çift {id} silindi.",
    no_reserved: "Rezerve çift yok.",
    reserved_added: "🔒 rezerve #{id}: {l}–{f}",
    reserved_deleted: "🔒 rezerve {id} silindi.",
    course_closed: "🔒 {title} kapatıldı.",
    course_opened: "🔓 {title} açıldı.",
    spot_added: "➕ {title}: {n} yer.",
    capacity_set: "📏 {title}: maks {n}",
    auth_expired_cb: "İstek süresi doldu.",
    auth_expired_msg: "⏱ Süresi doldu.",
    auth_confirmed_cb: "✅ Giriş onaylandı!",
    auth_confirmed_msg: "✅ Giriş onaylandı.",
    auth_denied_cb: "❌ Reddedildi.",
    auth_denied_msg: "❌ Giriş reddedildi.",
    auth_request:
      "🔐 *Admin girişi talep edildi*\nPIN: `{pin}`\n\nYalnızca kendiniz giriş yapıyorsanız onaylayın.",
    auth_confirm_btn: "✅ Onayla",
    auth_deny_btn: "❌ Reddet",
    db_error: "❌ İşlem başarısız.",
    notify_enroll: "🌹 *Yeni kayıt* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Dilinizi seçin:",
    lang_changed: "✓ Dil güncellendi!",
    lang_selected: "✓ Dil {lang} olarak ayarlandı",
  },

  it: {
    start:
      "🌹 *AlmaLatina Bot*\nIl tuo Chat-ID: `{chatId}`\n\n*Comandi:*\n/status — panoramica\n/list — chi viene\n/add — iscriviti\n/lang — cambia lingua",
    no_access: "🚫 Accesso negato.",
    no_courses: "Nessun corso.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 coppie: {confirmed} ✓ / {proposed} ?\n🔒 riservato: {reserved}",
    no_enrollments: "Nessuna iscrizione ancora.",
    select_class: "Seleziona un corso:",
    course_not_found: "❌ Corso non trovato.",
    course_not_found_id: "❌ Corso {id} non trovato.",
    enrollment_not_found: "❌ Iscrizioni non trovate.",
    different_courses: "❌ Corsi diversi.",
    need_l_f: "❌ Servono 1×L e 1×F.",
    added: "✅ #{id} aggiunto.",
    deleted: "🗑 #{id} rimosso.",
    not_found: "❌ Non trovato.",
    pair_proposed: "💞 coppia #{id}: {leader} ↔ {follower} (proposta)",
    pair_confirmed: "✓ coppia {id} confermata.",
    pair_not_found: "❌ Coppia non trovata.",
    pair_deleted: "🗑 coppia {id} rimossa.",
    no_reserved: "Nessuna coppia riservata.",
    reserved_added: "🔒 riservato #{id}: {l}–{f}",
    reserved_deleted: "🔒 riservato {id} rimosso.",
    course_closed: "🔒 {title} chiuso.",
    course_opened: "🔓 {title} aperto.",
    spot_added: "➕ {title}: {n} posti.",
    capacity_set: "📏 {title}: max {n}",
    auth_expired_cb: "Richiesta scaduta.",
    auth_expired_msg: "⏱ Scaduta.",
    auth_confirmed_cb: "✅ Accesso confermato!",
    auth_confirmed_msg: "✅ Accesso confermato.",
    auth_denied_cb: "❌ Rifiutato.",
    auth_denied_msg: "❌ Accesso rifiutato.",
    auth_request:
      "🔐 *Accesso admin richiesto*\nPIN: `{pin}`\n\nConferma solo se sei tu ad effettuare l'accesso.",
    auth_confirm_btn: "✅ Conferma",
    auth_deny_btn: "❌ Nega",
    db_error: "❌ Operazione fallita.",
    notify_enroll: "🌹 *Nuova iscrizione* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Scegli la tua lingua:",
    lang_changed: "✓ Lingua aggiornata!",
    lang_selected: "✓ Lingua impostata su {lang}",
  },

  es: {
    start:
      "🌹 *AlmaLatina Bot*\nTu Chat-ID: `{chatId}`\n\n*Comandos:*\n/status — resumen\n/list — quién viene\n/add — inscribirse\n/lang — cambiar idioma",
    no_access: "🚫 Acceso denegado.",
    no_courses: "No hay cursos.",
    status_line:
      "*{title}* `{id}`\n{schedule}\n👥 {enrolled}/{cap} · {status}\n💃 F: {f}  🕺 L: {l}\n💞 parejas: {confirmed} ✓ / {proposed} ?\n🔒 reservado: {reserved}",
    no_enrollments: "Aún no hay inscripciones.",
    select_class: "Seleccione un curso:",
    course_not_found: "❌ Curso no encontrado.",
    course_not_found_id: "❌ Curso {id} no encontrado.",
    enrollment_not_found: "❌ Inscripciones no encontradas.",
    different_courses: "❌ Cursos diferentes.",
    need_l_f: "❌ Se necesitan 1×L y 1×F.",
    added: "✅ #{id} añadido.",
    deleted: "🗑 #{id} eliminado.",
    not_found: "❌ No encontrado.",
    pair_proposed: "💞 pareja #{id}: {leader} ↔ {follower} (propuesta)",
    pair_confirmed: "✓ pareja {id} confirmada.",
    pair_not_found: "❌ Pareja no encontrada.",
    pair_deleted: "🗑 pareja {id} eliminada.",
    no_reserved: "No hay parejas reservadas.",
    reserved_added: "🔒 reservado #{id}: {l}–{f}",
    reserved_deleted: "🔒 reservado {id} eliminado.",
    course_closed: "🔒 {title} cerrado.",
    course_opened: "🔓 {title} abierto.",
    spot_added: "➕ {title}: {n} plazas.",
    capacity_set: "📏 {title}: máx {n}",
    auth_expired_cb: "Solicitud expirada.",
    auth_expired_msg: "⏱ Expirada.",
    auth_confirmed_cb: "✅ ¡Inicio de sesión confirmado!",
    auth_confirmed_msg: "✅ Inicio de sesión confirmado.",
    auth_denied_cb: "❌ Rechazado.",
    auth_denied_msg: "❌ Inicio de sesión rechazado.",
    auth_request:
      "🔐 *Solicitud de acceso admin*\nPIN: `{pin}`\n\nConfirma solo si eres tú quien está iniciando sesión.",
    auth_confirm_btn: "✅ Confirmar",
    auth_deny_btn: "❌ Denegar",
    db_error: "❌ Operación fallida.",
    notify_enroll: "🌹 *Nueva inscripción* ({role})\n*{name}*{age}{comment}\n→ *{title}*\nID #{id}",
    choose_lang: "🌍 Elige tu idioma:",
    lang_changed: "✓ Idioma actualizado!",
    lang_selected: "✓ Idioma establecido a {lang}",
  },
};

// Build dictionary: merge defaults with locale overrides
function buildDict(overrides) {
  return { ...DEFAULTS, ...overrides };
}

// Create all dictionaries (pre-built for performance)
const T = {
  en: DEFAULTS,
  de: buildDict(OVERRIDES.de),
  ru: buildDict(OVERRIDES.ru),
  uk: buildDict(OVERRIDES.uk),
  fr: buildDict(OVERRIDES.fr),
  tr: buildDict(OVERRIDES.tr),
  it: buildDict(OVERRIDES.it),
  es: buildDict(OVERRIDES.es),
};

/**
 * Admin language storage (imported from server.js)
 * This will be set by the bot when user selects language
 */
let adminLangs = null;

/**
 * Set the adminLangs Map from server.js
 * Must be called before t() can use stored preferences
 */
export function initI18n(langMap) {
  adminLangs = langMap;
}

/**
 * Get effective language: stored preference overrides auto-detect
 */
function getEffectiveLang(msgOrQuery) {
  if (!msgOrQuery || !adminLangs) {
    return msgOrQuery?.from?.language_code?.slice(0, 2) || "en";
  }

  // For callback_query, use message.chat.id
  const chatId = msgOrQuery.message?.chat?.id || msgOrQuery.chat?.id;
  if (chatId) {
    const stored = adminLangs.get(String(chatId));
    if (stored) return stored;
  }

  // Fallback to Telegram auto-detect
  return msgOrQuery.from?.language_code?.slice(0, 2) || "en";
}

/**
 * Translate a key for the given message/query context.
 * Uses stored admin preference if available.
 * @param {Object} msgOrQuery  Telegram message or callback_query
 * @param {string} key            Translation key
 * @param {Record<string,unknown>} vars      {placeholder: value} substitutions
 */
export function t(msgOrQuery, key, vars = {}) {
  const effectiveLang = getEffectiveLang(msgOrQuery);
  const dict = T[effectiveLang] ?? T.en;
  let str = dict[key] ?? T.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v ?? ""));
  return str;
}

/** Extract a 2-letter language code from a Telegram User object. */
export const lang = (from) => (from?.language_code ?? "en").slice(0, 2);
