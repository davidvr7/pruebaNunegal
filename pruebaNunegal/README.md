Nunegal 

Proyecto en Angular orientado a mostrar, filtrar y detallar dispositivos móviles a partir de la API. El objetivo de esta fase fue llevar la aplicación a un estado listo para producción, cuidando la experiencia de uso, reforzando la arquitectura y documentando cada decisión para que el resultado refleje un trabajo hecho con rigor y atención al detalle.

---

## Visión general
- Catálogo dinámico con búsqueda reactiva, orden por precio o marca, métricas instantáneas y estados claros (carga, vacío y errores recuperables).
- Ficha técnica completa con especificaciones normalizadas, formularios accesibles, validaciones contextualizadas y alertas reutilizables.
- Sistema global de alertas (éxito, error, info) con autocierre configurable, cierre manual y ubicación fija en la interfaz para asegurar feedback constante.
- Arquitectura preparada para distintos entornos (`src/environments`), detección de cambios optimizada (`OnPush`) y servicios desacoplados del endpoint.
- Experiencia cuidada: componentes compartidos estilizados, skeletons de carga, CTA accesibles y navegación fluida.

---

## Arquitectura y patrones

1 Separar `environment.ts` / `environment.prod.ts` y usarlos en los servicios | Facilita cambiar la API sin tocar lógica y habilita pipelines multi‑stage  
2 Cacheo ligero en `CacheService` | Evita llamadas redundantes y conserva resultados con control de TTL | Menor latencia y menos carga sobre la API 
3 `OnPush` en componentes clave | Reduce chequeos y previene renders innecesarios | Rendimiento estable incluso con catálogos grandes  
4 `AlertService` + `AlertCenterComponent` | Centraliza feedback y evita duplicar lógica | Mensajes coherentes y fáciles de ampliar  
5 Formularios reactivos con validación | Simplifican reglas y muestran errores en contexto | Menos fricción y base sólida para futuras mejoras  

---

## Experiencia de catálogo
- Búsqueda enriquecida: `SearchComponent` con debounce, botón de limpiar, iconografía SVG y método `clear()` para sincronizar UI y estado.
- Ordenamientos configurables: enumeración tipada (`ProductSort`) vinculada a la UI; la lógica contempla precios ausentes para no romper la ordenación.
- Estadísticas inmediatas: total de modelos, marcas únicas y resultados activos; aportan feedback cuantitativo y ayudan a dimensionar el catálogo.
- Skeletons y estados vacíos: placeholders animados en carga; mensajes amigables y botón de reintento si no hay coincidencias o falla la API.

---

## Ficha técnica
- Lista `specificationFields` para evitar repetición y mantener orden consistente.
- Selectores de color y almacenamiento con validaciones y mensajes personalizados; el CTA sólo se habilita cuando la selección es válida.
- Botón “Añadir al carrito” con estados claros (`loading`, `success`, `error`) y alertas globales para confirmar o reintentar.
- Referencia del producto (`detail.id`) en la cabecera para facilitar soporte y pruebas.

---

## Componentes compartidos
- Header: breadcrumbs reactivos, contador de carrito con `BehaviorSubject`, diseño responsive.
- Product card: CTA accesible con `role="button"`, activación por teclado y chip de marca.
- Alert center: posición fija, estilos diferenciados y botón de cierre amigable.
- Search: input semántico (`type="search"`), botón de limpiar, `OnPush` y `FormControl` con `takeUntilDestroyed()` para suscripciones limpias.

---

## Calidad y tooling
- Linting (`npm run lint`) para mantener estilo y consistencia.
- Tests unitarios y de integración para asegurar estabilidad.
- Configuración de CI/CD con pipelines multi‑stage para despliegues controlados.
