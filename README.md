# Framework E2E — Simulador de Crédito Banco Pichincha

Automatización E2E del Simulador de Crédito de Banco Pichincha implementada con **Playwright + TypeScript**.

---

## Stack Tecnológico

| Herramienta | Versión | Propósito |
|---|---|---|
| Node.js | 25.9.0 | Runtime |
| TypeScript | ^5.4.0 | Lenguaje tipado |
| Playwright | ^1.44.0 | Framework E2E |
| Allure Playwright | ^3.0.0 | Reportes profesionales |

---

## Estructura del Proyecto

```
e2e-pichincha/
├── pages/
│   └── SimuladorPage.ts              # Page Object Model del simulador
├── tests/
│   ├── flujo1-preciso.spec.ts        # Flujo 1: Crédito PRECISO
│   ├── flujo2-hipotecario.spec.ts    # Flujo 2: Crédito HIPOTECARIO VIVIENDA
│   ├── flujo3-validaciones.spec.ts   # Flujo 3: Validaciones de formulario
│   ├── flujo4-calculos.spec.ts       # Flujo 4: Cálculos financieros
│   ├── flujo5-comparacion.spec.ts    # Flujo 5: Comparación de productos
│   └── flujo6-responsive.spec.ts     # Flujo 6: Responsive Design y Usabilidad
├── fixtures/
│   └── testData.ts                   # Datos de prueba centralizados
├── helpers/
│   └── utils.ts                      # Utilidades anti-flakiness
├── playwright.config.ts              # Configuración principal
├── tsconfig.json
└── package.json
```

---

## Requisitos Previos

- **Node.js 18+** — https://nodejs.org
- **npm 10+** — incluido con Node.js

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/reto-automatizacion-e2e.git
cd e2e-pichincha

# 2. Instalar dependencias
npm install

# 3. Instalar browsers de Playwright
npx playwright install

# 4. Instalar Allure CLI (opcional, para reportes visuales)
npm install -g allure-commandline
```

---

## Ejecución de Tests

### Todos los flujos (headless)
```bash
npm test
# equivalente a:
npx playwright test --project=chromium
```

### Todos los flujos con navegador visible
```bash
npm run test:headed
# equivalente a:
npx playwright test --headed --project=chromium
```

### Flujo específico con navegador visible
```bash
npx playwright test tests/flujo1-preciso.spec.ts --headed --project=chromium
npx playwright test tests/flujo2-hipotecario.spec.ts --headed --project=chromium
npx playwright test tests/flujo3-validaciones.spec.ts --headed --project=chromium
npx playwright test tests/flujo4-calculos.spec.ts --headed --project=chromium
npx playwright test tests/flujo5-comparacion.spec.ts --headed --project=chromium
npx playwright test tests/flujo6-responsive.spec.ts --headed --project=chromium
```

### Flujo específico sin navegador visible (headless)
```bash
npx playwright test tests/flujo1-preciso.spec.ts --project=chromium
```

### Correr en múltiples browsers
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile-chrome
```

### Modo debug (paso a paso)
```bash
npm run test:debug
# equivalente a:
npx playwright test --debug
```

### Interfaz visual de Playwright (recomendado para desarrollo)
```bash
npm run test:ui
# equivalente a:
npx playwright test --ui
```

### Ver reporte HTML nativo
```bash
npx playwright show-report
```

### Generar reporte Allure
```bash
npm run allure:generate
npm run allure:open
# o en un solo comando:
npm run report
```

---

## Flujos Implementados

| Flujo | Descripción | Estado |
|---|---|---|
| Flujo 1 | Simulación completa Crédito PRECISO | ✅ |
| Flujo 2 | Simulación completa Crédito HIPOTECARIO VIVIENDA | ✅ |
| Flujo 3 | Validaciones de formularios financieros | ✅ |
| Flujo 4 | Validación de cálculos financieros | ✅ |
| Flujo 5 | Comparación de productos (Consumo vs Hipotecario) | ✅ |
| Flujo 6 | Responsive Design y Usabilidad (4 resoluciones) | ✅ |

**Total: 6 flujos E2E completos** — cada flujo simula el recorrido completo de un usuario real en una sola sesión de browser.

---

## Evidencias Visuales

Generadas automáticamente al correr los tests:

```
test-results/          # Screenshots en fallos y pasos críticos
playwright-report/     # Reporte HTML nativo de Playwright
allure-results/        # Datos crudos para Allure
allure-report/         # Reporte HTML generado por Allure
```

La configuración en `playwright.config.ts` habilita:
- `video: 'on'` — graba video de cada flujo completo
- `screenshot: 'only-on-failure'` — screenshot automático en fallos
- `trace: 'on'` — trace completo para debugging

Para ver un trace:
```bash
npx playwright show-trace test-results/[nombre-del-trace].zip
```

---

## Arquitectura de Diseño

### Page Object Model (POM)
Todos los selectores y métodos de interacción están encapsulados en `SimuladorPage.ts`. Los tests nunca interactúan directamente con el DOM — esto facilita el mantenimiento cuando el sitio cambia.

### Manejo de iframe + Shadow DOM
El simulador es una **Micro Frontend Angular** cargada en un iframe con componentes Stencil que usan Shadow DOM abierto:
- `page.frameLocator('iframe').first()` — acceso al contenido del iframe
- Selectores por `formcontrolname` para inputs dentro del Shadow DOM
- `pichincha-input nth(0/1)` para campos por posición en formularios multi-campo

### Anti-flakiness
- `waitForNetworkIdle` con `.catch()` tolerante — el sitio tiene peticiones de analytics continuas
- Esperas explícitas con `waitFor` en lugar de `waitForTimeout` fijos
- `retries: 1` configurado en Playwright para absorber flakiness de red
- `test.setTimeout(120000)` en flujos con múltiples navegaciones

### Datos de Prueba Centralizados
Todos los datos viven en `fixtures/testData.ts`. El cambio de un valor se propaga a todos los tests que lo referencian.

---

## Hallazgos y Conclusiones

### Desafíos Técnicos Encontrados

**1. Micro Frontend con iframe cross-origin**
El simulador se carga desde `/mfa/credit-simulator/` en un iframe con origen diferente al de la página principal. Esto bloqueó el acceso al DOM desde DevTools y requirió usar `frameLocator` de Playwright. Fue el principal obstáculo técnico del ejercicio — los selectores CSS convencionales simplemente no funcionaban.

**2. Web Components con Shadow DOM**
Los componentes `pichincha-dropdown`, `pichincha-input` y `pichincha-button` son Stencil Web Components con Shadow DOM abierto. Los métodos estándar de Playwright como `pierce/` no penetran el Shadow DOM correctamente dentro de un iframe. La solución fue usar los atributos `formcontrolname` como identificadores únicos y acceder a los inputs nativos directamente con `locator('input').first()`.

**3. Opciones de plazo en formato texto descriptivo**
El dropdown de plazo usa texto como "3 meses", "1 año", "2 años y 6 meses" en lugar de valores numéricos. Se implementó la función `mesesALabel()` en el `SimuladorPage` que convierte automáticamente meses a su representación textual, evitando hardcodear strings en cada test.

**4. Botón Simular con validación de formulario**
El botón "Simular" permanece `disabled` hasta que todos los campos obligatorios están completos. El formulario HIPOTECARIO requiere 2 campos de monto (valor vivienda + monto préstamo) mientras que PRECISO solo requiere 1. Ignorar esto dejaba el botón disabled y causaba timeouts en los tests.

**5. NetworkIdle no confiable en sitios bancarios**
El sitio mantiene peticiones de analytics, tracking y monitoreo continuas que impiden que `networkidle` se resuelva dentro del timeout. Se implementó con `.catch()` para que sea tolerante a este comportamiento sin afectar la ejecución de los tests.

**6. Flakiness por timing de Angular**
La Micro Frontend Angular tarda en hidratarse después de que el networkidle dispara. La solución fue esperar texto visible en el body con `waitForFunction` en lugar de esperar elementos específicos del DOM, ya que el texto renderizado es el indicador más confiable de que Angular completó su inicialización.

### Decisiones Técnicas

- **Playwright sobre Cypress y Serenity**: Mejor manejo nativo de iframes, Shadow DOM, y sitios con protecciones anti-bot. Videos, traces y screenshots nativos sin plugins adicionales. Soporte multi-browser incluido.
- **TypeScript**: El tipado fuerte previene errores en selectores y datos de prueba, especialmente útil en un POM con múltiples métodos y locators.
- **Un test E2E por flujo**: Cada flujo es un test completo que simula exactamente el comportamiento de un usuario real, navegando una sola vez. Esto reduce el tiempo total de ejecución significativamente vs. múltiples tests pequeños.
- **frameLocator sobre page.evaluate**: `frameLocator` es la API oficial de Playwright para iframes y produce selectores más legibles y mantenibles que manipular el DOM con JavaScript directamente.

### Cobertura Lograda

- ✅ Happy path completo de PRECISO e HIPOTECARIO VIVIENDA
- ✅ Validaciones de formulario (valores negativos, texto en numérico, límites, campos requeridos)
- ✅ Principios financieros (mayor plazo = menor cuota, mayor monto = mayor cuota, consistencia)
- ✅ Comparación entre productos con mismas condiciones (tasas y requisitos)
- ✅ Responsive design verificado en 4 resoluciones (1920, 1280, 768, 375px)
- ✅ Evidencias visuales: screenshots por paso, videos por flujo, traces para debugging
- ✅ Anti-flakiness: retries, esperas inteligentes, tolerancia a networkidle
