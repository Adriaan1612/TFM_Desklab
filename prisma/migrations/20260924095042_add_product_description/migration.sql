-- AlterTable: add description as nullable, backfill, then NOT NULL.
ALTER TABLE "Product" ADD COLUMN "description" TEXT;

UPDATE "Product" SET "description" = 'Monitor de 27 pulgadas con imagen nítida y amplio espacio de trabajo. Ideal para concentrarse durante jornadas largas.' WHERE "slug" = 'monitor-27-4k';
UPDATE "Product" SET "description" = 'Monitor curvo de 32 pulgadas que envuelve tu campo de visión. Pensado para sesiones de juego inmersivas sin salir del escritorio.' WHERE "slug" = 'monitor-32-curvo';
UPDATE "Product" SET "description" = 'Monitor compacto de 24 pulgadas, equilibrado y sin distracciones. Una base honesta para trabajar y estudiar cada día.' WHERE "slug" = 'monitor-24-fhd';
UPDATE "Product" SET "description" = 'Monitor portátil de 15,6 pulgadas que amplía tu espacio donde sea. Ligero y fácil de guardar al terminar la jornada.' WHERE "slug" = 'monitor-portatil-156';
UPDATE "Product" SET "description" = 'Brazo articulado para un monitor que libera la superficie del escritorio. Ajuste sencillo para una postura cómoda todo el día.' WHERE "slug" = 'brazo-monitor-individual';
UPDATE "Product" SET "description" = 'Soporte doble para dos monitores alineados a la misma altura. Orden visual para configuraciones exigentes.' WHERE "slug" = 'soporte-dual';
UPDATE "Product" SET "description" = 'Base de madera que eleva el monitor y deja hueco debajo. Calidez natural para un escritorio sereno y recogido.' WHERE "slug" = 'base-madera-monitor';
UPDATE "Product" SET "description" = 'Teclado mecánico compacto al 75% con tacto preciso. Ocupa poco y responde bien tanto en trabajo como en juego.' WHERE "slug" = 'teclado-mecanico-75';
UPDATE "Product" SET "description" = 'Teclado blanco de líneas limpias que aclara cualquier escritorio. Escritura cómoda con una estética serena.' WHERE "slug" = 'teclado-minimal-blanco';
UPDATE "Product" SET "description" = 'Teclado dividido que respeta la posición natural de las manos. Diseñado para escribir muchas horas con calma.' WHERE "slug" = 'teclado-ergonomico';
UPDATE "Product" SET "description" = 'Teclado sin bloque numérico con retroiluminación RGB. Compacto, expresivo y siempre listo para jugar.' WHERE "slug" = 'teclado-rgb-tkl';
UPDATE "Product" SET "description" = 'Teclado 60% mínimo que deja sitio al ratón. Perfecto para escritorios pequeños sin renunciar al tacto mecánico.' WHERE "slug" = 'teclado-compacto-60';
UPDATE "Product" SET "description" = 'Ratón inalámbrico preciso y silencioso para el día a día. Se mueve libre, sin cables por en medio.' WHERE "slug" = 'raton-inalambrico';
UPDATE "Product" SET "description" = 'Ratón vertical que mantiene la muñeca en posición neutra. Alivio real para las jornadas largas de trabajo.' WHERE "slug" = 'raton-ergonomico-vertical';
UPDATE "Product" SET "description" = 'Ratón para jugar con respuesta rápida e iluminación RGB. Agarre seguro incluso en las partidas intensas.' WHERE "slug" = 'raton-gaming-rgb';
UPDATE "Product" SET "description" = 'Ratón simétrico, válido para diestros y zurdos. Un diseño sencillo y ligero que siempre está a mano.' WHERE "slug" = 'raton-simetrico';
UPDATE "Product" SET "description" = 'Alfombrilla de fieltro que delimita tu zona de trabajo. Textura agradable que abriga el escritorio.' WHERE "slug" = 'alfombrilla-fieltro';
UPDATE "Product" SET "description" = 'Alfombrilla extragrande en negro para teclado y ratón. Superficie uniforme con una presencia discreta.' WHERE "slug" = 'alfombrilla-xl-negra';
UPDATE "Product" SET "description" = 'Alfombrilla de corcho natural, cálida al tacto. Un detalle sostenible que ordena la mesa.' WHERE "slug" = 'alfombrilla-corcho';
UPDATE "Product" SET "description" = 'Lámpara de escritorio con luz cálida que cuida la vista. Ambiente tranquilo para trabajar de noche.' WHERE "slug" = 'lampara-escritorio-calida';
UPDATE "Product" SET "description" = 'Barra de luz que se apoya sobre el monitor e ilumina la mesa sin deslumbrar. Más luz, cero trastos.' WHERE "slug" = 'barra-luz-monitor';
UPDATE "Product" SET "description" = 'Tira LED de colores para perfilar el escritorio. Un toque de luz ambiental cuando cae la tarde.' WHERE "slug" = 'tira-led-rgb';
UPDATE "Product" SET "description" = 'Lámpara de pie con arco elegante que baña la zona de trabajo. Luz general con carácter escultórico.' WHERE "slug" = 'lampara-pie-arco';
UPDATE "Product" SET "description" = 'Bandeja para agrupar lo esencial y despejar la mesa de una vez. Cada cosa en su sitio y a la vista.' WHERE "slug" = 'bandeja-organizadora';
UPDATE "Product" SET "description" = 'Organizador de bambú que pone orden dentro de los cajones. Los pequeños objetos dejan de perderse.' WHERE "slug" = 'organizador-cajones-bambu';
UPDATE "Product" SET "description" = 'Soporte que cuelga los auriculares al alcance de la mano. Libera mesa y los mantiene protegidos.' WHERE "slug" = 'soporte-auriculares';
UPDATE "Product" SET "description" = 'Hub USB-C que multiplica las conexiones de tu portátil. Un solo cable para tenerlo todo a mano.' WHERE "slug" = 'hub-usb-c';
UPDATE "Product" SET "description" = 'Mini planta que pone un punto verde en el escritorio. Pide pocos cuidados y alegra la jornada entera.' WHERE "slug" = 'mini-planta';
UPDATE "Product" SET "description" = 'Póster abstracto en tonos suaves para vestir la pared. Arte tranquilo que completa el rincón.' WHERE "slug" = 'poster-abstracto';
UPDATE "Product" SET "description" = 'Figura tallada en madera, pequeña y expresiva. Un objeto con alma para personalizar tu espacio.' WHERE "slug" = 'figura-madera';
UPDATE "Product" SET "description" = 'Panel hexagonal que viste la pared y matiza el eco. Útil para llamadas y directos con mejor sonido.' WHERE "slug" = 'panel-acustico-hex';
UPDATE "Product" SET "description" = 'Reloj de diseño mínimo que se lee de un vistazo. La hora, sin pantallas ni distracciones.' WHERE "slug" = 'reloj-minimal';

ALTER TABLE "Product" ALTER COLUMN "description" SET NOT NULL;
