const ultrasonic = formatMessage => ({
    name: formatMessage({
        id: 'ultrasonic.name',
        default: 'Ultrasonic'
    }),
    extensionId: 'espUltrasonic',
    version: '1.0.0',
    supportDevice: ['arduinoUnoR4Wifi', 'microPythonEsp32', 'microPythonEsp8266'],
    author: 'ArthurZheng',
    iconURL: `assets/ultrasonic.png`,
    description: formatMessage({
        id: 'ultrasonic.description',
        default: 'Standard ultrasonic distance measurement module.'
    }),
    featured: true,
    blocks: 'blocks.js',
    generator: 'generator.js',
    toolbox: 'toolbox.js',
    translations: 'translations.js',
    library: 'lib',
    official: true,
    tags: ['sensor'],
    helpLink: 'https://wiki.openblock.cc'
});

module.exports = ultrasonic;
