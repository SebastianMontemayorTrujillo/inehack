# Glosario de contenido · español de México

**Equipo Latas · Entrega Godot · 31 de octubre de 2026.** Lenguaje para bachillerato (aproximadamente 15–18 años) y personas adultas principiantes. Las definiciones acompañan el contenido del juego y los materiales docentes. Referencias: [datos compartidos](../game/content/ccpc.json), [datos y créditos](datos_y_creditos_es.md) y [guía docente](facilitator.md).

## Palabras para la ruta principal

| Expresión | Explicación breve | Evitar |
| --- | --- | --- |
| CCPC | Conteos Censales de Participación Ciudadana del INE: aquí usamos datos históricos de la elección federal de 2024. | Suponer preferencias por partido o datos sobre este salón. |
| Registro | Una observación del archivo analizado; aquí se suman conteos de participación. | Llamar a las 9,773,730 filas «personas» o «votos». |
| Con participación registrada | Registros con marca de voto en el cuadernillo de lista nominal. | Afirmar por quién votó alguien. |
| Sin participación registrada | Registros sin marca de voto en ese cuadernillo. | Confundirlos con votos nulos o atribuir motivos. |
| Sin clasificación / No sabemos | Falta la clasificación de participación en el registro. | Decir «seguro no participó», fraude o voto nulo. |
| Con información conocida | Registros clasificados con o sin marca; deja fuera lo desconocido. | Entender «con información» como solo quienes participaron. |
| Cantidad / conteo | Cuántos registros hay en una categoría. | «Más registros» como sinónimo de «mayor proporción». |
| De cada 100 / porcentaje | Una forma de comparar proporciones. Siempre decir de qué grupo son esos 100. | «60 de cada 100 mexicanos» para la tasa clasificada nacional. |
| Hallazgo | Algo que podemos sostener con los datos y su fuente. | Convertir una comparación en explicación de sus causas. |
| Límite | Algo que el dato no nos permite saber. | Juzgar el valor cívico de una comunidad. |
| Fuente | De dónde viene la información y cómo revisarla. | Etiquetar cifras inventadas como datos del INE. |
| Ejemplo inventado | Tarjetas nuevas para practicar una idea; también llamado «sintético» en la ficha técnica. | Mezclar 60/30/10 o A:20/40 y B:60/200 con hallazgos reales. |
| Consulta ficticia | Una decisión inventada entre tres proyectos para la plaza. | Presentarla como elección oficial o encuesta al alumnado. |
| Boleta sin marcar | En esta ficción suma una persona participante y ninguna opción. | Equipararla con NS o afirmar que es una regla electoral general. |
| No participar | Acción disponible en la consulta que permite el mismo final. | Penalizar, avergonzar o negar el cierre. |
| Empate | Dos o más proyectos comparten el mayor conteo; hace falta otra decisión ficticia. | Dar preferencia automática a A. |
| Seguimiento | Preguntar qué se hizo con los recursos, cómo avanza y qué necesidades faltan. | Prometer que votar garantiza servicios o que una opción es más cívica. |
| Con apoyo / de manera independiente | Distinguir una respuesta tras recibir ayuda de una explicación sin ayuda. | Declarar dominio por completar con pistas. |
| Cartel propio / taller opcional | Elegir dos entidades, cantidad o proporción y una pregunta neutral para preparar un mensaje con datos CCPC. | Presentarlo como otra prueba obligatoria, una boleta o una preferencia política. |
| Vista previa | Mirar el hallazgo, sus valores y límites antes de llevar el cartel a la reunión; permite revisar la selección. | Un resultado educativo medido o una imagen sin fuente. |
| Llevar el cartel a Inés | Usar el cartel dentro de la misma sesión de la historia. | Prometer un archivo descargado, guardado entre sesiones o enviado a una institución. |

## Detalles disponibles, no requisitos para terminar

| Término técnico | Significado en `ccpc-2024-v1` |
| --- | --- |
| LN | Total de registros de lista nominal del universo analizado: SV + NV + NS. No es toda la población. |
| SV | Conteo con marca de voto. |
| NV | Conteo sin marca de voto. |
| NS | Participación sin especificar / sin clasificación. Se conserva separada. |
| Registros clasificados | SV + NV; base de la tasa de participación mostrada. |
| Denominador / base | Grupo con el que comparamos una cantidad; el número de abajo en una división. |
| Tasa clasificada | `100 × SV / (SV + NV)`. Nacional: 59.6700% redondeado a cuatro decimales. |
| Proporción sin clasificación | `100 × NS / LN`. Nacional: 6.4331% redondeado; base distinta de la tasa clasificada. |
| Tasa conjunta | Sumar los conteos antes de dividir. AGS + BC: `100 × 2,022,419 / 4,035,317 ≈ 50.12%`. |
| Puntos porcentuales | Diferencia entre porcentajes comparables, no porcentaje de aumento. |
| Sin datos clasificables | Falta una base clasificada válida; mostrar ausencia de dato, nunca inventar 0%. |

## Convenciones editoriales compartidas

Usar una idea por pregunta, verbos cotidianos y dos o tres opciones breves cuando sea posible. Metas internas: hasta 22 palabras por pregunta y 14 por opción, con excepciones justificadas para nombres y fuentes. No son umbrales oficiales ni una prueba de nivel lector. Explicar siglas en «Ver datos y fuente»; llevar fórmulas a «Ver cómo se calculó».

En el dato nacional, decir **«cerca de 60 de cada 100 registros con información conocida»**. Mostrar por separado **«cerca de 6 de cada 100 del total analizado no tienen clasificación»**. No formar una sola gráfica de 100% con medidas de bases distintas. Mantener año, lugar, base y fuente junto al hallazgo, con conteos exactos disponibles. Comas para miles y punto para decimales; redondear solo al mostrar, no al comparar.

La ruta esencial conserva `participation-reading`, `unknown`, `unknown-transfer`, `more-count`, `higher-rate` y `comparison-transfer`. Los ejemplos matemáticos `transfer1`/`transfer2` quedan opcionales y no sustituyen los dos casos conceptuales nuevos.

`poster_workshop` define el taller opcional y sus preguntas neutrales. «Cantidad» se refiere a SV; «proporción», a `100 × SV / (SV + NV)`, con las bases visibles. NS permanece aparte. El taller permite elegir dos de las 32 entidades disponibles, revisar el mensaje y llevarlo a Inés solo durante la sesión de Godot. No añade una respuesta correcta, no mide comprensión y no modifica resultados de consulta o reconocimiento. Los datos reales del cartel permanecen separados de los escenarios inventados de la reunión. La [verificación actual](verificacion_final_godot_es.md) delimita las comprobaciones técnicas realizadas.

Puente a la ficción: **«Los datos del INE nos hablan de la participación en 2024. Esta consulta es inventada para practicar cómo escuchar y tomar decisiones».** Las tres casas son Imprenta de Luz, Archivo de Mateo y Casa de reunión de Inés, en un solo pueblo: Villa Brisa. Los datos históricos no eligen un proyecto ni predicen la conducta de quienes se acercan a su primer voto.
