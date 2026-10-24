# Glosario de contenido · español de México

Convenciones para el contenido aprobado; validar las definiciones contra el diccionario oficial al construir los datos. Los textos del juego y de HTML deben coincidir en significado.

| Término | Uso recomendado | Evitar |
| --- | --- | --- |
| CCPC | Conteos Censales de Participación Ciudadana del INE. Datos históricos, no biblioteca de software. | Confundirlos con preferencias políticas o resultados por partido. |
| LN | Registros de lista nominal del universo analizado. Mostrar su alcance y exclusiones. | Presentarlos como todas las personas del país. |
| SV | Registros con marca de voto, según el diccionario. | Afirmar por quién votó alguien. |
| NV | Registros sin marca de voto. | Confundirlos con votos nulos. |
| NS | Participación sin especificar / sin clasificación; conservar el nombre oficial en la ficha. | Llamarlo abstención, voto nulo, fraude o sumarlo a NV. |
| Registros clasificados | SV + NV; denominador de la tasa mostrada. | Incluir NS en ese denominador. |
| Tasa de participación | 100 × SV ÷ (SV + NV), con año, lugar y universo. | Mostrarla sin denominador o promediar tasas para combinar lugares. |
| Proporción sin clasificación | 100 × NS ÷ LN; panel separado. | Mezclarla con SV/(SV+NV) y NV/(SV+NV) en una sola composición del 100%. |
| Cantidad / porcentaje | Cantidad es un conteo; porcentaje es una relación con un denominador. | “Más registros” como sinónimo de “tasa mayor”. |
| Puntos porcentuales | Diferencia entre dos porcentajes comparables. | Llamar “por ciento de aumento” a una resta de tasas. |
| Sin datos clasificables | Mensaje cuando SV + NV = 0; valor nulo. | Convertir ausencia en 0%. |
| Dato real / fuente | Observación del conjunto validado, enlazada a fuente, versión y método. | Etiquetar una cifra sintética como dato del INE. |
| Ejemplo didáctico sintético | Valores inventados para practicar o probar una regla. | Atribuirlos a una entidad real. |
| Consulta ficticia | Escenario breve con reglas inventadas y límites visibles. | Presentarla como procedimiento electoral constitucional. |
| Boleta sin marcar | Acción permitida por la regla ficticia; suma una persona participante, ninguna opción. | Equipararla a NS o afirmar una regla jurídica real. |
| No participar en la consulta | Acción libre que permite completar la historia. | Penalizar, avergonzar o negar el final. |
| Empate | Estado ficticio explícito que requiere otra decisión. | Dar preferencia automática a la opción A. |
| Seguimiento / rendición de cuentas | Preguntar qué se hizo, con qué recursos y qué necesidades siguen pendientes. | Prometer que votar garantiza mejores servicios. |
| Exhibición de evidencias | Hallazgo, visualización accesible, cifras exactas, fuente, límite y pregunta. | Confundir el premio narrativo con un efecto real en participación. |
| Apoyo / intento independiente | Registrar por separado ayuda solicitada y respuesta sin ayuda. | Declarar dominio independiente por completar con pistas. |

Textos base: “Estos datos muestran registros de participación. No indican por quién votó cada persona.” “Sin clasificación no significa que la persona se haya abstenido.” “Más personas y un porcentaje mayor no son lo mismo.” “Tu opción no siempre gana. El seguimiento continúa después.”

Mantener año, unidad, geografía, denominador y fuente junto a cada hallazgo. No ordenar comunidades como mejores o peores ciudadanas. Las cifras se calculan desde `ccpc.json`; el formato numérico se aplica de forma consistente en ambas rutas, sin alterar los valores originales.
