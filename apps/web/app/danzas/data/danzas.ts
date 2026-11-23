export type Danza = {
  slug: string;
  name: string;
  href: string;
  dept: string;
  color: string;
  foto?: string;
  image: string;
  origen: string;
  descripcion: string;
  vestimenta: string;
  musica: string;
  curiosidad?: string;
  conjuntos?: string[];
  personajes?: string;
};

export const dances: Danza[] = [

  // ─── ORURO ────────────────────────────────────────────────────────────────

  {
    slug: 'diablada',
    name: 'Diablada',
    href: 'danzas/diablada',
    dept: 'Oruro',
    color: '#c71f1f',
    foto: '/carnaval-fotos/diablada.jpg',
    image: '/caretas/diablada.png',
    origen:
      'Nació en la ciudad minera de Oruro entre los siglos XVII y XVIII como homenaje religioso a la milagrosa Virgen del Socavón, cuya imagen fue descubierta en la casa del famoso ladrón Nina Nina y considerada madre protectora de los mineros.',
    descripcion:
      'Escenifica el combate eterno entre el bien y el mal. Lucifer, amo de los demonios, personifica los 7 pecados capitales junto a la China Supay, su consorte. Frente a ellos, el Arcángel San Miguel encabeza las 7 virtudes y conduce la danza tras desafiar y vencer a Lucifer. Al final del recorrido, todos los diablos se arrodillan ante la Virgen del Socavón en señal de rendición y fe.',
    vestimenta:
      'Máscaras policromadas con cuernos, colmillos y ojos saltones coronados por una serpiente. Capas bordadas en hilo de oro y plata con motivos de dragones y demonios. También participan figuras de oso y cóndor. El peso total de un traje completo puede superar los 15 kg.',
    musica:
      'Ritmo marcial ejecutado por bandas de bronce con tubas, trombones, trompetas y bombos. La melodía es solemne y poderosa, diseñada para acompañar el paso firme de los danzarines enmascarados.',
    curiosidad:
      'La Diablada es el símbolo del Carnaval de Oruro y fue declarada Obra Maestra del Patrimonio Oral e Intangible de la Humanidad por la UNESCO en 2001.',
    personajes:
      'Lucifer, Satanás, los Diablos, la China Supay, el Arcángel San Miguel, los Ángeles, el Oso y el Cóndor.',
    conjuntos: [
      'Gran Tradicional Auténtica Diablada Oruro',
      'Diablada Ferroviaria',
      'Fraternidad Artística y Cultural La Diablada',
      'Diablada URUS',
    ],
  },

  {
    slug: 'morenada',
    name: 'Morenada',
    href: 'danzas/morenada',
    dept: 'Oruro',
    color: '#d97a06',
    foto: '/carnaval-fotos/morenada.jpg',
    image: '/caretas/morenada.png',
    origen:
      'Tiene por tema la colonización española del siglo XVI que recurrió a la importación masiva de esclavos africanos para trabajar en las minas del altiplano. La danza presenta de manera satírica las difíciles condiciones de trabajo de los mineros, y su música melancólica da prueba de sus dolores y sufrimientos.',
    descripcion:
      'Esclavos encadenados, entumecidos por el frío del altiplano y aplastados bajo el peso de las cargas que debían llevar: todas estas condiciones se transcriben en los pasos a tirones de los bailarines y en su traje imponente de más de 25 kg. Bajo la máscara negra decorada con largas plumas, una peluca blanca simboliza la nieve que descubrían con estupor los trabajadores traídos de tierras cálidas.',
    vestimenta:
      'Trajes de terciopelo bordados en hilo dorado y plateado de gran peso. Los varones portan máscaras de rasgos exagerados —labios gruesos, ojos saltones— y matracas en una o ambas manos. Las morenas usan polleras con bordados elaborados y una peluca blanca bajo la máscara.',
    musica:
      'Compás lento y marcado con el sonido rítmico de las matracas en cada paso. Las bandas utilizan bombardinos, tubas y percusión grave, creando una atmósfera solemne y pesada en el desfile.',
    curiosidad:
      'Es considerada la danza más cara del Carnaval de Oruro: un traje completo puede costar varios miles de bolivianos por su bordado artesanal.',
    personajes:
      'El Rey Moreno, la Reina Morena y el conjunto de trabajadores de las minas.',
    conjuntos: [
      'Morenada Central Oruro',
      'Fraternidad Morenada Central — Comunidad Cocani',
      'Morenada Ferroviaria',
      'Morenada Pagador',
    ],
  },

  {
    slug: 'kallawaya',
    name: 'Kallawayas',
    href: 'danzas/kallawaya',
    dept: 'Oruro',
    color: '#1a5c3d',
    foto: '/carnaval-fotos/kallawaya.png',
    image: '/caretas/kallawayas.png',
    origen:
      'Los Kallawayas son médicos itinerantes andinos que desde tiempos preincaicos recorren el altiplano y los valles bolivianos portando conocimientos herbolarios y rituales. Su presencia en el Carnaval de Oruro celebra a estos sabios viajeros que conservaron un saber médico y espiritual transmitido de padres a hijos dentro de las comunidades andinas.',
    descripcion:
      'La danza representa el viaje ritual del kallawaya a través de los diferentes pisos ecológicos en busca de plantas medicinales. Los danzarines portan aguayos con hierbas y amuletos, y realizan movimientos que evocan el caminar pausado del médico itinerante y sus rituales de sanación en las comunidades del altiplano.',
    vestimenta:
      'Poncho multicolor con flecos, chullo, sombrero de ala ancha y un aguayo repleto de hierbas, amuletos y elementos rituales (mesa kallawaya). Es la vestimenta con mayor carga simbólica de todo el Carnaval de Oruro.',
    musica:
      'Melodías de quena y charango con percusión de caja. La música es tranquila y evocadora, acompañando el carácter meditativo y ritual de la danza durante el recorrido por las calles de Oruro.',
    curiosidad:
      'Los kallawayas poseen un lenguaje secreto —el machaj juyai— transmitido solo de padre a hijo varón. La UNESCO los declaró Patrimonio Oral e Intangible de la Humanidad en 2003.',
    personajes:
      'El kallawaya (médico viajero) y su aprendiz.',
    conjuntos: [
      'Kallawaya Oruro',
      'Conjunto Médicos Kallawayas del Carnaval',
      'Fraternidad Kallawaya Altiplano',
    ],
  },

  {
    slug: 'suri-sicuri',
    name: 'Suri Sicuri',
    href: 'danzas/suri-sicuri',
    dept: 'Oruro',
    color: '#2e7d6b',
    foto: '/carnaval-fotos/suri-sicuri.png',
    image: '/caretas/suri-sicuri.png',
    origen:
      'Danza autóctona del altiplano de Oruro que ya existía antes de la llegada de los españoles. En aymara, "suri" significa avestruz andino y "sicuri" es el músico que toca la zampoña. Representa la conexión espiritual del hombre andino con la fauna y la música del altiplano orureño.',
    descripcion:
      'Los danzarines son reconocibles por sus imponentes coronas con plumas de suri en vivos colores. Imitan los movimientos gráciles del ave mientras ejecutan simultáneamente la zampoña, creando una expresión única donde música y movimiento son inseparables. Los trajes son relativamente simples para no restar protagonismo a las coronas de plumas.',
    vestimenta:
      'Camisa blanca almidonada y poncho blanco dispuesto diagonalmente sobre la espalda. La corona de plumas de suri en colores vivos es el elemento más distintivo e imponente de la danza.',
    musica:
      'Zampoñas en sus diferentes registros —malta, sanka, ch\'ili— formando un conjunto polifónico. La melodía es circular y repetitiva, con un sonido profundo y envolvente que resuena en las calles de Oruro durante el Carnaval.',
    conjuntos: [
      'Suri Sicuri Oruro',
      'Fraternidad Suri Sicuri Altiplano',
      'Conjunto Suri Sicuri Pagador',
    ],
  },

  {
    slug: 'antawara',
    name: 'Antawara',
    href: 'danzas/antawara',
    dept: 'Oruro',
    color: '#1a5c8a',
    foto: '/carnaval-fotos/antawara.png',
    image: '/caretas/antawara.png',
    origen:
      'Danza guerrera prehispánica del Carnaval de Oruro que representa a los soldados de élite del ejército inca en el territorio del Collasuyo, región que hoy corresponde al altiplano orureño. Se conservó en las comunidades de Oruro como memoria viva de la organización militar que precedió a la colonia española.',
    descripcion:
      'Recrea formaciones y movimientos de combate del ejército incaico, con coreografías que simulan el avance, la defensa y el ataque en batalla. Su carácter marcial y solemne contrasta con las danzas festivas del Carnaval y recuerda la profundidad histórica del territorio orureño dentro del antiguo Tawantinsuyo.',
    vestimenta:
      'Casco de guerrero con plumas, escudo circular, lanza y armadura de tela bordada con motivos geométricos andinos en rojo y negro. Evoca la estética militar incaica adaptada por los artesanos del altiplano.',
    musica:
      'Melodías marciales ejecutadas con pututos (trompetas de caracol andino), bombos y quenas. Ritmo firme y cadencioso que marca el paso de los guerreros en formación durante el desfile.',
    personajes:
      'El comandante guerrero, los soldados de élite y el portaestandarte.',
    conjuntos: [
      'Antawara Oruro',
      'Fraternidad Guerreros Antawara',
      'Conjunto Antawara UTO',
    ],
  },

  {
    slug: 'awatiri',
    name: 'Awatiri',
    href: 'danzas/awatiri',
    dept: 'Oruro',
    color: '#3d6b2e',
    foto: '/carnaval-fotos/awatiri.png',
    image: '/caretas/awatiri.png',
    origen:
      'Danza autóctona del altiplano orureño que representa a los pastores aymaras en su vida cotidiana. El nombre significa "pastor" en aymara. Refleja la economía pastoril que sostuvo a las comunidades del departamento durante siglos y que aún persiste en las punas de Oruro.',
    descripcion:
      'Los danzarines representan el ciclo de vida del pastor orureño: el cuidado del ganado camélido, el cortejo entre jóvenes de la comunidad, las labores de esquila y la relación espiritual con la Pachamama. Alterna momentos líricos con secuencias de trabajo cotidiano en el altiplano.',
    vestimenta:
      'Poncho tejido a mano en colores naturales de lana de llama, chulo con orejeras, pantalón oscuro y ojotas. Las mujeres usan pollera de bayeta, blusa bordada y sombrero. Ambos portan warakas (hondas) y bastones de pastor.',
    musica:
      'Quenas, pinkillus y charangos acompañados de caja. Melodías melancólicas y evocadoras propias del altiplano abierto y ventoso del departamento de Oruro.',
    personajes:
      'El pastor (awatiri), la pastora y el rebaño de llamas y alpacas.',
    conjuntos: [
      'Awatiri Oruro',
      'Conjunto Awatiri Altiplano',
      'Fraternidad Awatiri Pagador',
    ],
  },

  {
    slug: 'wititi',
    name: 'Wititi',
    href: 'danzas/wititi',
    dept: 'Oruro',
    color: '#8b1a1a',
    foto: '/carnaval-fotos/wititi.png',
    image: '/caretas/wititi.png',
    origen:
      'Danza tradicional del altiplano boliviano. Según la tradición, simboliza la caza de aves de la región andina, como la perdiz u otras especies del altiplano. Es una danza mixta en la que hombres y mujeres bailan juntos imitando el paso ligero y ágil de las aves.',
    descripcion:
      'Los danzantes se mueven de forma muy ligera y ágil imitando el paso de las aves por el altiplano. La vestimenta usada durante la danza es especial y vistosa para el observador, y la participación conjunta de hombres y mujeres le da un carácter festivo y comunitario que el público del Carnaval de Oruro disfruta durante el recorrido.',
    vestimenta:
      'Vestimenta vistosa y especial propia del altiplano boliviano, diseñada para evocar el movimiento y los colores de las aves andinas. Varones y mujeres participan con trajes complementarios que refuerzan el carácter mixto y festivo de la danza.',
    musica:
      'Melodías alegres y festivas ejecutadas con quenas, charangos y percusión. El ritmo es vivo y cadencioso, acompañando los movimientos ligeros y ágiles de los danzarines.',
    personajes:
      'Los danzarines varones y las danzarinas mujeres del conjunto.',
    conjuntos: [
      'Wititi Oruro',
      'Fraternidad Wititi Altiplano',
      'Conjunto Wititi Carnaval',
    ],
  },

  {
    slug: 'zamponeros',
    name: 'Zampoñeros',
    href: 'danzas/zamponeros',
    dept: 'Oruro',
    color: '#2e4a7d',
    foto: '/carnaval-fotos/zamponeros.png',
    image: '/caretas/zamponeros.png',
    origen:
      'Expresión musical y dancística de las comunidades aymaras y quechuas del altiplano de Oruro. Los sampoñaris —como también se los conoce— son los ejecutantes del siku o zampoña, instrumento de viento prehispánico que forma parte del patrimonio musical del departamento y del Carnaval de Oruro.',
    descripcion:
      'Los conjuntos desfilan tocando y bailando simultáneamente, priorizando la ejecución musical colectiva. El siku se toca en sistema de hoquetus: cada ejecutante lleva la mitad de las notas de la escala y debe coordinarse con su par para completar la melodía, haciendo de esta música una expresión comunitaria por definición.',
    vestimenta:
      'Trajes tradicionales del altiplano orureño: ponchos de colores, chulos, pantalón oscuro y ojotas. Cada conjunto define sus colores de identificación. Las zampoñas de distintos tamaños son el elemento visual más destacado.',
    musica:
      'Zampoñas en sus registros ch\'ili (soprano), malta (tenor), sanka (barítono) y toyo (bajo). La polifonía resultante crea el sonido característico del altiplano orureño, profundo y resonante, durante el Carnaval.',
    curiosidad:
      'La técnica del hoquetus en el siku es una de las formas musicales colectivas más antiguas del altiplano, presente en el territorio orureño desde antes de la colonia.',
    conjuntos: [
      'Zampoñeros Oruro',
      'Centro Cultural Zampoñeros del Altiplano',
      'Fraternidad Zampoñeros Pagador',
    ],
  },

  {
    slug: 'tarqueada',
    name: 'Tarqueada',
    href: 'danzas/tarqueada',
    dept: 'Oruro',
    color: '#5c3d1e',
    foto: '/carnaval-fotos/tarqueada.png',
    image: '/caretas/tarqueada.png',
    origen:
      'Danza y música ejecutada con la tarka, flauta de pico de madera de origen prehispánico presente en las comunidades del altiplano de Oruro. Las comunidades orureñas asocian el sonido de la tarka con la fertilidad de la tierra y la abundancia de cosechas durante el Carnaval.',
    descripcion:
      'Los danzarines tocan y bailan simultáneamente durante toda la Entrada. La tarka tiene un sonido nasal y penetrante que se proyecta con fuerza al aire libre. La danza acompaña la música con movimientos vigorosos y festivos, propios de la celebración comunitaria del Carnaval en el altiplano.',
    vestimenta:
      'Vestimenta tradicional del altiplano: poncho, chulo y ojotas para los varones; pollera, blusa y sombrero para las mujeres. Los colores varían según la comunidad de origen. Cada danzarín porta su tarka de madera dura.',
    musica:
      'Conjuntos de tarkas en diferentes registros tocadas en hoquetus, acompañadas de bombo y caja. El sonido es áspero y vibrante, con carácter festivo e irreverente que define el ambiente del Carnaval.',
    curiosidad:
      'La tradición prohíbe tocar la tarka fuera de la época de lluvias, pues se cree que puede atraer granizadas sobre los cultivos.',
    conjuntos: [
      'Tarqueada Oruro',
      'Conjunto Tarqueada Altiplano',
      'Fraternidad Tarqueada Pagador',
    ],
  },

  {
    slug: 'kantus',
    name: 'Kantus',
    href: 'danzas/kantus',
    dept: 'Oruro',
    color: '#4a1942',
    foto: '/carnaval-fotos/kantus.png',
    image: '/caretas/kantus.png',
    origen:
      'Danza y música de las comunidades andinas del altiplano presente en el Carnaval de Oruro. Los Kantus ejecutan sikus de gran tamaño y representan una de las expresiones más antiguas y refinadas de la música autóctona boliviana, de raíces prehispánicas que perviven en la festividad orureña.',
    descripcion:
      'Se distinguen por la profundidad y solemnidad de su música, ejecutada con zampoñas de grandes dimensiones. La danza es sobria y procesional, de carácter ceremonial. En el Carnaval de Oruro, los Kantus ofrecen uno de los contrastes más notables: su solemnidad frente a la fastuosidad de las danzas de trajes bordados.',
    vestimenta:
      'Poncho ceremonial de lana tejida a mano con diseños geométricos andinos, chulo con orejeras largas y ojotas. Las mujeres usan pollera de bayeta oscura, blusa bordada y manta. El aspecto austero resalta la pureza de la expresión musical.',
    musica:
      'Zampoñas de gran tamaño en hoquetus, con sonido grave, profundo y resonante. La melodía es lenta y circular, de carácter ceremonial, que otorga al Carnaval de Oruro momentos de profundidad espiritual.',
    curiosidad:
      'Los Kantus fueron reconocidos por la UNESCO como Patrimonio Cultural Inmaterial de la Humanidad en 2009, reforzando el valor del Carnaval de Oruro como espacio vivo de preservación cultural.',
    conjuntos: [
      'Kantus Oruro',
      'Comunidad Kantus Altiplano',
      'Fraternidad Kantus Pagador',
    ],
  },

  // ─── LA PAZ ───────────────────────────────────────────────────────────────

  {
    slug: 'caporales',
    name: 'Caporales',
    href: 'danzas/caporales',
    dept: 'La Paz',
    color: '#c9a233',
    foto: '/carnaval-fotos/caporales.png',
    image: '/caretas/caporales.png',
    origen:
      'Danza paceña derivada de la Saya y del Tundiqui. Refleja la autoridad de los caporales, capataces que supervisaban el trabajo de los esclavos en las haciendas durante la colonización española. Aporta al Carnaval de Oruro la energía urbana y el ritmo ágil e imponente característico del departamento paceño.',
    descripcion:
      'Las mujeres, vestidas de faldas cortas, agitan las caderas de manera elegante, mientras los hombres bailan con paso firme y enérgico combinando figuras acrobáticas espectaculares. El tintineo de los cascabeles sobre las botas de los bailarines y el látigo del caporal son los elementos sonoros y visuales más distintivos de la danza.',
    vestimenta:
      'Los varones usan botas altas con cascabeles, pantalón ajustado, chaqueta de colores vivos con bordados y sombrero de ala ancha. Portan un látigo como símbolo del caporal. Las mujeres llevan minifalda bordada, medias y botas cortas. Los trajes actuales son lujosos y con mucho brillo.',
    musica:
      'Ritmo vivo y sincopado con dos tiempos, ejecutado con trompetas, trombones y percusión. El sonido de los cascabeles en las botas es parte indisoluble de la música durante el desfile por Oruro.',
    personajes:
      'El Caporal (jefe de grupo) y el conjunto de bailarines.',
    conjuntos: [
      'San Simón',
      'Los Fanáticos',
      'Fraternidad Caporales Centralistas',
      'Caporales Estudiantiles',
    ],
  },

  {
    slug: 'kullawada',
    name: 'Kullawada',
    href: 'danzas/kullawada',
    dept: 'La Paz',
    color: '#d97a06',
    foto: '/carnaval-fotos/kullawada.png',
    image: '/caretas/kullawada.png',
    origen:
      'Danza paceña cuyos orígenes son previos a la llegada de los españoles. La Kullawada es la danza de los hilanderos y tejedores de lanas de llamas del altiplano. Pone en valor los preciosos tejidos que eran uno de los pilares socioeconómicos de la cultura andina de los Collas.',
    descripcion:
      'Rinde homenaje a los maestros artesanos textiles del altiplano paceño. Hombres y mujeres llevan el mismo sombrero (kh\'ara) así como una rueca (k\'apu), elemento central que evoca el proceso del tejido. Es una danza de carácter señorial y elegante, símbolo de la identidad artesanal aymara.',
    vestimenta:
      'Trajes elegantes, bordados y decorados con perlas y monedas. Hombres y mujeres llevan el mismo sombrero kh\'ara y portan una rueca k\'apu. Los bordados representan motivos textiles andinos en colores brillantes.',
    musica:
      'Ritmo pausado y solemne con bandas de bronce que tocan melodías de compás lento, evocando la cadencia repetitiva del trabajo artesanal.',
    personajes:
      'El maestro hilador, la hiladora y el conjunto de artesanos.',
    conjuntos: [
      'Kullawada Central',
      'Fraternidad Kullawada Residentes en Oruro',
      'Kullawada Originaria',
    ],
  },

  {
    slug: 'llamerada',
    name: 'Llamerada',
    href: 'danzas/llamerada',
    dept: 'La Paz',
    color: '#c71f1f',
    foto: '/carnaval-fotos/llamerada.png',
    image: '/caretas/llamerada.png',
    origen:
      'Representación de la actividad económica más importante de los pueblos originarios de los Andes: la cría de la llama. Rememora la gigantesca tarea de domesticación de los camélidos sudamericanos realizada hace más de cinco mil años, que desembocó en el desarrollo genético de la llama como animal de carga y de lana.',
    descripcion:
      'Los danzarines imitan el caminar pausado y cadencioso de las llamas y recrean las actividades del arriero andino: la carga, el pastoreo y el intercambio comunitario. Es una danza de origen prehispánico que lleva al Carnaval de Oruro la memoria viva de la relación entre el hombre andino y el camélido.',
    vestimenta:
      'Chulo, poncho tejido en lana de llama con motivos geométricos andinos, pantalón oscuro y ojotas de cuero. Los danzarines portan hondas (warakas); en algunos conjuntos se incluyen llamas disecadas o réplicas como parte del grupo.',
    musica:
      'Melodías andinas ejecutadas con zampoñas, quenas y charangos, acompañadas de caja y bombo. El ritmo es moderado y cadencioso, evocando el paso tranquilo del ganado por el altiplano.',
    personajes:
      'El pastor llamero, su pareja y las llamas.',
    conjuntos: [
      'Llamerada Oruro',
      'Llamerada Central',
      'Conjunto Llamerada Wiñay Marka',
    ],
  },

  {
    slug: 'incas',
    name: 'Incas',
    href: 'danzas/incas',
    dept: 'La Paz',
    color: '#b8860b',
    foto: '/carnaval-fotos/incas.png',
    image: '/caretas/incas.png',
    origen:
      'Danza histórica que escenifica la conquista española sobre el inmenso Imperio Inca del Tawantinsuyo. Los bailarines rinden homenaje a la grandeza y dignidad de la civilización andina, dirigida por el primer emperador Manco Cápac y su esposa Mama Ocllo, protegidos por su guardia personal.',
    descripcion:
      'La comitiva en la danza está integrada por las vírgenes del sol, los nobles incas (orejones) y los conquistadores españoles de la época, junto a un sacerdote. La representación tiene un fuerte componente teatral y narrativo que la diferencia de otras danzas del Carnaval de Oruro, funcionando casi como un drama musical dentro de la Entrada.',
    vestimenta:
      'Túnicas y mantos dorados y rojos con bordados en hilo metálico. El Inca porta la mascaipacha (borla imperial), escudo y cetro dorado. Los nobles incas usan orejeras y tocados de plumas. Los conquistadores visten armadura y casco español estilizados.',
    musica:
      'Melodías majestuosas y solemnes ejecutadas por bandas de bronce. En los momentos dramáticos el ritmo se hace lento y tenso; en las celebraciones del Imperio, vivo y festivo.',
    personajes:
      'Manco Cápac, Mama Ocllo, las vírgenes del sol, los nobles incas (orejones), los conquistadores españoles y el sacerdote.',
    conjuntos: [
      'Conjunto Incas Oruro',
      'Fraternidad Imperio Inca',
      'Incas Universidad Técnica de Oruro',
    ],
  },

  {
    slug: 'doctorcitos',
    name: 'Doctorcitos (Siklla)',
    href: 'danzas/doctorcitos',
    dept: 'La Paz',
    color: '#2c3e6b',
    foto: '/carnaval-fotos/doctorcito.png',
    image: '/caretas/doctorcito.png',
    origen:
      'Danza satírica de origen paceño que se burla de los abogados, médicos y burócratas de las ciudades. Refleja la crítica popular a las élites criollas y mestizas que ejercieron el poder sobre la población indígena y minera durante la colonia y la república.',
    descripcion:
      'Una de las pocas danzas del Carnaval de Oruro con contenido abiertamente crítico y burlesco hacia el poder. Los danzarines imitan los gestos afectados de profesionales y autoridades: caminan con exagerada solemnidad, portan maletines y papeles, y ridiculizan los rituales del poder burocrático. El Carnaval como espacio donde el pueblo se ríe de quienes históricamente ejercieron el poder sobre él.',
    vestimenta:
      'Terno negro o azul, corbata, sombrero de copa o bombín, lentes redondos y maletín. Las máscaras representan rostros de nariz prominente y expresión arrogante, caricaturizando al "doctor" criollo. El contraste entre la vestimenta formal y el ambiente festivo del Carnaval es parte central del mensaje.',
    musica:
      'Melodías alegres y burlescas con bandas de bronce. El ritmo es festivo y a veces intencionalmente descoordinado, reforzando el carácter cómico de la danza.',
    personajes:
      'El Doctor (abogado o médico caricaturizado), el Juez, el Notario y el Secretario.',
    conjuntos: [
      'Doctorcitos Oruro',
      'Fraternidad Siklla Carnaval',
      'Conjunto Doctorcitos Pagador',
    ],
  },

  // ─── POTOSÍ ───────────────────────────────────────────────────────────────

  {
    slug: 'tinku',
    name: 'Tinku',
    href: 'danzas/tinku',
    dept: 'Potosí',
    color: '#6b2e5c',
    foto: '/carnaval-fotos/tinku.png',
    image: '/caretas/tinku.png',
    origen:
      'El Tinku —que significa "Encuentro" en quechua— es una ceremonia tradicional del norte de Potosí durante la cual campesinos de dos comunidades vecinas se enfrentan en combate ritual. Se perpetúa desde tiempos precolombinos en honor a la Pachamama, a quien se pide bendiciones para la siembra y una buena cosecha.',
    descripcion:
      'La danza del Tinku pone en escena dos líneas de hombres y mujeres que miden su fuerza en el combate ritual. Los participantes recrean el enfrentamiento con movimientos agresivos y desafíos entre grupos, conservando la energía y el simbolismo del ritual original. En el Carnaval de Oruro es una de las danzas con mayor número de conjuntos inscritos.',
    vestimenta:
      'Casco de combate de cuero típico (la montera) y túnicas o vestimentas en colores fuertes: anaranjado, verde, azul. Las mujeres usan pollera corta y blusa bordada. El calzado es ligero para facilitar los movimientos de combate.',
    musica:
      'Ritmo percusivo y enérgico con bombos, tambores y vientos. La melodía es repetitiva e hipnótica, diseñada para mantener la intensidad del enfrentamiento ritual durante el recorrido del Carnaval.',
    curiosidad:
      'El Tinku es hoy una de las danzas con mayor número de conjuntos inscritos en la Entrada del Carnaval de Oruro, especialmente entre agrupaciones universitarias y estudiantiles.',
    personajes:
      'Los guerreros de comunidades enfrentadas y las mujeres que animan el combate.',
    conjuntos: [
      'Tinku Oruro',
      'Fraternidad Tinku Norte Potosí',
      'Conjunto Tinku Universitario UTO',
    ],
  },

  {
    slug: 'potolos',
    name: 'Potolos',
    href: 'danzas/potolos',
    dept: 'Potosí',
    color: '#7d3c1a',
    foto: '/carnaval-fotos/potolos.png',
    image: '/caretas/potolos.png',
    origen:
      'Danza originaria de las poblaciones de Potolo y Potobamba en el norte de Potosí. Se caracteriza por movimientos rítmicos acompasados con graciosos movimientos de caderas, que le ponen una nota simpática y festiva dentro del Carnaval de Oruro.',
    descripcion:
      'Los danzarines ejecutan movimientos cadenciosos y expresivos propios de las comunidades potosinas. El carácter pícaro y rítmico de los Potolos contrasta con la solemnidad de otras danzas del Carnaval de Oruro, aportando energía y humor al desfile.',
    vestimenta:
      'La vestimenta se caracteriza por el sombrero de cuero de oveja con forma semicircular y ala muy angosta, uno de los elementos más reconocibles del Carnaval de Oruro. Poncho a rayas multicolores tejido en telar, pantalón y ojotas. Las mujeres usan pollera oscura, blusa y aguayo.',
    musica:
      'Quenas, charangos y percusión con caja. Las melodías son vivas y rítmicas, acompañando los movimientos pícaros y expresivos de la danza.',
    personajes:
      'El danzarín y la danzarina de las comunidades potosinas.',
    conjuntos: [
      'Potolos Oruro',
      'Conjunto Potolos Norte Potosí',
      'Fraternidad Potolos Carnaval',
    ],
  },

  // ─── TARIJA ───────────────────────────────────────────────────────────────

  {
    slug: 'tobas',
    name: 'Tobas',
    href: 'danzas/tobas',
    dept: 'Tarija',
    color: '#c9a233',
    foto: '/carnaval-fotos/tobas.png',
    image: '/caretas/tobas.png',
    origen:
      'Danza cuyo origen se remonta al Imperio Inca, que a medida de sus conquistas en las regiones de los llanos bolivianos desplazaba las tribus indígenas hacia el altiplano. La danza honra y preserva con orgullo la cultura y las tradiciones ancestrales del pueblo de los Tobas, llevadas al Carnaval de Oruro a través del folklore tarijeño.',
    descripcion:
      'Los danzarines ejecutan un paso enérgico y ligero con saltos atléticos que imitan los movimientos guerreros y de caza de los pueblos de las tierras bajas. En el Carnaval de Oruro, los Tobas son una de las danzas de mayor espectacularidad visual, con rutinas que combinan acrobacia y precisión coreográfica.',
    vestimenta:
      'Vestuario elaborado en base a pieles de animales amazónicos, adornado con plumas en la cabeza, brazos y pies. Los danzarines van armados con lanzas y ejecutan su paso enérgico y ligero con gran agilidad.',
    musica:
      'Ritmo vivo y percusivo con bombo, redoblante y vientos. La melodía tiene carácter festivo y guerrero, con cambios de tempo que acompañan los momentos acrobáticos del desfile.',
    personajes:
      'El guerrero Toba, el cazador y el grupo de danzarines.',
    conjuntos: [
      'Fraternidad Tobas Real Imperio',
      'Conjunto Tobas Oruro',
      'Tobas Universitarios UTO',
    ],
  },

];

export function getDanzaBySlug(slug: string) {
  return dances.find((d) => d.slug === slug);
}