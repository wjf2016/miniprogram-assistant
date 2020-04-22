module.exports = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  trailingComma: 'all',
  endOfLine: 'auto', // 不检测文件每行结束的格式
  overrides: [
    {
      files: '*.wxs',
      options: {
        parser: 'babel',
      },
    },
  ],
}
