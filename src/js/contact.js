// Contact form (/contact/): ?type= preset, fields per type, validation, input → confirm → complete.
// Portfolio demo: there is no backend, so "send" only shows the complete step. Nothing is sent or stored.

const TYPES = {
  consultation: '家づくりの相談',
  document: '資料請求',
  visit: '見学予約',
};

const MESSAGE_HINTS = {
  '': 'ご予算や時期、気になっていることなど、自由にお書きください（1,000文字以内）。',
  consultation: 'ご予算や時期、気になっていることなど、自由にお書きください（1,000文字以内）。',
  document: 'ご質問などがあればお書きください（1,000文字以内）。',
  visit: 'ご参加の人数や、特に見てみたい場所などがあればお書きください（1,000文字以内）。',
};

const TEL_HINTS = {
  optional: 'ご連絡はメールでいたします。お電話をご希望の場合のみご入力ください。',
  visit: '見学当日の連絡用に、つながりやすい番号をご入力ください。',
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const CLOSED_DAY = 3; // Wednesday

// full-width digits / hyphens → half-width
const toHalfWidth = (value) =>
  value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[－ー―‐−]/g, '-');

const toKatakana = (value) => value.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDate = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const formatDate = (value) => {
  const date = parseDate(value);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）`;
};

export function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const steps = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-contact-step]')).map((el) => [el.dataset.contactStep, el]),
  );
  const stepItems = document.querySelectorAll('[data-contact-steps] li');
  const summary = document.querySelector('[data-error-summary]');
  const summaryList = summary.querySelector('[data-error-list]');
  const summaryCount = summary.querySelector('[data-error-count]');
  const confirmList = document.querySelector('[data-confirm-list]');
  const rows = Array.from(form.querySelectorAll('[data-field]'));
  const tel = form.elements.tel;
  const visitDate = form.elements.visitDate;
  const baseTitle = document.title;

  // ---- Type: show the fields each type needs, disable the rest so they are neither validated nor confirmed ----
  const applyType = (type) => {
    form.querySelectorAll('[data-show-for]').forEach((row) => {
      const shown = row.dataset.showFor.split(' ').includes(type);
      row.hidden = !shown;
      row.querySelectorAll('input, select, textarea').forEach((control) => {
        control.disabled = !shown;
      });
      if (!shown) clearError(row);
    });
    form.querySelectorAll('[data-type-guide]').forEach((guide) => {
      guide.hidden = guide.dataset.typeGuide !== type;
    });

    // phone: required for visits (contact on the day), optional otherwise
    const telRequired = type === 'visit';
    tel.required = telRequired;
    const badge = form.querySelector('[data-tel-badge]');
    badge.textContent = telRequired ? '必須' : '任意';
    badge.classList.toggle('form-badge--required', telRequired);
    badge.classList.toggle('form-badge--optional', !telRequired);
    form.querySelector('[data-tel-hint]').textContent = telRequired ? TEL_HINTS.visit : TEL_HINTS.optional;
    if (!telRequired && !tel.value) clearError(rowOf(tel));

    form.querySelector('[data-message-hint]').textContent = MESSAGE_HINTS[type] ?? MESSAGE_HINTS[''];
  };

  // initial type from the CTA link (?type=consultation|document|visit); anything else is ignored
  const params = new URLSearchParams(window.location.search);
  const initialType = params.get('type');
  if (initialType && Object.hasOwn(TYPES, initialType)) {
    form.querySelector(`input[name="type"][value="${initialType}"]`).checked = true;
  } else if (params.has('type')) {
    const url = new URL(window.location.href);
    url.searchParams.delete('type');
    window.history.replaceState(window.history.state, '', url);
  }
  applyType(form.elements.type.value);

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'type') return;
    applyType(event.target.value);
    const url = new URL(window.location.href);
    url.searchParams.set('type', event.target.value);
    window.history.replaceState(window.history.state, '', url);
  });

  // visit: from tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  visitDate.min = isoDate(tomorrow);

  // ---- Validation ----
  function rowOf(control) {
    return control.closest('[data-field]');
  }

  const labelOf = (row) =>
    row.dataset.field === 'privacy' ? '個人情報の取り扱い' : row.querySelector('.form-row__label-text').textContent.trim();

  const controlsOf = (row) => Array.from(row.querySelectorAll('input, select, textarea')).filter((c) => !c.disabled);

  // normalize what people commonly type before checking it
  const normalize = (row) => {
    const { field } = row.dataset;
    const input = row.querySelector('input');
    if (field === 'kana') input.value = toKatakana(input.value).replace(/\s+/g, ' ').trim();
    if (field === 'tel' || field === 'postal') input.value = toHalfWidth(input.value).trim();
    if (field === 'email') input.value = input.value.trim();
  };

  const messageFor = (row) => {
    const { field } = row.dataset;
    const controls = controlsOf(row);
    if (controls.length === 0) return '';
    const label = labelOf(row);
    const control = controls[0];

    if (field === 'type') return form.elements.type.value ? '' : 'お問い合わせ種別を選択してください。';
    if (field === 'privacy') return control.checked ? '' : '個人情報の取り扱いへの同意が必要です。';

    const value = control.value.trim();
    if (!value) {
      if (!control.required) return '';
      if (field === 'visitDate') return '見学のご希望日を選択してください。';
      return `${label}を入力してください。`;
    }
    switch (field) {
      case 'kana':
        return /^[ァ-ヶー・ 　]+$/.test(value) ? '' : 'フリガナは全角カタカナで入力してください。';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test(value)
          ? ''
          : 'メールアドレスの形式が正しくありません。「hanako@example.com」のように入力してください。';
      case 'tel': {
        const digits = value.replace(/-/g, '');
        return /^[\d-]+$/.test(value) && /^0\d{9,10}$/.test(digits)
          ? ''
          : '電話番号は半角数字で、0から始まる10〜11桁を入力してください（ハイフンは任意です）。';
      }
      case 'postal':
        return /^\d{3}-?\d{4}$/.test(value) ? '' : '郵便番号は「390-0000」のように7桁の数字で入力してください。';
      case 'visitDate': {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '見学のご希望日を選択してください。';
        if (value < visitDate.min) return '見学のご希望日は、明日以降の日付を選択してください。';
        if (parseDate(value).getDay() === CLOSED_DAY) return '水曜日は定休日です。ほかの日付を選択してください。';
        return '';
      }
      default:
        return '';
    }
  };

  function clearError(row) {
    row.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
    const error = row.querySelector('.form-error');
    if (error) {
      error.hidden = true;
      error.textContent = '';
    }
  }

  const showError = (row, message) => {
    if (!message) {
      clearError(row);
      return;
    }
    // radios: mark the group; the date row marks only the date input (time is optional)
    const targets = row.dataset.field === 'visitDate' ? [visitDate] : controlsOf(row);
    targets.forEach((c) => c.setAttribute('aria-invalid', 'true'));
    const error = row.querySelector('.form-error');
    error.textContent = message;
    error.hidden = false;
  };

  const validateRow = (row) => {
    if (row.hidden) return '';
    normalize(row);
    const message = messageFor(row);
    showError(row, message);
    return message;
  };

  // check a field when leaving it (once something was typed), re-check while it is shown as an error
  const touched = new Set();
  form.addEventListener('input', (event) => {
    const row = rowOf(event.target);
    if (!row) return;
    touched.add(row);
    if (row.querySelector('[aria-invalid]')) showError(row, messageFor(row));
  });
  form.addEventListener('focusout', (event) => {
    const row = rowOf(event.target);
    if (row && touched.has(row) && !row.contains(event.relatedTarget)) validateRow(row);
  });
  form.addEventListener('change', (event) => {
    const row = rowOf(event.target);
    if (!row) return;
    if (event.target.type === 'radio' || event.target.type === 'checkbox' || event.target.type === 'date') {
      if (row.querySelector('[aria-invalid]') || event.target.type === 'date') validateRow(row);
    }
  });

  const showSummary = (errors) => {
    summaryList.replaceChildren(
      ...errors.map(({ row, message }) => {
        const target = row.dataset.field === 'visitDate' ? visitDate : controlsOf(row)[0];
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${target.id}`;
        a.textContent = message;
        a.addEventListener('click', (event) => {
          event.preventDefault();
          target.focus();
        });
        li.append(a);
        return li;
      }),
    );
    summaryCount.textContent = String(errors.length);
    summary.hidden = false;
    summary.focus();
  };

  // ---- Steps ----
  const STEP_TITLES = { input: '', confirm: '入力内容の確認｜', complete: 'デモ完了｜' };
  const STEP_INDEX = { input: 0, confirm: 1, complete: 2 };
  let current = 'input';

  const showStep = (name, { focus = true } = {}) => {
    current = name;
    Object.entries(steps).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
    stepItems.forEach((item, index) => {
      if (index === STEP_INDEX[name]) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    document.title = STEP_TITLES[name] + baseTitle;
    if (!focus) return;
    stepItems[0].parentElement.scrollIntoView({ block: 'start' });
    steps[name].querySelector('[data-contact-step-title]').focus({ preventScroll: true });
  };

  const buildConfirm = () => {
    const items = [];
    const add = (label, value) => items.push([label, value]);
    rows.forEach((row) => {
      if (row.hidden) return;
      const { field } = row.dataset;
      const data = form.elements;
      switch (field) {
        case 'type':
          add(labelOf(row), TYPES[data.type.value]);
          break;
        case 'postal':
          break; // shown with the address
        case 'address':
          add('ご住所', `〒${data.postal.value}\n${data.address.value}`);
          break;
        case 'method':
          add(labelOf(row), data.method.value || '未入力');
          break;
        case 'visitDate':
          add(labelOf(row), `${formatDate(visitDate.value)}　${data.visitTime.value || '時間帯の指定なし'}`);
          break;
        case 'privacy':
          add('個人情報の取り扱い', '同意する');
          break;
        default: {
          const control = controlsOf(row)[0];
          add(labelOf(row), control.value.trim() || '未入力');
        }
      }
    });
    // textContent only: user input is never parsed as HTML
    confirmList.replaceChildren(
      ...items.map(([label, value]) => {
        const div = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        div.append(dt, dd);
        return div;
      }),
    );
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errors = rows
      .map((row) => ({ row, message: validateRow(row) }))
      .filter(({ message }) => message);
    rows.forEach((row) => touched.add(row));
    if (errors.length) {
      showSummary(errors);
      return;
    }
    summary.hidden = true;
    buildConfirm();
    showStep('confirm');
    // browser Back from the confirm step returns to the input step
    window.history.pushState({ contactStep: 'confirm' }, '', window.location.href);
  });

  document.querySelector('[data-contact-back]').addEventListener('click', () => {
    if (window.history.state?.contactStep === 'confirm') window.history.back();
    else showStep('input');
  });

  // demo "send": nothing leaves the browser; clear what was typed and show the complete step
  document.querySelector('[data-contact-send]').addEventListener('click', () => {
    form.reset();
    rows.forEach(clearError);
    touched.clear();
    confirmList.replaceChildren();
    applyType(form.elements.type.value);
    showStep('complete');
    window.history.replaceState({ contactStep: 'complete' }, '', window.location.href);
  });

  window.addEventListener('popstate', (event) => {
    const step = event.state?.contactStep;
    if (step === 'confirm' && current === 'input' && confirmList.children.length) showStep('confirm');
    else if (step !== 'confirm' && current !== 'input') showStep('input');
  });
}
