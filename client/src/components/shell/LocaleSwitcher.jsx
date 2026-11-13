import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES } from '../../i18n';

/** Language name in its own language via Intl, e.g. "Hrvatski", "Deutsch". */
function autonym(code) {
  const name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code;
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
}

/**
 * EN | HR | DE buttons. Changing language updates <html lang> and saves the
 * choice (see i18n.js). Each button has lang="xx" and aria-pressed.
 */
export default function LocaleSwitcher() {
  const { t, i18n } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const labelId = useId();

  async function choose(code) {
    await i18n.changeLanguage(code);
    setAnnouncement(t('locale.changed', { language: autonym(code) }));
  }

  return (
    <div>
      <span id={labelId} className="sr-only">{t('locale.switcherLabel')}</span>
      <div role="group" aria-labelledby={labelId} className="locale-switcher">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            lang={code}
            aria-label={autonym(code)}
            aria-pressed={i18n.resolvedLanguage === code}
            onClick={() => choose(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
    </div>
  );
}
