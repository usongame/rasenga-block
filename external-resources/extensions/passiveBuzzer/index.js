const passiveBuzzer = formatMessage => ({
    name: formatMessage({
        id: 'passiveBuzzer.name',
        default: 'Passive Buzzer'
    }),
    extensionId: 'passiveBuzzer',
    version: '3.0.0',
    supportDevice: ['arduinoUnoR4Wifi', 'arduinoUno', 'arduinoNano', 'arduinoLeonardo',
        'arduinoMega2560', 'arduinoEsp8266'],
    author: 'ArthurZheng',
    iconURL: `assets/passiveBuzzer.png`,
    description: formatMessage({
        id: 'passiveBuzzer.description',
        default: 'Unlike the active buzzer, the passive buzzer can be used to make different tones of sound and play some ringtones.' // eslint-disable-line max-len
    }),
    featured: true,
    main: 'main.js',
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    translations: 'translations.js',
    library: 'lib',
    official: true,
    tags: ['actuator'],
    helpLink: 'https://xpni.cn/docs'
});

module.exports = passiveBuzzer;
