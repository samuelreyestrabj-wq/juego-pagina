/* =========================================================
   SALTA POR LA DISCIPLINA DEPORTIVA  ·  Phaser 3
   ---------------------------------------------------------
   Imágenes (carpeta img/):
     img/fondo.png       -> fondo del nivel
     img/plataforma.png  -> textura de las plataformas y el piso
     img/personaje.png   -> personaje (opcional)
     img/moneda.png      -> moneda (opcional)
   Si alguna imagen no existe, el juego dibuja una versión
   propia para que siempre funcione.
   ========================================================= */

const ANCHO = 600;            // ancho de la pantalla de juego
const ALTO = 900;             // alto de la pantalla de juego
const MUNDO_ALTO = 4600;      // altura total del nivel (hacia arriba)
const PISO_Y = MUNDO_ALTO - 60;
const VELOCIDAD = 280;
const SALTO = 640;            // fuerza del salto
const AUTO_SALTO = true;      // true = rebota solo al tocar plataforma (tipo Doodle Jump)
                              // false = salta con ↑ / ESPACIO

/* ---------- Las 10 ventanas de información ---------- */
const INFO = [
  {
    icono: '🏅',
    titulo: '¿Qué es la disciplina deportiva?',
    texto: 'Es la capacidad de cumplir normas, hábitos y un plan de entrenamiento de forma constante, incluso cuando no tienes ganas. Es la base de cualquier deportista que quiere mejorar.',
    consejo: '💡 La motivación te hace empezar; la disciplina te hace continuar.'
  },
  {
    icono: '📅',
    titulo: 'Constancia',
    texto: 'Los resultados en el deporte llegan por la repetición. Entrenar con regularidad permite que el cuerpo se adapte y que la técnica mejore poco a poco.',
    consejo: '💡 Es mejor entrenar 30 minutos cuatro veces por semana que tres horas un solo día.'
  },
  {
    icono: '⏰',
    titulo: 'Puntualidad y responsabilidad',
    texto: 'Llegar a tiempo, traer tu uniforme e implementos y cumplir lo que acordaste con tu entrenador y tu equipo demuestra compromiso y respeto por los demás.',
    consejo: '💡 Prepara tu maleta deportiva la noche anterior.'
  },
  {
    icono: '📋',
    titulo: 'Entrenamiento planificado',
    texto: 'Una buena sesión tiene tres partes: calentamiento, parte principal y vuelta a la calma. Seguir un plan evita lesiones y ayuda a progresar con orden.',
    consejo: '💡 Calienta entre 10 y 15 minutos antes de cualquier esfuerzo intenso.'
  },
  {
    icono: '🥗',
    titulo: 'Alimentación e hidratación',
    texto: 'El cuerpo de un deportista necesita energía de calidad: frutas, verduras, cereales, proteínas y mucha agua. Comer bien también es parte del entrenamiento.',
    consejo: '💡 Hidrátate antes, durante y después de entrenar, no solo cuando sientas sed.'
  },
  {
    icono: '😴',
    titulo: 'Descanso y recuperación',
    texto: 'Los músculos se reparan y se fortalecen mientras descansas. Dormir bien mejora la concentración, el rendimiento y reduce el riesgo de lesiones.',
    consejo: '💡 Los adolescentes necesitan dormir entre 8 y 10 horas cada noche.'
  },
  {
    icono: '🤝',
    titulo: 'Respeto y juego limpio',
    texto: 'El juego limpio (fair play) significa respetar las reglas, al árbitro, a tus compañeros y a los rivales. Ganar haciendo trampa no es ganar.',
    consejo: '💡 Saluda al rival al final del partido, sin importar el resultado.'
  },
  {
    icono: '👥',
    titulo: 'Trabajo en equipo',
    texto: 'En el deporte cada persona cumple un rol. Comunicarse, apoyarse y poner el objetivo del grupo por encima del lucimiento personal hace fuerte a un equipo.',
    consejo: '💡 Anima a tus compañeros, sobre todo cuando se equivocan.'
  },
  {
    icono: '🧠',
    titulo: 'Control emocional y resiliencia',
    texto: 'Perder, equivocarse o lesionarse es parte del camino. Un deportista disciplinado controla su frustración, aprende de los errores y vuelve a intentarlo.',
    consejo: '💡 Después de un error, respira profundo y enfócate en la siguiente jugada.'
  },
  {
    icono: '🎯',
    titulo: '¡Lo lograste! Metas y superación',
    texto: 'Ponte metas claras, medibles y alcanzables, y revisa tu progreso. Recogiste las 10 monedas: estos son los pilares de la disciplina deportiva:',
    consejo: '',
    resumen: [
      '🏅 Disciplina', '📅 Constancia', '⏰ Puntualidad',
      '📋 Planificación', '🥗 Alimentación', '😴 Descanso',
      '🤝 Juego limpio', '👥 Trabajo en equipo',
      '🧠 Control emocional', '🎯 Metas claras'
    ]
  }
];

/* ---------- Diseño del nivel (vertical) ----------
   Se genera una escalera de plataformas desde el piso hasta la cima.
   Cada plataforma queda a una distancia alcanzable de la anterior. */
const SEPARACION = 125;   // distancia vertical entre plataformas

function generarPlataformas() {
  const lista = [];
  let centroAnterior = ANCHO / 2;
  for (let y = PISO_Y - SEPARACION; y > 220; y -= SEPARACION) {
    const w = Phaser.Math.Between(110, 170);
    let centro = centroAnterior + Phaser.Math.Between(-210, 210);
    centro = Phaser.Math.Clamp(centro, w / 2 + 10, ANCHO - w / 2 - 10);
    lista.push({ x: centro - w / 2, y, w, moneda: false });
    centroAnterior = centro;
  }
  // Plataforma de la cima (ancha, con la meta)
  lista.push({ x: ANCHO / 2 - 110, y: 160, w: 220, moneda: false, cima: true });

  // Repartir 10 monedas de forma pareja; la última va en la cima
  const n = lista.length;
  for (let i = 0; i < INFO.length; i++) {
    lista[Math.round(((i + 1) * n) / INFO.length) - 1].moneda = true;
  }
  return lista;
}

/* ---------- Estado compartido ---------- */
const tactil = { left: false, right: false, saltoPedido: false };

/* =========================================================
   ESCENA PRINCIPAL
   ========================================================= */
class Juego extends Phaser.Scene {
  constructor() {
    super('Juego');
  }

  preload() {
    // Si falta una imagen, se dibuja por código
    // Conectar la barra de la pantalla de carga
    this.load.on('progress', (v) => { carga.real = v; });
    this.load.on('complete', () => { carga.real = 1; carga.listo = true; });

    this.load.on('loaderror', (archivo) => {
      console.info('Imagen no encontrada, se usará la versión dibujada:', archivo.src);
    });
    this.load.image('fondo', 'img/fondo.png');
    this.load.image('plataforma', 'img/plataforma.png');
    this.load.image('personaje', 'img/personaje.png');
    // Hoja de sprites: 4 cuadros de 96x128 (quieto, paso 1, paso 2, salto)
    this.load.spritesheet('sprite', 'img/sprite.png', { frameWidth: 96, frameHeight: 128 });
    this.load.image('moneda', 'img/moneda.png');
  }

  create() {
    this.recogidas = 0;
    // El juego queda en pausa hasta pulsar "¡A jugar!"
    this.modalAbierto = !juegoIniciado;

    crearTexturasFaltantes(this);

    /* --- Fondo --- */
    this.crearFondo();

    /* --- Mundo y cámara (el nivel crece hacia arriba) --- */
    this.physics.world.setBounds(0, 0, ANCHO, MUNDO_ALTO);
    this.cameras.main.setBounds(0, 0, ANCHO, MUNDO_ALTO);

    /* --- Piso, gradas y plataformas --- */
    this.add.image(ANCHO / 2, PISO_Y, 'gradas').setOrigin(0.5, 1);

    this.suelos = this.physics.add.staticGroup();
    const altoTextura = this.textures.get('plataforma').getSourceImage().height;
    this.escalaPlat = 28 / altoTextura;

    this.crearBloque(0, PISO_Y, ANCHO, 60, false);
    const plataformas = generarPlataformas();
    plataformas.forEach(p => this.crearBloque(p.x, p.y, p.w, 28, true));

    /* --- Meta en la cima --- */
    const cima = plataformas[plataformas.length - 1];
    this.dibujarMeta(cima.x + cima.w - 30, cima.y);

    /* --- Monedas --- */
    this.monedas = this.physics.add.group({ allowGravity: false, immovable: true });
    plataformas.filter(p => p.moneda).forEach((p, i) => {
      const m = this.monedas.create(p.x + p.w / 2, p.y - 48, 'moneda');
      if (this.monedaPropia) m.setDisplaySize(36, 36);
      m.body.setCircle(m.width / 2);
      const escalaX = m.scaleX;
      this.tweens.add({ targets: m, scaleX: escalaX * 0.15, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 90 });
      this.tweens.add({ targets: m, y: m.y - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    /* --- Personaje --- */
    // Prioridad: img/sprite.png (animado) > img/personaje.png (imagen fija) > atleta dibujado
    this.modoPersonaje = this.spritePropio ? 'sprite' : (this.personajePropio ? 'imagen' : 'dibujado');

    if (this.modoPersonaje === 'sprite') {
      this.jugador = this.physics.add.sprite(ANCHO / 2, PISO_Y - 60, 'sprite', 0);
      this.jugador.setScale(74 / this.jugador.height);
      this.jugador.body.setSize(this.jugador.width * 0.5, this.jugador.height * 0.875);
      this.jugador.body.setOffset(this.jugador.width * 0.25, this.jugador.height * 0.125);
      if (!this.anims.exists('correr')) {
        this.anims.create({
          key: 'correr',
          frames: this.anims.generateFrameNumbers('sprite', { frames: [1, 0, 2, 0] }),
          frameRate: 10,
          repeat: -1
        });
      }
    } else if (this.modoPersonaje === 'imagen') {
      this.jugador = this.physics.add.sprite(ANCHO / 2, PISO_Y - 60, 'personaje');
      this.jugador.setScale(74 / this.jugador.height);
      this.jugador.body.setSize(this.jugador.width * 0.55, this.jugador.height * 0.92);
      this.jugador.body.setOffset(this.jugador.width * 0.225, this.jugador.height * 0.08);
    } else {
      this.jugador = this.physics.add.sprite(ANCHO / 2, PISO_Y - 60, 'atleta_0');
      this.jugador.setScale(1.15);
      this.jugador.body.setSize(24, 56).setOffset(12, 8);
      if (!this.anims.exists('correr')) {
        this.anims.create({
          key: 'correr',
          frames: [{ key: 'atleta_1' }, { key: 'atleta_0' }, { key: 'atleta_2' }, { key: 'atleta_0' }],
          frameRate: 10,
          repeat: -1
        });
      }
    }
    this.jugador.setDepth(5);
    this.jugador.body.setMaxVelocityY(900);

    this.physics.add.collider(this.jugador, this.suelos);
    this.physics.add.overlap(this.jugador, this.monedas, this.recogerMoneda, null, this);

    this.cameras.main.startFollow(this.jugador, true, 0.15, 0.12);
    this.cameras.main.setDeadzone(ANCHO, 200);

    /* --- Teclado --- */
    this.teclas = this.input.keyboard.createCursorKeys();
    this.teclaW = this.input.keyboard.addKey('W');
    this.teclaA = this.input.keyboard.addKey('A');
    this.teclaD = this.input.keyboard.addKey('D');

    actualizarContador(0);
    actualizarAltura(0);
    if (!juegoIniciado) this.physics.pause();
  }

  crearFondo() {
    if (this.fondoPropio) {
      // Tu imagen se ajusta al ancho y se repite hacia arriba (parallax)
      const img = this.textures.get('fondo').getSourceImage();
      this.escalaFondo = ANCHO / img.width;
      this.fondo = this.add.tileSprite(0, 0, ANCHO, ALTO, 'fondo')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setTileScale(this.escalaFondo);
    } else {
      // Cielo que cambia de color con la altura + nubes en parallax
      this.cielo = this.add.graphics().setScrollFactor(0);
      this.fondo = this.add.tileSprite(0, 0, ANCHO, ALTO, 'fondo')
        .setOrigin(0, 0)
        .setScrollFactor(0);
    }
  }

  actualizarFondo() {
    const cam = this.cameras.main;
    const maxScroll = MUNDO_ALTO - ALTO;
    const progreso = 1 - Phaser.Math.Clamp(cam.scrollY / maxScroll, 0, 1); // 0 abajo, 1 arriba

    if (this.fondoPropio) {
      this.fondo.tilePositionY = (cam.scrollY * 0.4) / this.escalaFondo;
    } else {
      this.fondo.tilePositionY = cam.scrollY * 0.35;
      // De azul claro (abajo) a azul noche (arriba)
      const abajo = Phaser.Display.Color.ValueToColor(0x7dd3fc);
      const arriba = Phaser.Display.Color.ValueToColor(0x1e1b4b);
      const c1 = Phaser.Display.Color.Interpolate.ColorWithColor(abajo, arriba, 100, progreso * 100);
      const c2 = Phaser.Display.Color.Interpolate.ColorWithColor(abajo, arriba, 100, Math.min(100, progreso * 100 + 25));
      const color = (c) => Phaser.Display.Color.GetColor(c.r, c.g, c.b);
      this.cielo.clear();
      this.cielo.fillGradientStyle(color(c2), color(c2), color(c1), color(c1), 1);
      this.cielo.fillRect(0, 0, ANCHO, ALTO);
    }
  }

  crearBloque(x, y, w, h, soloDesdeArriba) {
    const bloque = this.add.tileSprite(x, y, w, h, 'plataforma').setOrigin(0, 0);
    bloque.setTileScale(this.escalaPlat);
    this.physics.add.existing(bloque, true);
    if (soloDesdeArriba) {
      // Se puede atravesar desde abajo y aterrizar encima
      bloque.body.checkCollision.down = false;
      bloque.body.checkCollision.left = false;
      bloque.body.checkCollision.right = false;
    }
    this.suelos.add(bloque);
  }

  dibujarMeta(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0xe2e8f0).fillRect(x, y - 110, 6, 110);
    g.fillStyle(0xf5c518).fillCircle(x + 3, y - 114, 7);
    for (let f = 0; f < 3; f++) {
      for (let c = 0; c < 5; c++) {
        g.fillStyle((f + c) % 2 ? 0x111827 : 0xffffff);
        g.fillRect(x - 50 + c * 10, y - 106 + f * 10, 10, 10);
      }
    }
  }

  recogerMoneda(jugador, moneda) {
    if (this.modalAbierto) return;
    moneda.body.enable = false;
    this.tweens.killTweensOf(moneda);
    this.tweens.add({
      targets: moneda,
      y: moneda.y - 60,
      alpha: 0,
      scale: moneda.scale * 1.6,
      duration: 350,
      onComplete: () => moneda.destroy()
    });

    this.recogidas++;
    actualizarContador(this.recogidas);

    this.modalAbierto = true;
    this.physics.pause();
    this.jugador.anims.stop();

    mostrarModal(this.recogidas - 1, () => {
      if (this.recogidas >= INFO.length) {
        this.scene.restart();
      } else {
        this.modalAbierto = false;
        this.physics.resume();
      }
    });
  }

  update() {
    this.actualizarFondo();
    if (this.modalAbierto) return;

    const j = this.jugador;
    const enSuelo = j.body.blocked.down || j.body.touching.down;
    const izq = this.teclas.left.isDown || this.teclaA.isDown || tactil.left;
    const der = this.teclas.right.isDown || this.teclaD.isDown || tactil.right;
    const saltar =
      Phaser.Input.Keyboard.JustDown(this.teclas.up) ||
      Phaser.Input.Keyboard.JustDown(this.teclas.space) ||
      Phaser.Input.Keyboard.JustDown(this.teclaW) ||
      tactil.saltoPedido;
    tactil.saltoPedido = false;

    if (izq) {
      j.setVelocityX(-VELOCIDAD);
      j.setFlipX(true);
    } else if (der) {
      j.setVelocityX(VELOCIDAD);
      j.setFlipX(false);
    } else {
      j.setVelocityX(j.body.velocity.x * 0.85); // frena suave
    }

    // Salto: automático al tocar una plataforma o con tecla
    if (enSuelo && (AUTO_SALTO || saltar)) {
      j.setVelocityY(-SALTO);
      this.rebote();
    }

    // Atravesar los bordes laterales: sale por un lado y entra por el otro
    if (j.x < -20) j.x = ANCHO + 20;
    else if (j.x > ANCHO + 20) j.x = -20;

    // Animaciones (sprite.png o atleta dibujado)
    if (this.modoPersonaje !== 'imagen') {
      if (!enSuelo) {
        j.anims.stop();
        this.pose(j.body.velocity.y < 0 ? 3 : 1);   // subiendo: salto · bajando: paso
      } else if (izq || der) {
        j.anims.play('correr', true);
      } else {
        j.anims.stop();
        this.pose(0);
      }
    }

    actualizarAltura(Math.max(0, Math.round((PISO_Y - j.body.bottom) / 40)));
  }

  // Cambia el cuadro del personaje: 0 quieto, 1 paso 1, 2 paso 2, 3 salto
  pose(n) {
    if (this.modoPersonaje === 'sprite') this.jugador.setFrame(n);
    else this.jugador.setTexture('atleta_' + n);
  }

  rebote() {
    // Pequeño efecto de "aplastarse" al impulsarse
    const sx = this.jugador.scaleX, sy = this.jugador.scaleY;
    this.tweens.add({
      targets: this.jugador,
      scaleX: sx * 1.15,
      scaleY: sy * 0.85,
      duration: 70,
      yoyo: true,
      onComplete: () => this.jugador.setScale(sx, sy)
    });
  }
}

/* =========================================================
   TEXTURAS DIBUJADAS POR CÓDIGO (si faltan las imágenes)
   ========================================================= */
function crearTexturasFaltantes(escena) {
  const T = escena.textures;
  escena.personajePropio = T.exists('personaje');
  escena.spritePropio = T.exists('sprite');
  escena.monedaPropia = T.exists('moneda');
  escena.fondoPropio = T.exists('fondo');

  if (!T.exists('fondo')) dibujarFondo(T);
  if (!T.exists('gradas')) dibujarGradas(T);
  if (!T.exists('plataforma')) dibujarPlataforma(T);
  if (!T.exists('moneda')) dibujarMoneda(T);
  if (!T.exists('atleta_0')) {
    ['quieto', 'paso1', 'paso2', 'salto'].forEach((pose, i) => dibujarAtleta(T, 'atleta_' + i, pose));
  }
}

/* Nubes transparentes que se repiten hacia arriba (el color del cielo lo pone la escena) */
function dibujarFondo(T) {
  const tex = T.createCanvas('fondo', ANCHO, ALTO);
  const c = tex.getContext();
  const nube = (x, y, s, a) => {
    c.fillStyle = `rgba(255,255,255,${a})`;
    [[0, 0, 26], [28, -12, 32], [60, 0, 26], [30, 8, 26]].forEach(([dx, dy, r]) => {
      c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); c.fill();
    });
  };
  nube(60, 120, 1, 0.85);
  nube(380, 300, 0.8, 0.7);
  nube(150, 520, 0.7, 0.75);
  nube(430, 700, 1.1, 0.85);
  nube(40, 820, 0.6, 0.6);
  // Estrellitas (se notan cuando el cielo oscurece)
  c.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % ANCHO, y = (i * 241) % ALTO;
    c.fillRect(x, y, 2, 2);
  }
  tex.refresh();
}

/* Gradas de un estadio en la base del nivel */
function dibujarGradas(T) {
  const tex = T.createCanvas('gradas', ANCHO, 170);
  const c = tex.getContext();
  c.fillStyle = '#1e3a8a';
  c.fillRect(0, 20, ANCHO, 150);
  for (let fila = 0; fila < 6; fila++) {
    c.fillStyle = fila % 2 ? '#1d4ed8' : '#2563eb';
    c.fillRect(0, 30 + fila * 22, ANCHO, 14);
    for (let x = 6 + (fila % 2) * 10; x < ANCHO; x += 20) {
      const colores = ['#f87171', '#facc15', '#fb923c', '#ffffff', '#a3e635'];
      c.fillStyle = colores[(x / 20 + fila) % colores.length | 0];
      c.beginPath(); c.arc(x, 26 + fila * 22, 5, 0, Math.PI * 2); c.fill();
    }
  }
  // Techo
  c.fillStyle = '#e2e8f0';
  c.fillRect(0, 12, ANCHO, 10);
  tex.refresh();
}

function dibujarPlataforma(T) {
  const tex = T.createCanvas('plataforma', 64, 32);
  const c = tex.getContext();
  // Tierra
  c.fillStyle = '#92400e';
  c.fillRect(0, 0, 64, 32);
  c.fillStyle = '#78350f';
  [[8, 18], [30, 24], [48, 16], [20, 28], [56, 27]].forEach(([x, y]) => c.fillRect(x, y, 5, 3));
  // Pasto (línea blanca tipo cancha)
  c.fillStyle = '#16a34a';
  c.fillRect(0, 0, 64, 11);
  c.fillStyle = '#22c55e';
  for (let x = 0; x < 64; x += 8) {
    c.beginPath(); c.moveTo(x, 11); c.lineTo(x + 4, 15); c.lineTo(x + 8, 11); c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.fillRect(0, 2, 64, 2);
  tex.refresh();
}

function dibujarMoneda(T) {
  const tex = T.createCanvas('moneda', 36, 36);
  const c = tex.getContext();
  const g = c.createRadialGradient(13, 12, 3, 18, 18, 18);
  g.addColorStop(0, '#fff6b0');
  g.addColorStop(0.5, '#f5c518');
  g.addColorStop(1, '#c99700');
  c.fillStyle = g;
  c.beginPath(); c.arc(18, 18, 17, 0, Math.PI * 2); c.fill();
  c.lineWidth = 2;
  c.strokeStyle = '#a87e00';
  c.stroke();
  // Estrella
  c.fillStyle = '#b45309';
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 4 : 9;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    c.lineTo(18 + r * Math.cos(a), 18 + r * Math.sin(a));
  }
  c.closePath();
  c.fill();
  tex.refresh();
}

/* Atleta: camiseta azul con el número 10, short blanco, tenis rojos y cinta en la cabeza */
function dibujarAtleta(T, clave, pose) {
  const tex = T.createCanvas(clave, 48, 64);
  const c = tex.getContext();
  const PIEL = '#e0a878';

  const poses = {
    quieto: { pies: [[19, 59], [29, 59]], manos: [[13, 40], [35, 40]] },
    paso1:  { pies: [[11, 58], [34, 59]], manos: [[30, 37], [12, 35]] },
    paso2:  { pies: [[30, 59], [16, 58]], manos: [[11, 37], [36, 35]] },
    salto:  { pies: [[13, 55], [33, 51]], manos: [[8, 18], [40, 18]] }
  };
  const p = poses[pose];

  c.lineCap = 'round';

  // Piernas
  c.strokeStyle = PIEL;
  c.lineWidth = 6;
  [[19, 47], [29, 47]].forEach(([hx, hy], i) => {
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(p.pies[i][0], p.pies[i][1] - 2); c.stroke();
  });
  // Medias
  c.strokeStyle = '#ffffff';
  c.lineWidth = 6;
  p.pies.forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y - 3); c.stroke(); });
  // Tenis
  c.fillStyle = '#dc2626';
  p.pies.forEach(([x, y]) => {
    c.beginPath(); c.ellipse(x + 2, y + 1, 6, 3.5, 0, 0, Math.PI * 2); c.fill();
  });
  c.fillStyle = '#ffffff';
  p.pies.forEach(([x, y]) => c.fillRect(x - 3, y + 3, 10, 1.5));

  // Short
  c.fillStyle = '#f8fafc';
  c.fillRect(15, 40, 18, 9);
  c.fillStyle = '#1d4ed8';
  c.fillRect(15, 40, 2, 9);
  c.fillRect(31, 40, 2, 9);

  // Camiseta
  c.fillStyle = '#1d4ed8';
  roundRect(c, 14, 21, 20, 21, 4);
  c.fillStyle = '#f5c518';
  c.fillRect(14, 21, 20, 2);
  c.fillStyle = '#ffffff';
  c.font = 'bold 10px Arial';
  c.textAlign = 'center';
  c.fillText('10', 24, 36);

  // Brazos
  c.strokeStyle = PIEL;
  c.lineWidth = 5;
  [[16, 25], [32, 25]].forEach(([sx, sy], i) => {
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(p.manos[i][0], p.manos[i][1]); c.stroke();
  });
  // Mangas
  c.strokeStyle = '#1d4ed8';
  c.lineWidth = 6;
  [[16, 25], [32, 25]].forEach(([sx, sy], i) => {
    const dx = p.manos[i][0] - sx, dy = p.manos[i][1] - sy;
    const l = Math.hypot(dx, dy);
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (dx / l) * 5, sy + (dy / l) * 5); c.stroke();
  });

  // Cuello y cabeza
  c.fillStyle = PIEL;
  c.fillRect(21, 18, 6, 4);
  c.beginPath(); c.arc(24, 12, 9, 0, Math.PI * 2); c.fill();
  // Cabello
  c.fillStyle = '#3b2314';
  c.beginPath(); c.arc(24, 10, 9, Math.PI, Math.PI * 2); c.fill();
  c.fillRect(15, 8, 4, 6);
  // Cinta deportiva
  c.fillStyle = '#dc2626';
  c.fillRect(15, 7, 18, 3);
  c.beginPath(); c.moveTo(15, 8); c.lineTo(10, 6); c.lineTo(11, 11); c.closePath(); c.fill();
  // Cara (mirando a la derecha)
  c.fillStyle = '#111827';
  c.beginPath(); c.arc(28, 13, 1.4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#7c2d12';
  c.lineWidth = 1.2;
  c.beginPath(); c.arc(28, 16, 2.5, 0.2, Math.PI - 0.6); c.stroke();
  // Oreja
  c.fillStyle = '#c98d5f';
  c.beginPath(); c.arc(21, 13, 1.8, 0, Math.PI * 2); c.fill();

  tex.refresh();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  c.fill();
}

/* =========================================================
   HUD Y VENTANA MODAL (HTML)
   ========================================================= */
function actualizarAltura(m) {
  const el = document.getElementById('altura');
  if (el) el.textContent = `${m} m`;
}

function actualizarContador(n) {
  const marcador = document.querySelector('.marcador');
  document.getElementById('contador').textContent = `${n} / ${INFO.length}`;
  marcador.classList.remove('pulso');
  void marcador.offsetWidth; // reinicia la animación
  if (n > 0) marcador.classList.add('pulso');
}

/* =========================================================
   PANTALLA DE CARGA E INSTRUCCIONES
   ========================================================= */
let juegoIniciado = false;
const carga = { real: 0, listo: false, inicio: performance.now() };
const DURACION_MINIMA_CARGA = 2200; // ms: así la animación siempre se alcanza a ver
const FRASES_CARGA = [
  'Atando los tenis…',
  'Calentando motores…',
  'Estirando los músculos…',
  'Preparando las plataformas…',
  'Puliendo las monedas…',
  '¡Listo para saltar!'
];

function animarCarga() {
  const tiempo = Math.min(1, (performance.now() - carga.inicio) / DURACION_MINIMA_CARGA);
  const progreso = Math.min(carga.real, tiempo);
  const pct = Math.round(progreso * 100);

  document.getElementById('barra-progreso').style.width = pct + '%';
  document.querySelector('.barra').setAttribute('aria-valuenow', pct);
  const frase = FRASES_CARGA[Math.min(FRASES_CARGA.length - 1, Math.floor(progreso * (FRASES_CARGA.length - 1)))];
  document.getElementById('carga-texto').textContent = `${frase} ${pct}%`;

  if (progreso >= 1 && carga.listo) {
    setTimeout(() => {
      document.getElementById('pantalla-carga').classList.add('oculta');
      abrirInstrucciones();
    }, 350);
  } else {
    requestAnimationFrame(animarCarga);
  }
}
requestAnimationFrame(animarCarga);

function instruccionesVisibles() {
  return document.getElementById('instrucciones').classList.contains('visible');
}

function abrirInstrucciones() {
  const escena = window.juego && juego.scene.keys.Juego;
  // Si se abre durante la partida, pausar el juego
  if (juegoIniciado) {
    if (!escena || escena.modalAbierto) return; // ya hay otra ventana abierta
    escena.modalAbierto = true;
    escena.physics.pause();
    escena.jugador.anims.stop();
  }
  document.getElementById('btn-comenzar').textContent = juegoIniciado ? 'Continuar ▶' : '¡A jugar! ▶';
  const v = document.getElementById('instrucciones');
  v.classList.add('visible');
  v.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('btn-comenzar').focus(), 50);
}

function cerrarInstrucciones() {
  if (!instruccionesVisibles()) return;
  const v = document.getElementById('instrucciones');
  v.classList.remove('visible');
  v.setAttribute('aria-hidden', 'true');
  document.activeElement && document.activeElement.blur();

  juegoIniciado = true;
  const escena = juego.scene.keys.Juego;
  if (escena) {
    escena.modalAbierto = false;
    escena.physics.resume();
  }
}

document.getElementById('btn-comenzar').addEventListener('click', cerrarInstrucciones);
document.getElementById('btn-ayuda').addEventListener('click', (e) => {
  e.currentTarget.blur();
  abrirInstrucciones();
});
if (!AUTO_SALTO) {
  document.getElementById('texto-salto').innerHTML = 'Salta con <kbd>↑</kbd>, <kbd>W</kbd> o <kbd>ESPACIO</kbd>.';
}

let alCerrarModal = null;

function mostrarModal(indice, alCerrar) {
  const datos = INFO[indice];
  const esFinal = indice === INFO.length - 1;

  document.getElementById('modal-numero').textContent = `${indice + 1} / ${INFO.length}`;
  document.getElementById('modal-icono').textContent = datos.icono;
  document.getElementById('modal-titulo').textContent = datos.titulo;
  document.getElementById('modal-texto').textContent = datos.texto;
  document.getElementById('modal-consejo').textContent = datos.consejo || '';

  const lista = document.getElementById('modal-lista');
  lista.innerHTML = '';
  (datos.resumen || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    lista.appendChild(li);
  });

  const boton = document.getElementById('modal-boton');
  boton.textContent = esFinal ? '🔄 Jugar de nuevo' : 'Continuar ▶';

  alCerrarModal = alCerrar;
  const modal = document.getElementById('modal');
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => boton.focus(), 50);
}

function cerrarModal() {
  const modal = document.getElementById('modal');
  if (!modal.classList.contains('visible')) return;
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  document.activeElement && document.activeElement.blur();
  const fn = alCerrarModal;
  alCerrarModal = null;
  if (fn) fn();
}

document.getElementById('modal-boton').addEventListener('click', cerrarModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    if (instruccionesVisibles()) cerrarInstrucciones();
    else cerrarModal();
  }
});

/* ---------- Controles táctiles ---------- */
if (AUTO_SALTO) {
  document.querySelector('.btn-tactil.saltar').style.display = 'none';
  document.querySelector('.ayuda').textContent = '← → para moverte · el atleta salta solo';
}

document.querySelectorAll('.btn-tactil').forEach(btn => {
  const accion = btn.dataset.accion;
  const presionar = (e) => {
    e.preventDefault();
    btn.classList.add('activo');
    if (accion === 'jump') tactil.saltoPedido = true;
    else tactil[accion] = true;
  };
  const soltar = (e) => {
    e.preventDefault();
    btn.classList.remove('activo');
    if (accion !== 'jump') tactil[accion] = false;
  };
  btn.addEventListener('pointerdown', presionar);
  btn.addEventListener('pointerup', soltar);
  btn.addEventListener('pointerleave', soltar);
  btn.addEventListener('pointercancel', soltar);
});

/* =========================================================
   CONFIGURACIÓN DE PHASER
   ========================================================= */
window.juego = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: ANCHO,
  height: ALTO,
  backgroundColor: '#38bdf8',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1100 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [Juego]
});
