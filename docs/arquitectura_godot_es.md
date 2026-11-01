# Arquitectura de la entrega Godot

31 de octubre de 2026. El mismo proyecto se distribuye para navegador y Linux x86_64. Las páginas HTML del export son el arranque del motor; no contienen otra implementación de las actividades.

`game/scripts/main.gd` mantiene sesión, progreso, paneles, sala y foco. `room.gd` configura plaza e interiores; el movimiento WASD cruza las puertas. Una sola selección cercana gobierna indicación E, botón y activación. Personajes y objetos tienen acciones separadas; la prensa final no inicia la actividad de Luz.

`civic_rules.gd` aplica reglas explícitas al contenido de `game/content/story.json` y `ccpc.json`. Se conservan seis actividades conceptuales, las dos misiones CCPC, la consulta ficticia y la progresión Luz → Mateo → Inés. Las casas abren desde el principio y las tareas respetan sus requisitos.

`poster_workshop.gd`, `poster_view.gd` y `poster_card.gd` componen y presentan el cartel. `campaign_view.gd` gestiona encargo y prensa; `ending_view.gd` controla la revelación omitible y los controles fijos de FIN. `campaign_pdf.gd` produce el PDF vectorial con fuentes incrustadas mediante `campaign_layout.json` y `campaign_font.json`. En navegador se solicita una descarga; en Linux se usa el diálogo de archivos.

El guardado Godot conserva su esquema 2: progreso y ajustes permitidos, incluido `campaign_printed`. Elección, resultados que la revelen, borrador, publicación, encargo y PDF permanecen en memoria. No hay cuentas, servidor de aplicación ni sincronización de preferencias.

`tools/export_game.py` prepara los recursos originales, utiliza la página de arranque en español y limpia restos de la antigua aplicación alternativa. `build/web/` contiene entrada, motor/paquete en `game/`, guía y licencias. `JUGAR.py` sirve solo esa carpeta en localhost. `JUGAR_LINUX.sh` conserva el ejecutable con su PCK.

Las pruebas de Python revisan datos, recursos, fuentes y entrega; GUT revisa el comportamiento del juego. Los recorridos reales de Linux y canvas complementan las cinco decisiones del PCK compilado. El arnés web puede grabar la sesión sin modificar el juego; el video final identifica sus cortes. El comprobador del ZIP usa herramientas de revisión del entorno de desarrollo y ejecuta los exports extraídos.

La antigua ruta narrativa HTML y sus pruebas se conservan en el repositorio como antecedentes y no se incluyen en la entrega ni se cuentan como evidencia del acceso al canvas. La verificación actual está en `verificacion_final_godot_es.md`.
