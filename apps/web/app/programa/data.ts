export type Conjunto = string;

export type Grupo = {
  numero: number;
  conjuntos: Conjunto[];
};

export type Rol = {
  grupos: Grupo[];
};

export const rolSabado: Rol = {
  grupos: [
    {
      numero: 1,
      conjuntos: [
        'Gran Trad. Auténtica "Diablada Oruro"',
        'Frat. Hijos del Sol "Los Incas"',
        'Conj. Folk. "Morenada Zona Norte"',
        'Frat. Art. "Zampoñeros Hijos del Pagador"',
        'Centro Trad. "Negritos de Pagador"',
        'Conj. Folk. "Ahuatiris"',
        'Conj. Waca Wacas "San Agustín" (Derecho)',
        'Frat. Morenada "Central Oruro"',
        'Conj. Caporales Infantiles "Ignacio León"',
      ],
    },
    {
      numero: 2,
      conjuntos: [
        'Conj. Trad. Folk. "Diablada Oruro"',
        'Frat. Caporales "Centralistas"',
        'Frat. Morenada Central Oruro Fund. por la Com. Cocani',
        'Conj. Folk "Tobas Zona Sud"',
        'Conj. Negritos "Unidos de la Saya"',
        'Conj. Waca Tokoris "Urus"',
        'Conj. Folk. "Antawara"',
        'Conj. Folk. Tinkus "Tolkas"',
      ],
    },
    {
      numero: 3,
      conjuntos: [
        'Frat. Art. y Cult. "La Diablada"',
        'Conj. Morenada "Mejillones"',
        'Frat. Folk. "Llamerada Socavón"',
        'Conj. Folk. y Cult. "Phujllay Oruro"',
        'Grupo de Danza Est. "Suri Sicuri"',
        'Conj. Folk. "Sambos Caporales"',
        'Frat. "Cullaguada Oruro"',
        'Con. Trad. "Tobas Zona Central"',
        'Conj. Folk. de Zampoñeros "Kory Majtas"',
      ],
    },
    {
      numero: 4,
      conjuntos: [
        'Conj. "Diablada Ferroviaria"',
        'Frat. Reyes Moreno "Ferrari Ghezzi"',
        'Caporales Reyes de la Tuntuna "ENAF"',
        'Conj. Tinkus "Los Jairas de Oruro"',
        'Frat. "Cullaguada Terribles Quirquinchos"',
        'Frat. "Kallawayas Bolivia"',
        'Conj. "Potolos Chayantas Jhilancos"',
        'Conj. Folk y Cultural "Doctorcitos Itos"',
        'Frat. de Danza Est. "Intillajta"',
      ],
    },
    {
      numero: 5,
      conjuntos: [
        'Diablada Art. "Urus"',
        'Frat. Cult. Reyes Morenos "Comibol"',
        'Conj. Art. y Cult. "Tobas Uru-Uru"',
        'Frat. Folk. Cult. Caporales Univ. "San Simón"',
        'Conj. Autóctono "Wititis"',
        'Conj. Folk "Tinkus Huajchas"',
        'Incas Kollasuyo "Hijos del Socavón"',
        'Tarqueada "Jatun Jallpa"',
      ],
    },
    {
      numero: 6,
      conjuntos: [
        'Frat. Morenada Metalúrgica "ENAF"',
        'Centro Cultural "Rijchary Llajta"',
        'Conj. Univ. "Suri UTO"',
        'Conj. "Kantus Sartañani"',
        'Frat. Caporales "CBN"',
        'Conj. Autóctono "Sumaj Punchay"',
        'Frat. Folk. Art. Cult. "Pujllay"',
        'Conj. Trad. "Llamerada Zona Norte"',
        'Frat. Cult. Tinkus "Bolivia" (Ayllu Llajwas)',
      ],
    },
  ],
};

export const rolDomingo: Rol = {
  grupos: [
    {
      numero: 1,
      conjuntos: [
        'Diablada Art. "Urus"',
        'Frat. Cult. Reyes Morenos "Comibol"',
        'Conj. Art. y Cult. "Tobas Uru-Uru"',
        'Frat. Folk. Cult. Caporales Univ. "San Simón"',
        'Conj. Autóctono "Wititis"',
        'Conj. Folk "Tinkus Huajchas"',
        'Incas Kollasuyo "Hijos del Socavón"',
        'Tarqueada "Jatun Jallpa"',
      ],
    },
    {
      numero: 2,
      conjuntos: [
        'Conj. "Diablada Ferroviaria"',
        'Frat. Reyes Moreno "Ferrari Ghezzi"',
        'Caporales Reyes de la Tuntuna "ENAF"',
        'Conj. Tinkus "Los Jairas de Oruro"',
        'Frat. "Cullaguada Terribles Quirquinchos"',
        'Frat. "Kallawayas Bolivia"',
        'Conj. "Potolos Chayantas Jhilancos"',
        'Conj. Folk y Cultural "Doctorcitos Itos"',
        'Frat. de Danza Est. "Intillajta"',
      ],
    },
    {
      numero: 3,
      conjuntos: [
        'Frat. Morenada Metalúrgica "ENAF"',
        'Centro Cultural "Rijchary Llajta"',
        'Conj. Univ. "Suri UTO"',
        'Conj. "Kantus Sartañani"',
        'Frat. Caporales "CBN"',
        'Conj. Autóctono "Sumaj Punchay"',
        'Frat. Folk. Art. Cult. "Pujllay"',
        'Conj. Trad. "Llamerada Zona Norte"',
        'Frat. Cult. Tinkus "Bolivia" (Ayllu Llajwas)',
      ],
    },
    {
      numero: 4,
      conjuntos: [
        'Gran Trad. Auténtica "Diablada Oruro"',
        'Frat. Hijos del Sol "Los Incas"',
        'Conj. Folk. "Morenada Zona Norte"',
        'Frat. Art. "Zampoñeros Hijos del Pagador"',
        'Centro Trad. "Negritos de Pagador"',
        'Conj. Folk. "Ahuatiris"',
        'Conj. Waca Wacas "San Agustín" (Derecho)',
        'Frat. Morenada "Central Oruro"',
        'Conj. Caporales Infantiles "Ignacio León"',
      ],
    },
    {
      numero: 5,
      conjuntos: [
        'Frat. Art. y Cult. "La Diablada"',
        'Conj. Morenada "Mejillones"',
        'Frat. Folk. "Llamerada Socavón"',
        'Conj. Folk. y Cult. "Phujllay Oruro"',
        'Grupo de Danza Est. "Suri Sicuri"',
        'Conj. Folk. "Sambos Caporales"',
        'Frat. "Cullaguada Oruro"',
        'Con. Trad. "Tobas Zona Central"',
        'Conj. Folk. de Zampoñeros "Kory Majtas"',
      ],
    },
    {
      numero: 6,
      conjuntos: [
        'Conj. Trad. Folk. "Diablada Oruro"',
        'Frat. Caporales "Centralistas"',
        'Frat. Morenada Central Oruro Fund. por la Com. Cocani',
        'Conj. Folk "Tobas Zona Sud"',
        'Conj. Negritos "Unidos de la Saya"',
        'Conj. Waca Tokoris "Urus"',
        'Conj. Folk. "Antawara"',
        'Conj. Folk. Tinkus "Tolkas"',
      ],
    },
  ],
};