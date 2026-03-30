const max6675 = formatMessage => ({
    name: formatMessage({
        id: 'max6675.name',
        default: 'MAX6675 Module'
    }),
    extensionId: 'max6675',
    version: '1.0.0',
    supportDevice: ['arduinoUnoR4Wifi', 'arduinoUno', 'arduinoNano', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp32', 'arduinoEsp8266'],
    author: 'ArthurZheng',
    iconURL: `assets/max6675.png`,
    description: formatMessage({
        id: 'max6675.description',
        default: 'K-type thermocouple temperature measurement module based on MAX6675, the measurement range is 0 ~ 1024 ℃'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    translations: 'translations.js',
    library: 'lib',
    official: true,
    tags: ['sensor'],
    helpLink: 'https://xpni.cn/docs'
});

module.exports = max6675;
