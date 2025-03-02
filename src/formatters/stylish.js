import _ from 'lodash';

const indentSize = 4; // Убедитесь, что это значение соответствует ожидаемым отступам
const shiftSize = 2;  // Убедитесь, что это значение корректно

const getIndent = (depth, shift = 0) => ' '.repeat((depth - 1) * indentSize + shift);

const getBracketIndent = (depth) => ' '.repeat((depth - 1) * indentSize);

const formatValue = (value, depth) => {
  if (_.isPlainObject(value)) {
    const indent = getIndent(depth + 1);
    const bracketIndent = getBracketIndent(depth + 1);

    const lines = Object.entries(value)
      .map(([key, val]) => `${indent}  ${key}: ${formatValue(val, depth + 1)}`);

    return `{\n${lines.join('\n')}\n${bracketIndent}}`;
  }

  if (Array.isArray(value)) {
    const indent = getIndent(depth + 1);
    const bracketIndent = getBracketIndent(depth + 1);

    const lines = value
      .map((item) => `${indent}${formatValue(item, depth + 1)}`);

    return `[\n${lines.join('\n')}\n${bracketIndent}]`;
  }

  if (typeof value === 'string') {
    return value; // Уберите кавычки для строк
  }

  if (value === null) {
    return 'null'; // Возвращайте 'null' для null
  }

  if (value === '') {
    return ''; // Возвращайте пустую строку без кавычек и лишних пробелов
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
};

const formatStylish = (diff, depth = 1) => {
  const indent = getIndent(depth, shiftSize);
  const bracketIndent = getBracketIndent(depth);

  const formatters = {
    added: ({ key, value }) => `${indent}+ ${key}: ${formatValue(value, depth)}`,
    removed: ({ key, value }) => `${indent}- ${key}: ${formatValue(value, depth)}`,
    changed: ({ key, oldValue, newValue }) => [
      `${indent}- ${key}: ${formatValue(oldValue, depth)}`,
      `${indent}+ ${key}: ${formatValue(newValue, depth)}`,
    ].join('\n'),
    nested: ({ key, children }) => `${indent}  ${key}: ${formatStylish(children, depth + 1)}`,
    unchanged: ({ key, value }) => `${indent}  ${key}: ${formatValue(value, depth)}`,
  };

  const lines = diff.map((node) => formatters[node.type](node));

  return `{\n${lines.join('\n')}\n${bracketIndent}}`;
};

export default formatStylish;
