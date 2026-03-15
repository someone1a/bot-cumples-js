import { getAge } from './dateUtils.js';

const DEFAULT_TEMPLATE = '🎉 Hoy cumple {name}. ¡Feliz cumpleaños!';

export function renderTemplate(template, birthday) {
  if (!template || typeof template !== 'string') {
    template = DEFAULT_TEMPLATE;
  }

  const age = getAge(birthday.birth_date);

  const replacements = {
    '{name}': birthday.name,
    '{age}': age.toString(),
    '{años}': age.toString(),
    '{Name}': birthday.name,
    '{NAME}': birthday.name.toUpperCase()
  };

  let rendered = template;
  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.split(key).join(value);
  }

  return rendered;
}

export function getDefaultTemplate() {
  return DEFAULT_TEMPLATE;
}
