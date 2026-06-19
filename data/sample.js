// Datos de ejemplo para el prototipo — Romanos 7
// Estructura pensada para luego mapear desde módulos theWord/MySword reales.

const SAMPLE_DATA = {
  meta: {
    book: "Romanos",
    chapter: 7,
    version: "rvr1909",
    versionFull: "Reina Valera 1909 (dominio público)"
  },

  // Versiones disponibles para lectura principal y comparación.
  // license: "dominio-publico" → libre sin restricciones.
  // license: "libre-intacto" → gratis para el usuario final, pero el texto
  //          no puede alterarse ni una palabra (condición del autor/editor).
  versions: {
    sse: {
      label: "SSE",
      full: "Sagradas Escrituras (Biblia del Oso) 1569",
      year: 1569,
      license: "dominio-publico"
    },
    rv1602: {
      label: "RV 1602",
      full: "Reina Valera Antigua 1602 (revisión de Cipriano de Valera)",
      year: 1602,
      license: "dominio-publico"
    },
    rv1865: {
      label: "RV 1865",
      full: "Reina Valera 1865 (revisión Ángel de Mora)",
      year: 1865,
      license: "dominio-publico"
    },
    rvr1909: {
      label: "RVR 1909",
      full: "Reina Valera 1909",
      year: 1909,
      license: "dominio-publico"
    },
    rvg: {
      label: "RVG",
      full: "Reina Valera Gómez",
      year: 2010,
      license: "libre-intacto",
      licenseNote: "Uso y distribución gratuita autorizados por el autor (Dr. Humberto Gómez Caballero), bajo la condición de no alterar el texto. No es dominio público."
    }
  },

  verses: [
    {
      n: 1,
      hasNote: false,
      text: {
        rvr1909: "¿No sabéis, hermanos, (porque hablo con los que saben la ley) que la ley solamente se enseñorea en el hombre entre tanto que vive?",
        sse: "¿No sabéis, hermanos, (porque hablo con los que saben la ley) que la ley solamente se enseñorea en el hombre entre tanto que vive?",
        rv1865: "¿No sabéis, hermanos, (porque hablo con los que saben la ley) que la ley solamente tiene dominio sobre el hombre entre tanto que vive?",
        rv1602: "¿No sabéis, hermanos, (porque hablo con los que saben la ley) que la ley se enseñorea del hombre entre tanto que vive?",
        rvg: "¿No sabéis, hermanos, (porque hablo con los que conocen la ley) que la ley solamente se enseñorea sobre el hombre entre tanto que vive?"
      }
    },
    {
      n: 2,
      hasNote: false,
      text: {
        rvr1909: "Porque la mujer que está sujeta á marido, mientras el marido vive está obligada á la ley; mas muerto el marido, libre es de la ley del marido.",
        sse: "Porque la mujer que está sujeta a marido, mientras el marido vive está obligada a la ley; mas muerto el marido, libre es de la ley del marido.",
        rv1865: "Porque la mujer que está sujeta a marido, mientras el marido vive, está obligada a la ley; mas muerto el marido, libre está de la ley del marido.",
        rv1602: "Porque la mujer que está sujeta a marido, mientras el marido vive está obligada a la ley; mas muerto el marido, libre es de la ley del marido.",
        rvg: "Porque la mujer que está sujeta a marido, mientras el marido vive está atada a la ley; pero si el marido muere, ella queda libre de la ley del marido."
      }
    },
    {
      n: 7,
      hasNote: true,
      noteId: "rom7-7",
      text: {
        rvr1909: "¿Qué pues diremos? ¿La ley es pecado? En ninguna manera. Empero yo no conocí el pecado sino por la ley: porque tampoco conociera la concupiscencia, si la ley no dijera: No codiciarás.",
        sse: "¿Qué pues diremos? ¿La ley es pecado? En ninguna manera. Pero yo no conocí el pecado sino por la ley; porque tampoco conociera la concupiscencia, si la ley no dijera: No codiciarás.",
        rv1865: "¿Qué pues diremos? ¿Es la ley pecado? En ninguna manera. Mas yo no conocí el pecado sino por la ley, porque tampoco conociera la codicia, si la ley no dijera: No codiciarás.",
        rv1602: "¿Qué pues diremos? ¿La ley es pecado? En ninguna manera. Empero yo no conocí el pecado sino por la ley; porque tampoco conociera la concupiscencia, si la ley no dijera: No codiciarás.",
        rvg: "¿Qué pues diremos? ¿Es la ley pecado? En ninguna manera. Pero yo no conocí el pecado sino por la ley; porque tampoco conociera la concupiscencia, si la ley no dijera: No codiciarás."
      }
    },
    {
      n: 14,
      hasNote: true,
      noteId: "rom7-14",
      strongs: [{ word: "carnal", g: "G4559", gloss: "sarkikós — perteneciente a la carne, dominado por ella" }],
      text: {
        rvr1909: "Porque sabemos que la ley es espiritual; mas yo soy carnal, vendido al pecado.",
        sse: "Porque sabemos que la ley es espiritual; mas yo soy carnal, vendido al pecado.",
        rv1865: "Porque sabemos que la ley es espiritual; mas yo soy carnal, vendido al pecado.",
        rv1602: "Porque sabemos que la ley es espiritual; mas yo soy carnal, vendido al pecado.",
        rvg: "Porque sabemos que la ley es espiritual; pero yo soy carnal, vendido al pecado."
      }
    },
    {
      n: 15,
      hasNote: true,
      noteId: "rom7-15",
      text: {
        rvr1909: "Porque lo que hago, no lo entiendo; ni hago lo que quiero, sino lo que aborrezco, eso hago.",
        sse: "Porque lo que hago, no lo entiendo; ni hago lo que quiero, sino lo que aborrezco, eso hago.",
        rv1865: "Porque lo que hago, no lo entiendo; porque no hago lo que quiero, sino lo que aborrezco, eso hago.",
        rv1602: "Porque lo que hago, no lo entiendo; ni hago lo que quiero, sino lo que aborrezco, eso hago.",
        rvg: "Porque lo que hago, no lo entiendo; porque no hago lo que quiero, sino lo que aborrezco, eso hago."
      }
    },
    {
      n: 18,
      hasNote: false,
      text: {
        rvr1909: "Y yo sé que en mí (esto es, en mi carne) no mora el bien: porque tengo el querer, mas efectuar el bien no lo alcanzo.",
        sse: "Y yo sé que en mí (esto es, en mi carne) no mora el bien; porque tengo el querer, mas efectuar el bien no lo alcanzo.",
        rv1865: "Y yo sé que en mí, esto es, en mi carne, no mora el bien; porque el querer está en mí, mas el hacer el bien no lo alcanzo.",
        rv1602: "Y yo sé que en mí (esto es, en mi carne) no mora el bien; porque tengo el querer, mas efectuar el bien no lo alcanzo.",
        rvg: "Y yo sé que en mí (esto es, en mi carne) no mora el bien; porque el querer está en mí, pero el hacer el bien no lo hallo."
      }
    },
    {
      n: 19,
      hasNote: false,
      text: {
        rvr1909: "Porque no hago el bien que quiero: antes hago el mal que no quiero.",
        sse: "Porque no hago el bien que quiero; antes hago el mal que no quiero.",
        rv1865: "Porque no hago el bien que quiero; sino que el mal que no quiero, esto hago.",
        rv1602: "Porque no hago el bien que quiero; antes hago el mal que no quiero.",
        rvg: "Porque no hago el bien que quiero; sino el mal que no quiero, eso hago."
      }
    },
    {
      n: 24,
      hasNote: true,
      noteId: "rom7-24",
      text: {
        rvr1909: "¡Miserable hombre de mí! ¿quién me librará del cuerpo de este pecado?",
        sse: "¡Miserable hombre de mí! ¿quién me librará del cuerpo de esta muerte?",
        rv1865: "¡Miserable hombre de mí! ¿quién me librará del cuerpo de esta muerte?",
        rv1602: "¡Miserable hombre de mí! ¿quién me librará del cuerpo de esta muerte?",
        rvg: "¡Miserable hombre de mí! ¿quién me librará del cuerpo de esta muerte?"
      }
    },
    {
      n: 25,
      hasNote: false,
      text: {
        rvr1909: "Gracias doy á Dios, por Jesucristo Señor nuestro. Así que, yo mismo con la mente sirvo á la ley de Dios; mas con la carne á la ley del pecado.",
        sse: "Gracias doy a Dios, por Jesús el Cristo Señor nuestro. Así que, yo mismo con la mente sirvo a la ley de Dios; mas con la carne a la ley del pecado.",
        rv1865: "Gracias doy a Dios por Jesucristo Señor nuestro. Así que yo mismo con la mente sirvo a la ley de Dios; mas con la carne a la ley del pecado.",
        rv1602: "Gracias doy a Dios, por Jesús el Cristo Señor nuestro. Así que, yo mismo con la mente sirvo a la ley de Dios; mas con la carne a la ley del pecado.",
        rvg: "Doy gracias a Dios, por Jesucristo Señor nuestro. Así que, yo mismo con la mente sirvo a la ley de Dios, pero con la carne a la ley del pecado."
      }
    }
  ],
  notes: {
    "rom7-7": {
      title: "La ley revela, no produce, el pecado",
      author: "Nota de estudio",
      body: "Pablo distingue cuidadosamente entre la función diagnóstica de la ley y su naturaleza. La ley no es la causa del pecado, sino el instrumento que lo expone como tal — sin el mandamiento 'no codiciarás', la concupiscencia no se reconocería como transgresión, aunque existiera como inclinación. Pregunta clave: ¿asumimos aquí que Pablo culpa a la ley, cuando el texto explícitamente la absuelve ('en ninguna manera')?"
    },
    "rom7-14": {
      title: "Tensión presente vs. pasado en el verbo",
      author: "Nota de exégesis",
      body: "El cambio de tiempo verbal (de aoristo a presente) en este versículo marca el inicio de la sección más debatida del capítulo: ¿describe Pablo su experiencia presente como creyente, o recuerda su lucha previa a la conversión? Ambas lecturas tienen defensores serios en la historia de la interpretación; el texto mismo sostiene la tensión sin resolverla del todo."
    },
    "rom7-15": {
      title: "El conflicto de la voluntad dividida",
      author: "Nota de estudio",
      body: "Esta confesión no es retórica vacía. Describe una fractura real entre el querer y el hacer, central para entender la antropología paulina: el ser humano caído no carece de buenas intenciones, carece de la capacidad de ejecutarlas consistentemente por sus propias fuerzas."
    },
    "rom7-24": {
      title: "El clímax retórico antes de la resolución",
      author: "Nota de estudio",
      body: "El grito de miseria no es el final del argumento, sino su punto de quiebre necesario. Romanos 8:1 responde directamente a esta pregunta. Leer el capítulo 7 aislado del 8 distorsiona la intención del autor — la angustia tiene una resolución ya anunciada."
    }
  },
  dictionary: {
    "G4559": {
      term: "σαρκικός (sarkikós)",
      pronunciation: "sar-ki-kós",
      def: "Adjetivo: perteneciente o relativo a la carne; carnal, en el sentido de dominado por la naturaleza humana caída, no meramente 'físico'.",
      occurrences: "Usado 11 veces en el NT, principalmente por Pablo (Romanos, 1 Corintios)."
    }
  }
};

